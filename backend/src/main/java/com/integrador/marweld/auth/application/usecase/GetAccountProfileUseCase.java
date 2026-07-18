package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.result.AccountProfileResult;

public interface GetAccountProfileUseCase {
    AccountProfileResult getAccountProfile(String userPublicId);
}
