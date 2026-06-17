package com.haihoan2874.techhub.util;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class VnPayUtilTest {

    @Test
    void getHashDataSortsParamsAndUsesFormUrlEncoding() {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_TxnRef", "ORD 123");
        params.put("vnp_OrderInfo", "Thanh toan don hang ORD 123");
        params.put("vnp_Amount", "100000");
        params.put("vnp_Empty", "");
        params.put("vnp_Null", null);

        assertThat(VnPayUtil.getHashData(params))
                .isEqualTo("vnp_Amount=100000"
                        + "&vnp_OrderInfo=Thanh+toan+don+hang+ORD+123"
                        + "&vnp_TxnRef=ORD+123");
    }

    @Test
    void getPaymentQueryStringEncodesFieldNamesAndValues() {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_OrderInfo", "Thanh toan don hang ORD 123");
        params.put("vnp_TxnRef", "ORD 123");

        assertThat(VnPayUtil.getPaymentQueryString(params))
                .isEqualTo("vnp_OrderInfo=Thanh+toan+don+hang+ORD+123&vnp_TxnRef=ORD+123");
    }

    @Test
    void hmacSHA512MatchesKnownTestVector() {
        assertThat(VnPayUtil.hmacSHA512("key", "The quick brown fox jumps over the lazy dog"))
                .isEqualTo("b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a");
    }
}
