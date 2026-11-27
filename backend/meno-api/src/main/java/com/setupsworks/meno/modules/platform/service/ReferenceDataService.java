package com.setupsworks.meno.modules.platform.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.common.persistence.Uuids;
import com.setupsworks.meno.modules.platform.domain.CsvReader;
import com.setupsworks.meno.modules.platform.domain.IfscFile;
import com.setupsworks.meno.modules.platform.domain.PincodeFile;
import com.setupsworks.meno.modules.platform.domain.ReferenceDataset;
import com.setupsworks.meno.modules.platform.domain.ReferenceFile;
import com.setupsworks.meno.modules.platform.repository.PlatformUserRepository;
import com.setupsworks.meno.modules.platform.repository.ReferenceDatasetRepository;
import com.setupsworks.meno.modules.platform.repository.ReferenceRows;
import com.setupsworks.meno.security.PlatformAccess;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import tools.jackson.databind.json.JsonMapper;

/**
 * /platform/reference-data (PLT-22): the lists with their refresh status, and loading a new file. A load replaces the
 * whole list in one transaction; every attempt, loaded or refused, is kept in reference_dataset_load.
 */
@Service
public class ReferenceDataService {

    private static final Logger log = LoggerFactory.getLogger(ReferenceDataService.class);
    static final String VIEW = "platform.reference.view";
    static final String MANAGE = "platform.reference.manage";
    private static final int HISTORY = 20;
    /** India: the "today" a source date is compared with. */
    private static final ZoneId INDIA = ZoneId.of("Asia/Kolkata");

    public record Dataset(ReferenceDataset row, ReferenceDataset.Status status, LocalDate dueOn, String loadedByName) {
    }

    public record Problems(List<ReferenceFile.Problem> samples, Map<String, Integer> reasons) {
    }

    public record Load(ReferenceRows.Load row, Problems problems) {
    }

    /** The uploaded file as the controller hands it over. */
    public record Upload(String fileName, long bytes, InputStream content) {
    }

    private final ReferenceDatasetRepository datasets;
    private final ReferenceRows rows;
    private final PlatformUserRepository users;
    private final PlatformAccess access;
    private final PlatformProperties properties;
    private final JsonMapper json;
    private final Clock clock;
    private final TransactionTemplate tx;

    ReferenceDataService(ReferenceDatasetRepository datasets, ReferenceRows rows, PlatformUserRepository users,
            PlatformAccess access, PlatformProperties properties, JsonMapper json, Clock clock,
            PlatformTransactionManager transactionManager) {
        this.datasets = datasets;
        this.rows = rows;
        this.users = users;
        this.access = access;
        this.properties = properties;
        this.json = json;
        this.clock = clock;
        this.tx = new TransactionTemplate(transactionManager);
    }

    public List<Dataset> list() {
        access.require(VIEW);
        LocalDate today = LocalDate.now(clock.withZone(INDIA));
        return tx.execute(s -> datasets.findAllByOrderBySortOrder().stream()
                .map(d -> new Dataset(d, d.status(today), d.dueOn(),
                        d.getLoadedBy() == null ? null : users.nameOf(d.getLoadedBy()).orElse(null)))
                .toList());
    }

    public List<Load> loads(String code) {
        access.require(VIEW);
        find(code);
        return tx.execute(s -> rows.recentLoads(code, HISTORY).stream().map(this::withProblems).toList());
    }

