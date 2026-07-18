package com.integrador.marweld.orders.application.usecase;

import com.integrador.marweld.orders.application.result.OrderDetailResult;
import com.integrador.marweld.orders.application.result.OrderSummaryResult;

import java.util.List;
import java.util.UUID;

public interface GetCustomerOrdersUseCase {
    List<OrderSummaryResult> getOrders(String userPublicId);
    OrderDetailResult getOrder(String userPublicId, UUID orderPublicId);
}
