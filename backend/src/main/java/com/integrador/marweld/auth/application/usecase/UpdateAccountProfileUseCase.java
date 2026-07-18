package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.UpdateAccountProfileCommand;
import com.integrador.marweld.auth.application.result.AccountProfileResult;

public interface UpdateAccountProfileUseCase {
    AccountProfileResult updateAccountProfile(String userPublicId, UpdateAccountProfileCommand command);
}
