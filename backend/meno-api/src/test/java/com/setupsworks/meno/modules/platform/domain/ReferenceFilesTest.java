package com.setupsworks.meno.modules.platform.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.StringReader;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

/** PLT-22 file rules without a database: CSV quoting, PIN aggregation, state matching, IFSC checks. */
class ReferenceFilesTest {

    private static final Map<String, String> STATES = Map.of("Tamil Nadu", "33", "Delhi", "07",
            "Dadra and Nagar Haveli and Daman and Diu", "26");

    private static CsvReader csv(String text) {
        return new CsvReader(new StringReader(text));
    }

    @Test
    void csvHandlesBomQuotesEmbeddedCommasAndLineBreaks() {
        CsvReader r = csv("﻿a,b,c\r\n\"x, y\",\"say \"\"hi\"\"\",\"two\nlines\"\n\n1,2,3");
        assertThat(r.next()).containsExactly("a", "b", "c");
        assertThat(r.next()).containsExactly("x, y", "say \"hi\"", "two\nlines");
        assertThat(r.line()).isEqualTo(2);
        assertThat(r.next()).containsExactly("1", "2", "3");
        assertThat(r.line()).isEqualTo(5);
        assertThat(r.next()).isNull();
    }

    @Test
    void pincodeRowsAreGroupedPerPinWithLocalitiesAndTheMostCommonDistrict() {
        PincodeFile.Result result = PincodeFile.parse(csv("""
                CircleName,RegionName,DivisionName,OfficeName,Pincode,OfficeType,Delivery,District,StateName
                Tamilnadu,Chennai,Chennai City North,Anna Nagar S.O,600040,S.O,Delivery,CHENNAI,TAMIL NADU
                Tamilnadu,Chennai,Chennai City North,Anna Nagar East B.O,600040,B.O,Delivery,CHENNAI,Tamil Nadu
                Tamilnadu,Chennai,Chennai City North,Odd Row B.O,600040,B.O,Delivery,TIRUVALLUR,TAMIL NADU
                Delhi,Delhi,New Delhi,Connaught Place H.O,110001,H.O,Delivery,NEW DELHI,DELHI
                Dnh,Dnh,Silvassa,Silvassa S.O,396230,S.O,Delivery,DADRA & NAGAR HAVELI,THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU
                X,X,X,Bad Pin B.O,060001,B.O,Delivery,X,DELHI
                X,X,X,Nowhere B.O,500001,B.O,Delivery,X,ATLANTIS
                """), STATES);

        assertThat(result.rows()).containsExactly(
                new PincodeFile.Row("600040", "33", "Chennai", List.of("Anna Nagar", "Anna Nagar East", "Odd Row")),
                new PincodeFile.Row("110001", "07", "New Delhi", List.of("Connaught Place")),
                new PincodeFile.Row("396230", "26", "Dadra & Nagar Haveli", List.of("Silvassa")));
        assertThat(result.report().rowsRead()).isEqualTo(7);
        assertThat(result.report().rowsSkipped()).isEqualTo(2);
        assertThat(result.report().samples()).extracting(ReferenceFile.Problem::line).containsExactly(7, 8);
        assertThat(result.report().reasons()).containsEntry("Unknown state '…'", 1);
    }

    @Test
    void pincodeFileWithoutRequiredColumnsIsRefusedWithTheirNames() {
        assertThatThrownBy(() -> PincodeFile.parse(csv("OfficeName,Pincode\nA,600001\n"), STATES))
                .isInstanceOfSatisfying(ReferenceFile.MissingColumns.class,
                        e -> assertThat(e.missing()).containsExactly("district", "state"));
    }

    @Test
    void ifscRowsAreCheckedAndTheFirstOfARepeatWins() {
        IfscFile.Result result = IfscFile.parse(csv("""
                BANK,IFSC,BRANCH,CENTRE,DISTRICT,STATE,ADDRESS
                State Bank of India,sbin0000001,KOLKATA MAIN,KOLKATA,KOLKATA,WEST BENGAL,"1 Strand Road, Kolkata"
                State Bank of India,SBIN0000001,DUPLICATE,KOLKATA,KOLKATA,WEST BENGAL,x
                Test Bank,TEST1000001,Bad Ifsc,X,X,X,x
                ,HDFC0000001,No Bank,X,X,X,x
                """));
        assertThat(result.rows()).containsExactly(new IfscFile.Row("SBIN0000001", "State Bank of India",
                "KOLKATA MAIN", "1 Strand Road, Kolkata", "KOLKATA", "KOLKATA", "WEST BENGAL"));
        assertThat(result.report().rowsSkipped()).isEqualTo(3);
    }

    @Test
    void stateNamesCompareByLettersOnly() {
        assertThat(PincodeFile.stateKey("THE DADRA & NAGAR HAVELI AND DAMAN & DIU"))
                .isEqualTo(PincodeFile.stateKey("Dadra and Nagar Haveli and Daman and Diu"));
    }

    @Test
    void onlineOfficesUseTheSameRulesAsFileRows() {
        var row = PincodeFile.fromOffices("110001", List.of(
                new PincodeFile.Office("Baroda House", "Central Delhi", "Delhi"),
                new PincodeFile.Office("Connaught Place H.O", "Central Delhi", "DELHI"),
                new PincodeFile.Office("Elsewhere B.O", "New Delhi", "Delhi"),
                new PincodeFile.Office("Lost S.O", "X", "Atlantis")), STATES);

        assertThat(row).hasValueSatisfying(r -> {
            assertThat(r.stateCode()).isEqualTo("07");
            assertThat(r.district()).isEqualTo("Central Delhi");
            assertThat(r.localities()).containsExactly("Baroda House", "Connaught Place", "Elsewhere");
        });
    }

    @Test
    void onlineOfficesWithNoKnownStateOrABadPinGiveNothing() {
        assertThat(PincodeFile.fromOffices("500001", List.of(new PincodeFile.Office("A", "B", "Atlantis")), STATES))
                .isEmpty();
        assertThat(PincodeFile.fromOffices("060001", List.of(new PincodeFile.Office("A", "B", "Delhi")), STATES))
                .isEmpty();
        assertThat(PincodeFile.fromOffices("110001", List.of(), STATES)).isEmpty();
    }
}
