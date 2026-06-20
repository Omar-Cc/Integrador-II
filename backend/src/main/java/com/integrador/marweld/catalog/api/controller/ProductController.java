package com.integrador.marweld.catalog.api.controller;

import com.integrador.marweld.catalog.api.mapper.CatalogApiMapper;
import com.integrador.marweld.catalog.api.request.CreateProductRequest;
import com.integrador.marweld.catalog.api.request.FiltrosProducto;
import com.integrador.marweld.catalog.api.response.ProductResponse;
import com.integrador.marweld.catalog.application.command.CreateProductCommand;
import com.integrador.marweld.catalog.application.result.CreateProductResult;
import com.integrador.marweld.catalog.application.service.CatalogService;
import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.catalog.infrastructure.persistence.projection.ProductSummaryProjection;
import com.integrador.marweld.core.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para gestionar operaciones asociadas con productos.
 */
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final CatalogService catalogService;
    private final CatalogApiMapper catalogApiMapper;

    public ProductController(CatalogService catalogService, CatalogApiMapper catalogApiMapper) {
        this.catalogService = catalogService;
        this.catalogApiMapper = catalogApiMapper;
    }

    /**
     * Registra un nuevo producto.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        CreateProductCommand command = catalogApiMapper.toCommand(request);
        CreateProductResult result = catalogService.createProduct(command);
        
        // Dado que es un producto recién creado, su stock inicial es siempre 0.
        ProductResponse responseData = catalogApiMapper.toResponse(result, 0);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Producto creado exitosamente.", responseData));
    }

    /**
     * Obtiene el detalle de un producto por su UUID.
     */
    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<ProductSummaryProjection>> getProductByPublicId(@PathVariable UUID publicId) {
        ProductSummaryProjection responseData = catalogService.getProductProjectionByPublicId(publicId);
        if (responseData == null) {
            throw new com.integrador.marweld.catalog.domain.exception.ProductNotFoundException(publicId);
        }
        return ResponseEntity.ok(ApiResponse.success("Producto recuperado exitosamente.", responseData));
    }

    /**
     * Obtiene la lista de todos los productos activos con soporte para filtros de búsqueda.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductSummaryProjection>>> getAllProducts(FiltrosProducto filtros) {
        List<ProductSummaryProjection> responseData = catalogService.searchCatalog(filtros);
        return ResponseEntity.ok(ApiResponse.success("Listado de productos recuperado exitosamente.", responseData));
    }
}
