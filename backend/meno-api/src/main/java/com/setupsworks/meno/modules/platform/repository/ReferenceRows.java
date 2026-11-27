package com.setupsworks.meno.modules.platform.repository;

import java.sql.Array;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.platform.api.ReferenceLookup;
import com.setupsworks.meno.modules.platform.domain.IfscFile;
import com.setupsworks.meno.modules.platform.domain.PincodeFile;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Bulk writes and lookups on the list tables (ref_pincode, ref_ifsc) and the load history. Plain JDBC: a list is
 * ~150 000 rows, replaced whole inside the caller's transaction, so readers see the old list until it commits.
 */
@Repository
public class ReferenceRows {

    private static final int BATCH = 1000;

    private final JdbcTemplate jdbc;

    ReferenceRows(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** GST state code by state name, current states first so a renamed state's old row never wins. */
    public Map<String, String> stateCodesByName() {
        Map<String, String> byName = new LinkedHashMap<>();
        jdbc.query("select name, code from state order by (effective_to is null) asc, sort_order",
                rs -> {
                    byName.put(rs.getString("name"), rs.getString("code"));
                });
        return byName;
    }

    public int countPincodes() {
        return jdbc.queryForObject("select count(*) from ref_pincode", Integer.class);
    }

    public int countIfsc() {
        return jdbc.queryForObject("select count(*) from ref_ifsc", Integer.class);
    }

    public void replacePincodes(List<PincodeFile.Row> rows) {
        jdbc.update("delete from ref_pincode");
        for (int from = 0; from < rows.size(); from += BATCH) {
            List<PincodeFile.Row> chunk = rows.subList(from, Math.min(from + BATCH, rows.size()));
            jdbc.batchUpdate("insert into ref_pincode (pincode, state_code, district, localities) values (?, ?, ?, ?)",
                    chunk, chunk.size(), (PreparedStatement ps, PincodeFile.Row r) -> {
                        ps.setString(1, r.pincode());
                        ps.setString(2, r.stateCode());
                        ps.setString(3, r.district());
                        Array localities = ps.getConnection().createArrayOf("text", r.localities().toArray());
                        ps.setArray(4, localities);
                    });
        }
    }

    public void replaceIfsc(List<IfscFile.Row> rows) {
        jdbc.update("delete from ref_ifsc");
        for (int from = 0; from < rows.size(); from += BATCH) {
            List<IfscFile.Row> chunk = rows.subList(from, Math.min(from + BATCH, rows.size()));
            jdbc.batchUpdate("""
                    insert into ref_ifsc (ifsc, bank, branch, address, city, district, state)
                    values (?, ?, ?, ?, ?, ?, ?)""", chunk, chunk.size(), (PreparedStatement ps, IfscFile.Row r) -> {
                ps.setString(1, r.ifsc());
                ps.setString(2, r.bank());
                ps.setString(3, r.branch());
                ps.setString(4, r.address());
                ps.setString(5, r.city());
                ps.setString(6, r.district());
                ps.setString(7, r.state());
            });
        }
    }

    public Optional<ReferenceLookup.Pincode> pincode(String pincode) {
        return jdbc.query("select pincode, state_code, district, localities from ref_pincode where pincode = ?",
                (rs, i) -> new ReferenceLookup.Pincode(rs.getString("pincode"), rs.getString("state_code"),
                        rs.getString("district"), Arrays.asList((String[]) rs.getArray("localities").getArray())),
                pincode).stream().findFirst();
    }

    public Optional<ReferenceLookup.Ifsc> ifsc(String ifsc) {
        return jdbc.query("select ifsc, bank, branch, address, city, district, state from ref_ifsc where ifsc = ?",
                (rs, i) -> new ReferenceLookup.Ifsc(rs.getString("ifsc"), rs.getString("bank"),
                        rs.getString("branch"), rs.getString("address"), rs.getString("city"),
                        rs.getString("district"), rs.getString("state")),
                ifsc).stream().findFirst();
    }

    /** One import attempt, loaded or rejected: who, when, which file (by hash), and what was skipped. */
    public record Load(UUID id, String datasetCode, String status, String fileName, String fileSha256, long fileBytes,
            LocalDate sourceDate, int rowsRead, int rowsLoaded, int rowsSkipped, String reasonCode,
            String problemsJson, boolean replacedAnyway, UUID loadedBy, String loadedByName, Instant startedAt,
            Instant finishedAt) {
    }

    public void insertLoad(Load l) {
        jdbc.update("""
                insert into reference_dataset_load (id, dataset_code, status, file_name, file_sha256, file_bytes,
                    source_date, rows_read, rows_loaded, rows_skipped, reason_code, problems, replaced_anyway,
                    loaded_by, started_at, finished_at)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, cast(? as jsonb), ?, ?, ?, ?)""",
                l.id(), l.datasetCode(), l.status(), l.fileName(), l.fileSha256(), l.fileBytes(), l.sourceDate(),
                l.rowsRead(), l.rowsLoaded(), l.rowsSkipped(), l.reasonCode(), l.problemsJson(), l.replacedAnyway(),
                l.loadedBy(), Timestamp.from(l.startedAt()), Timestamp.from(l.finishedAt()));
    }

    public List<Load> recentLoads(String datasetCode, int limit) {
        return jdbc.query("""
                select l.*, u.full_name from reference_dataset_load l
                  left join platform_user u on u.id = l.loaded_by
                 where l.dataset_code = ? order by l.started_at desc limit ?""",
                (rs, i) -> new Load(rs.getObject("id", UUID.class), rs.getString("dataset_code"),
                        rs.getString("status"), rs.getString("file_name"), rs.getString("file_sha256"),
                        rs.getLong("file_bytes"), rs.getObject("source_date", LocalDate.class), rs.getInt("rows_read"),
                        rs.getInt("rows_loaded"), rs.getInt("rows_skipped"), rs.getString("reason_code"),
                        rs.getString("problems"), rs.getBoolean("replaced_anyway"),
                        rs.getObject("loaded_by", UUID.class), rs.getString("full_name"),
                        rs.getTimestamp("started_at").toInstant(), rs.getTimestamp("finished_at").toInstant()),
                datasetCode, limit);
    }
}
