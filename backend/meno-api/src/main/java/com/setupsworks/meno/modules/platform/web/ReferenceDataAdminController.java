package com.setupsworks.meno.modules.platform.web;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.integrations.api.PincodeDirectory;
import com.setupsworks.meno.modules.platform.domain.ReferenceFile;
import com.setupsworks.meno.modules.platform.service.ReferenceDataService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Pattern;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** /platform/reference-data (PLT-22): list status and file loads. Needs platform.reference.view / .manage. */
@RestController
@RequestMapping(path = "/api/v1/platform/reference-data", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Platform", description = "MENO staff only (ADR-0020). Tenant tokens get 403 here.")
class ReferenceDataAdminController {

    private static final String PROBLEM = "application/problem+json";
    private static final String CODE = "^[A-Z_]{2,40}$";

    private final ReferenceDataService service;
    private final PincodeDirectory directory;

    ReferenceDataAdminController(ReferenceDataService service, PincodeDirectory directory) {
        this.service = service;
        this.directory = directory;
    }

    /**
     * status: NOT_LOADED, CURRENT, DUE (refresh is due), LATER (another module loads it in {@code phase}).
     * onlineLookup: for PINCODE, the online directory asked for PINs missing from the list ("postalpincode",
     * ADR-0021); null when lookups use the list only.
     */
    record ReferenceDataset(String code, String name, String description, String sourceName, String sourceUrl,
            String licence, String attribution, int refreshMonths, String ownerModule, String phase, boolean loadable,
            String status, int rowCount, LocalDate sourceDate, Instant loadedAt, String loadedByName,
            LocalDate dueOn, String onlineLookup) {
    }

    record ReferenceDatasetList(List<ReferenceDataset> items) {
    }

    record ReferenceProblem(int line, String reason) {
    }

    /** status: LOADED or REJECTED; reasonCode says why a file was refused (same codes as the error response). */
    record ReferenceLoad(UUID id, String datasetCode, String status, String fileName, String fileSha256, long fileBytes,
            LocalDate sourceDate, int rowsRead, int rowsLoaded, int rowsSkipped, String reasonCode,
            boolean replacedAnyway, String loadedByName, Instant startedAt, Instant finishedAt,
            List<ReferenceProblem> problems, Map<String, Integer> skippedByReason) {
    }

    record ReferenceLoadList(List<ReferenceLoad> items) {
    }

    @Operation(summary = "Reference lists with their refresh status")
    @GetMapping
    ReferenceDatasetList referenceDatasets() {
        return new ReferenceDatasetList(service.list().stream().map(this::view).toList());
    }

    @Operation(summary = "Last 20 load attempts of a list (loaded and refused)")
    @ApiResponse(responseCode = "200", description = "Found")
    @ApiResponse(responseCode = "404", description = "REFERENCE_DATASET_NOT_FOUND",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @GetMapping("/{code}/loads")
    ReferenceLoadList referenceLoads(@PathVariable @Pattern(regexp = CODE) String code) {
        return new ReferenceLoadList(service.loads(code).stream().map(ReferenceDataAdminController::view).toList());
    }

    @Operation(summary = "Load a new file for a list (replaces the whole list)",
            description = "CSV as the source publishes it (India Post PIN directory, RBI IFSC list). sourceDate is "
                    + "the publication date of the file. A file much smaller than today's list is refused unless "
                    + "replaceAnyway=true.")
    @ApiResponse(responseCode = "201", description = "Loaded")
    @ApiResponse(responseCode = "400", description = "REFERENCE_FILE_COLUMNS_MISSING, REFERENCE_FILE_NO_ROWS, "
            + "REFERENCE_FILE_EMPTY, REFERENCE_FILE_UNREADABLE, REFERENCE_SOURCE_DATE_FUTURE",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "403", description = "COMMON_PERMISSION_DENIED (needs platform.reference.manage)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "409", description = "REFERENCE_LOAD_SHRINKS, REFERENCE_DATASET_NOT_LOADABLE",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping(path = "/{code}/loads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    ReferenceLoad loadReferenceFile(@PathVariable @Pattern(regexp = CODE) String code, @RequestPart("file") MultipartFile file,
            @RequestParam("sourceDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sourceDate,
            @RequestParam(name = "replaceAnyway", defaultValue = "false") boolean replaceAnyway) {
        try {
            return view(service.load(code, new ReferenceDataService.Upload(file.getOriginalFilename(),
                    file.getSize(), file.getInputStream()), sourceDate, replaceAnyway));
        } catch (IOException e) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "REFERENCE_FILE_UNREADABLE", "Couldn't read the file.");
        } catch (UncheckedIOException e) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "REFERENCE_FILE_UNREADABLE", "Couldn't read the file.");
        }
    }

    private ReferenceDataset view(ReferenceDataService.Dataset d) {
        com.setupsworks.meno.modules.platform.domain.ReferenceDataset r = d.row();
        return new ReferenceDataset(r.getCode(), r.getName(), r.getDescription(), r.getSourceName(), r.getSourceUrl(),
                r.getLicence(), r.getAttribution(), r.getRefreshMonths(), r.getOwnerModule(), r.getPhase(),
                r.isLoadable(), d.status().name(), r.getRowCount(), r.getSourceDate(), r.getLoadedAt(),
                d.loadedByName(), d.dueOn(),
                "PINCODE".equals(r.getCode()) && !"none".equals(directory.source()) ? directory.source() : null);
    }

    private static ReferenceLoad view(ReferenceDataService.Load l) {
        var r = l.row();
        List<ReferenceFile.Problem> samples = l.problems().samples() == null ? List.of() : l.problems().samples();
        return new ReferenceLoad(r.id(), r.datasetCode(), r.status(), r.fileName(), r.fileSha256(), r.fileBytes(),
                r.sourceDate(), r.rowsRead(), r.rowsLoaded(), r.rowsSkipped(), r.reasonCode(), r.replacedAnyway(),
                r.loadedByName(), r.startedAt(), r.finishedAt(),
                samples.stream().map(p -> new ReferenceProblem(p.line(), p.reason())).toList(),
                l.problems().reasons() == null ? Map.of() : l.problems().reasons());
    }
}
