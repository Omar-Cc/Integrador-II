package com.integrador.marweld.catalog.api.controller;

import com.integrador.marweld.catalog.api.mapper.CatalogApiMapper;
import com.integrador.marweld.catalog.api.request.CreateCategoryRequest;
import com.integrador.marweld.catalog.api.response.CategoryResponse;
import com.integrador.marweld.catalog.application.service.CatalogService;
import com.integrador.marweld.catalog.domain.model.Categoria;
import com.integrador.marweld.core.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controlador REST para gestionar operaciones asociadas con categorías de productos.
 */
@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CatalogService catalogService;
    private final CatalogApiMapper catalogApiMapper;

    public CategoryController(CatalogService catalogService, CatalogApiMapper catalogApiMapper) {
        this.catalogService = catalogService;
        this.catalogApiMapper = catalogApiMapper;
    }

    /**
     * Registra una nueva categoría de productos.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        Categoria categoria = catalogService.createCategory(request.nombreCategoria(), request.descripcion());
        CategoryResponse responseData = catalogApiMapper.toResponse(categoria);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Categoría creada exitosamente.", responseData));
    }

    /**
     * Obtiene el listado de todas las categorías activas.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<Categoria> categorias = catalogService.getAllActiveCategories();
        List<CategoryResponse> responseData = categorias.stream()
                .map(catalogApiMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Listado de categorías recuperado exitosamente.", responseData));
    }
}
