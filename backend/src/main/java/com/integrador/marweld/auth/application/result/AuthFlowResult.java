package com.integrador.marweld.auth.application.result;

public record AuthFlowResult(String status, String accessToken, long expiresInSeconds,
                             AuthenticatedUserResult user, MfaChallengeResult mfaChallenge,
                             String refreshToken) {
    public static AuthFlowResult mfaRequired(MfaChallengeResult challenge) {
        return new AuthFlowResult("MFA_REQUIRED", null, 0, null, challenge, null);
    }
}
