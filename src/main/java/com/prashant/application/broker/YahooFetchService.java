package com.prashant.application.broker;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.vaadin.hilla.exception.EndpointException;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.DecimalFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class YahooFetchService {

    private final RestTemplate restTemplate;

    public YahooFetchService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private static final DecimalFormat df = new DecimalFormat("0.000");

    public List<StockDataRecord> fetchSockData(String stockName, String range, String interval) {
        List<StockDataRecord> stockDataRecordList = new ArrayList<>();
        try {
            log.info("Request came to fetchDataFromApi with stockName :: {}, range :: {}, interval :: {} ", stockName,
                    range, interval);
            String url = String.format(Constant.YAHOO_FINANCE_URL, stockName, interval, range);
            String stockData = fetchData(url);
            JsonObject stockDataJson = JsonParser.parseString(stockData).getAsJsonObject();
            JsonObject jsonChart = stockDataJson.has(Constant.CHART)
                    ? stockDataJson.get(Constant.CHART).getAsJsonObject()
                    : null;
            if (jsonChart == null) {
                log.error("chart is not available in response");
            }
            JsonArray arrayStockData = jsonChart.get(Constant.RESULT).getAsJsonArray();
            JsonObject data = arrayStockData.get(0).getAsJsonObject();
            JsonArray timeStamp = data.get(Constant.TIMESTAMP).getAsJsonArray();
            JsonObject indicators = data.get(Constant.INDICATORS).getAsJsonObject();
            JsonArray quote = indicators.get(Constant.QUOTE).getAsJsonArray();
            JsonArray adjCloseArray = indicators.get("adjclose").getAsJsonArray();
            JsonArray adjClose = adjCloseArray.get(0).getAsJsonObject().get("adjclose").getAsJsonArray();
            JsonArray high = quote.get(0).getAsJsonObject().get(Constant.HIGH).getAsJsonArray();
            JsonArray low = quote.get(0).getAsJsonObject().get(Constant.LOW).getAsJsonArray();
            JsonArray open = quote.get(0).getAsJsonObject().get(Constant.OPEN).getAsJsonArray();
            JsonArray close = quote.get(0).getAsJsonObject().get(Constant.CLOSE).getAsJsonArray();
            JsonArray volume = quote.get(0).getAsJsonObject().get(Constant.VOLUME).getAsJsonArray();
            for (int i = 0; i < timeStamp.size(); i++) {
                Double openD = null;
                Double highD = null;
                Double lowD = null;
                Double closeD = null;
                Double adjCloseD = null;
                Double volumeD = null;
                if (!open.get(i).isJsonNull() && open.get(i) != null) {
                    openD = Double.parseDouble(df.format(open.get(i).getAsDouble()));
                }
                if (!high.get(i).isJsonNull() && high.get(i) != null) {
                    highD = Double.parseDouble(df.format(high.get(i).getAsDouble()));
                }
                if (!low.get(i).isJsonNull() && low.get(i) != null) {
                    lowD = Double.parseDouble(df.format(low.get(i).getAsDouble()));
                }
                if (!close.get(i).isJsonNull() && close.get(i) != null) {
                    closeD = Double.parseDouble(df.format(close.get(i).getAsDouble()));
                }
                if (!volume.get(i).isJsonNull() && volume.get(i) != null) {
                    volumeD = Double.parseDouble(df.format(volume.get(i).getAsDouble()));
                }
                if (!adjClose.get(i).isJsonNull() && adjClose.get(i) != null) {
                    adjCloseD = Double.parseDouble(df.format(adjClose.get(i).getAsDouble()));
                }
                if (openD != null && highD != null && lowD != null && closeD != null) {
                    StockDataRecord stockDataRecord = new StockDataRecord(
                            convertUnixTimeToDate(timeStamp.get(i).getAsLong()),
                            highD,
                            lowD,
                            openD,
                            closeD,
                            adjCloseD,
                            volumeD);
                    stockDataRecordList.add(stockDataRecord);
                }
            }
            log.info("timestamp:: {}, high:: {}, low :: {} ,open:: {}, close :: {} ,volume :: {}", timeStamp.size(),
                    high.size(), low.size(), open.size(), close.size(), volume.size());
        } catch (Exception e) {
            log.error("Error occurred in fetchDataFromApi error message:: {}", e.getMessage());
        }
        return stockDataRecordList;

    }

    private String fetchData(String url) {
        String result = null;
        log.info("***** Calling api with url:: {} *****", url);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            headers.set("User-Agent", "Mozilla/5.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> resultEntity = restTemplate.exchange(url,
                    HttpMethod.GET, entity, String.class);
            result = resultEntity.getBody();
            if (!resultEntity.getStatusCode().is2xxSuccessful()) {
                log.error("===============fetch data api call is failed ===============");
                throw new EndpointException("Fetch Data api failed");
            }
        } catch (Exception e) {
            log.error("Error occurred in fetchData error message:: {}", e.getMessage());
            throw new EndpointException("fetchData method is failed");
        }
        return result;
    }

    public static LocalDate convertUnixTimeToDate(long unixTime) {
        return Instant.ofEpochSecond(unixTime)
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
    }

}
