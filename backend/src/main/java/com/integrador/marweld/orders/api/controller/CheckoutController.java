package com.integrador.marweld.orders.api.controller;

import com.integrador.marweld.core.api.ApiResponse;
import com.integrador.marweld.orders.api.request.CheckoutRequest;
import com.integrador.marweld.orders.api.response.CheckoutResponse;
import com.integrador.marweld.orders.application.command.CheckoutCommand;
import com.integrador.marweld.orders.application.result.CheckoutResult;
import com.integrador.marweld.orders.application.usecase.CheckoutUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    private final CheckoutUseCase checkoutUseCase;

    public CheckoutController(CheckoutUseCase checkoutUseCase) {
        this.checkoutUseCase = checkoutUseCase;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CheckoutRequest request) {
        CheckoutResult result = checkoutUseCase.checkout(jwt.getSubject(), new CheckoutCommand(
                request.items().stream().map(item -> new CheckoutCommand.Item(item.productoPublicId(), item.cantidad())).toList(),
                request.modalidadEntrega(), request.nombreRecibe(), request.telefono(), request.direccion(),
                request.distrito(), request.referencia(), request.correo()));
        CheckoutResponse response = new CheckoutResponse(result.orderPublicId(), result.paymentPublicId(),
                result.paymentApproved(), result.orderStatus(), result.paymentStatus(), result.total(),
                result.paymentApproved() ? "Pago aprobado y pedido confirmado." : "El pago fue rechazado. No se realizó ningún cobro.");
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Checkout procesado.", response));
    }
}
