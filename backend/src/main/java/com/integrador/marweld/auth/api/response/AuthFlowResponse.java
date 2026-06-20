package com.integrador.marweld.auth.api.response;

public record AuthFlowResponse(String status, String accessToken, long expiresInSeconds,
                               AuthenticatedUserResponse user, MfaChallengeResponse mfaChallenge) {}
