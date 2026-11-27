package com.setupsworks.meno.modules.integrations.pincode;

import java.net.http.HttpClient;
import java.util.List;

import com.setupsworks.meno.modules.integrations.api.PincodeDirectory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * api.postalpincode.in (ADR-0021): {@code GET /pincode/{pin}} answers HTTP 200 with
 * {@code [{"Status":"Success"|"Error","PostOffice":[…]|null}]}. "Error" or no offices → unknown PIN (empty);
 * timeout, HTTP error or an unreadable body → {@link PincodeLookupException}.
 */
class PostalPincodeAdapter implements PincodeDirectory {

    private static final Logger log = LoggerFactory.getLogger(PostalPincodeAdapter.class);

    private final RestClient http;

    PostalPincodeAdapter(PincodeProviderProperties properties) {
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(properties.timeout()).build());
        factory.setReadTimeout(properties.timeout());
        this.http = RestClient.builder().baseUrl(properties.baseUrl()).requestFactory(factory).build();
    }

    @Override
    public String source() {
        return "postalpincode";
    }

    @Override
    public List<PostOffice> postOffices(String pincode) {
        Answer[] answers;
        try {
            answers = http.get()
                    .uri("/pincode/{pin}", pincode)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        throw new PincodeLookupException("Directory answered HTTP " + res.getStatusCode().value());
                    })
                    .body(Answer[].class);
        } catch (PincodeLookupException e) {
            log.warn("PIN directory failed: {}", e.getMessage());
            throw e;
        } catch (ResourceAccessException e) {
            log.warn("PIN directory timed out or unreachable: {}", e.getMessage());
            throw new PincodeLookupException("Directory unreachable");
        } catch (RestClientException e) {
            log.warn("PIN directory returned an unreadable answer: {}", e.getMessage());
            throw new PincodeLookupException("Directory answer unreadable");
        }
        if (answers == null || answers.length == 0 || !"Success".equalsIgnoreCase(answers[0].Status())
                || answers[0].PostOffice() == null) {
            return List.of();
        }
        return answers[0].PostOffice().stream()
                .filter(o -> pincode.equals(o.Pincode()))
                .map(o -> new PostOffice(o.Name(), o.District(), o.State()))
                .toList();
    }

    // Provider JSON (field names as the provider sends them).
    record Answer(String Status, List<Office> PostOffice) {
    }

    record Office(String Name, String District, String State, String Pincode) {
    }
}
