package com.integrador.marweld.orders.application.usecase;

import com.integrador.marweld.orders.application.command.CheckoutCommand;
import com.integrador.marweld.orders.application.result.CheckoutResult;

public interface CheckoutUseCase {
    CheckoutResult checkout(String userPublicId, CheckoutCommand command);
}