    /**
     * Reads, checks and swaps in a new file. Refused (and recorded) when required columns are missing, no row is
     * usable, or the list would shrink below {@code minRetainedRatio} of today's rows without "replace anyway".
     */
    public Load load(String code, Upload upload, LocalDate sourceDate, boolean replaceAnyway) {
        access.require(MANAGE);
        UUID by = access.requireUserId();
        ReferenceDataset dataset = find(code);
        if (!dataset.isLoadable()) {
            throw new MenoException(HttpStatus.CONFLICT, "REFERENCE_DATASET_NOT_LOADABLE",
                    dataset.getName() + " is loaded by the " + dataset.getOwnerModule() + " module from "
                            + dataset.getPhase() + ".");
        }
        if (sourceDate.isAfter(LocalDate.now(clock.withZone(INDIA)))) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "REFERENCE_SOURCE_DATE_FUTURE",
                    "The file's date can't be in the future.");
        }
        if (upload.bytes() == 0) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "REFERENCE_FILE_EMPTY", "The file is empty.");
        }
        Instant started = clock.instant();
        MessageDigest sha = sha256();
        Parsed parsed;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new DigestInputStream(upload.content(), sha), StandardCharsets.UTF_8.newDecoder()
                        .onMalformedInput(CodingErrorAction.REPLACE)
                        .onUnmappableCharacter(CodingErrorAction.REPLACE)), 1 << 16)) {
            parsed = parse(code, new CsvReader(reader));
            while (reader.read() != -1) {
                // Drain, so the hash covers the whole file.
            }
        } catch (ReferenceFile.MissingColumns e) {
            throw reject(dataset, upload, hex(sha), sourceDate, by, started, new ReferenceFile.Report(), false,
                    "REFERENCE_FILE_COLUMNS_MISSING", "The file has no " + String.join(", ", e.missing())
                            + " column. Upload the CSV as the source publishes it.")
                    .setProperty("missingColumns", e.missing());
        } catch (IOException | UncheckedIOException e) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "REFERENCE_FILE_UNREADABLE", "Couldn't read the file.");
        }
        String hash = hex(sha);
        if (parsed.count() == 0) {
            throw reject(dataset, upload, hash, sourceDate, by, started, parsed.report(), replaceAnyway,
                    "REFERENCE_FILE_NO_ROWS", "No usable rows in the file.");
        }
        int current = currentCount(code);
        if (!replaceAnyway && parsed.count() < current * properties.minRetainedRatio()) {
            throw reject(dataset, upload, hash, sourceDate, by, started, parsed.report(), false,
                    "REFERENCE_LOAD_SHRINKS", "This file has " + parsed.count() + " rows but the list has "
                            + current + " today. Check it is the full file, or replace anyway.")
                    .setProperty("rowsInFile", parsed.count()).setProperty("rowsToday", current);
        }
        ReferenceRows.Load load = record(dataset, upload, hash, sourceDate, by, started, parsed.report(),
                parsed.count(), replaceAnyway, "LOADED", null);
        tx.executeWithoutResult(s -> {
            parsed.replace().run();
            ReferenceDataset fresh = find(code);
            fresh.loaded(parsed.count(), sourceDate, load.finishedAt(), by);
            datasets.save(fresh);
            rows.insertLoad(load);
        });
        log.info("Reference list {} loaded: {} rows, {} skipped, by staff {}", code, parsed.count(),
                parsed.report().rowsSkipped(), by);
        return withProblems(load);
    }

    private record Parsed(int count, ReferenceFile.Report report, Runnable replace) {
    }

    private Parsed parse(String code, CsvReader csv) {
        return switch (code) {
            case "PINCODE" -> {
                PincodeFile.Result r = PincodeFile.parse(csv, tx.execute(s -> rows.stateCodesByName()));
                yield new Parsed(r.rows().size(), r.report(), () -> rows.replacePincodes(r.rows()));
            }
            case "IFSC" -> {
                IfscFile.Result r = IfscFile.parse(csv);
                yield new Parsed(r.rows().size(), r.report(), () -> rows.replaceIfsc(r.rows()));
            }
            default -> throw new MenoException(HttpStatus.CONFLICT, "REFERENCE_DATASET_NOT_LOADABLE",
                    "This list can't be loaded here yet.");
        };
    }

    private int currentCount(String code) {
        return tx.execute(s -> "PINCODE".equals(code) ? rows.countPincodes() : rows.countIfsc());
    }

    private MenoException reject(ReferenceDataset dataset, Upload upload, String hash, LocalDate sourceDate, UUID by,
            Instant started, ReferenceFile.Report report, boolean replaceAnyway, String reason, String message) {
        ReferenceRows.Load load = record(dataset, upload, hash, sourceDate, by, started, report, 0, replaceAnyway,
                "REJECTED", reason);
        tx.executeWithoutResult(s -> rows.insertLoad(load));
        log.info("Reference list {} file refused ({}) for staff {}", dataset.getCode(), reason, by);
        return new MenoException(reason.equals("REFERENCE_LOAD_SHRINKS") ? HttpStatus.CONFLICT
                : HttpStatus.BAD_REQUEST, reason, message).setProperty("loadId", load.id());
    }

    private ReferenceRows.Load record(ReferenceDataset dataset, Upload upload, String hash, LocalDate sourceDate,
            UUID by, Instant started, ReferenceFile.Report report, int loaded, boolean replaceAnyway, String status,
            String reason) {
        String problems = json.writeValueAsString(new Problems(report.samples(), report.reasons()));
        return new ReferenceRows.Load(Uuids.v7(), dataset.getCode(), status, safeName(upload.fileName()), hash,
                upload.bytes(), sourceDate, report.rowsRead(), loaded, report.rowsSkipped(), reason, problems,
                replaceAnyway, by, null, started, clock.instant());
    }

    private Load withProblems(ReferenceRows.Load row) {
        return new Load(row, json.readValue(row.problemsJson(), Problems.class));
    }

    private ReferenceDataset find(String code) {
        return tx.execute(s -> datasets.findById(code)).orElseThrow(() -> new MenoException(HttpStatus.NOT_FOUND,
                "REFERENCE_DATASET_NOT_FOUND", "There is no such reference list."));
    }

    /** Only the last path segment, printable characters, at most 255: it's shown back on the page. */
    static String safeName(String name) {
        String base = name == null || name.isBlank() ? "upload.csv" : name.replaceAll(".*[/\\\\]", "");
        base = base.replaceAll("[\\p{Cntrl}]", "").trim();
        if (base.isEmpty()) {
            base = "upload.csv";
        }
        return base.length() <= 255 ? base : base.substring(0, 255);
    }

    private static MessageDigest sha256() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String hex(MessageDigest sha) {
        return HexFormat.of().formatHex(sha.digest());
    }
}
