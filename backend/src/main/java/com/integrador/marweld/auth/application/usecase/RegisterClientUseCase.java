package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.RegisterCommand;
import com.integrador.marweld.auth.application.result.RegisterResult;

public interface RegisterClientUseCase {
    RegisterResult handle(RegisterCommand command);
}
