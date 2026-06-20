package com.integrador.marweld.catalog.infrastructure.persistence.query;

import com.integrador.marweld.catalog.api.request.FiltrosProducto;
import com.integrador.marweld.catalog.domain.model.Categoria;
import com.integrador.marweld.catalog.domain.model.EspecificacionProducto;
import com.integrador.marweld.catalog.domain.model.Inventario;
import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.catalog.domain.model.RelacionProducto;
import com.integrador.marweld.catalog.domain.model.TipoProducto;
import com.integrador.marweld.catalog.domain.model.TipoRelacionProducto;
import com.integrador.marweld.catalog.infrastructure.persistence.projection.ProductSummaryProjection;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.CategoriaRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.EspecificacionProductoRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.InventarioRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.ProductoRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.RelacionProductoRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.TipoProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:catalog-query-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=false",
        "app.storage.cloudflare.bucket-name=marweld-test-bucket",
        "app.storage.cloudflare.endpoint=https://mock-account-id.r2.cloudflarestorage.com",
        "app.storage.cloudflare.access-key=mock-access-key",
        "app.storage.cloudflare.secret-key=mock-secret-key",
        "app.storage.cloudflare.signed-url-ttl-seconds=900",
        "app.security.jwt.expiration-ms=3600000"
})
@Transactional
class ProductoQueryRepositoryTest {

    @Autowired
    private ProductoQueryRepository queryRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private TipoProductoRepository tipoProductoRepository;

    @Autowired
    private InventarioRepository inventarioRepository;

    @Autowired
    private EspecificacionProductoRepository especificacionProductoRepository;

    @Autowired
    private RelacionProductoRepository relacionProductoRepository;

    private Categoria catSoldadura;
    private Categoria catEquipos;
    private TipoProducto tipoConsumible;
    private TipoProducto tipoEquipo;
    private Producto prod1;
    private Producto prod2;

    @BeforeEach
    void setUp() {
        // Create Categories
        catSoldadura = categoriaRepository.save(Categoria.builder()
                .nombreCategoria("Soldadura")
                .descripcion("Productos de soldadura")
                .estado("ACTIVO")
                .build());

        catEquipos = categoriaRepository.save(Categoria.builder()
                .nombreCategoria("Equipos")
                .descripcion("Equipos industriales")
                .estado("ACTIVO")
                .build());

        // Create Product Types
        tipoConsumible = tipoProductoRepository.save(TipoProducto.builder()
                .codigo("CONSUMIBLE")
                .nombre("Consumibles de soldar")
                .descripcion("Consumibles")
                .build());

        tipoEquipo = tipoProductoRepository.save(TipoProducto.builder()
                .codigo("EQUIPO")
                .nombre("Equipos electricos")
                .descripcion("Equipos")
                .build());

        // Create Products
        prod1 = productoRepository.save(Producto.builder()
                .nombre("Electrodo E6011")
                .descripcion("Electrodo para soldadura celulosico")
                .precio(new BigDecimal("150.00"))
                .unidadMedida("KG")
                .categoria(catSoldadura)
                .tipoProducto(tipoConsumible)
                .estado("ACTIVO")
                .build());

        prod2 = productoRepository.save(Producto.builder()
                .nombre("Mascara de Soldar Miller")
                .descripcion("Mascara fotosensible profesional")
                .precio(new BigDecimal("450.00"))
                .unidadMedida("UND")
                .categoria(catEquipos)
                .tipoProducto(tipoEquipo)
                .estado("ACTIVO")
                .build());

        // Create Inventories
        inventarioRepository.save(Inventario.builder()
                .producto(prod1)
                .stockActual(20)
                .stockMinimo(5)
                .build());

        inventarioRepository.save(Inventario.builder()
                .producto(prod2)
                .stockActual(0) // No stock
                .stockMinimo(2)
                .build());

        // Create Specifications (Brand, Image, etc.)
        especificacionProductoRepository.save(EspecificacionProducto.builder()
                .producto(prod1)
                .clave("marca")
                .valor("Lincoln Electric")
                .build());

        especificacionProductoRepository.save(EspecificacionProducto.builder()
                .producto(prod1)
                .clave("imagen")
                .valor("/images/electrodo.png")
                .build());

        especificacionProductoRepository.save(EspecificacionProducto.builder()
                .producto(prod2)
                .clave("marca")
                .valor("Miller")
                .build());

        especificacionProductoRepository.save(EspecificacionProducto.builder()
                .producto(prod2)
                .clave("imagen")
                .valor("/images/mascara.png")
                .build());

        especificacionProductoRepository.save(EspecificacionProducto.builder()
                .producto(prod2)
                .clave("destacado")
                .valor("true")
                .build());

        // Create Relationship (prod1 -> prod2 compatibilidad)
        relacionProductoRepository.save(RelacionProducto.builder()
                .productoOrigen(prod1)
                .productoDestino(prod2)
                .tipoRelacion(TipoRelacionProducto.COMPLEMENTARIO_DE)
                .build());
    }

    @Test
    void searchCatalog_NoFilters_ReturnsAllActiveProducts() {
        FiltrosProducto filtros = new FiltrosProducto(null, null, null, null, null, null);
        List<ProductSummaryProjection> results = queryRepository.searchCatalog(filtros);

        assertThat(results).hasSize(2);
        assertThat(results).extracting(ProductSummaryProjection::nombre)
                .containsExactlyInAnyOrder("Electrodo E6011", "Mascara de Soldar Miller");
    }

    @Test
    void searchCatalog_FilterByCategory_ReturnsFiltered() {
        FiltrosProducto filtros = new FiltrosProducto("Soldadura", null, null, null, null, null);
        List<ProductSummaryProjection> results = queryRepository.searchCatalog(filtros);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).nombre()).isEqualTo("Electrodo E6011");
        assertThat(results.get(0).categoria()).isEqualTo("Soldadura");
    }

    @Test
    void searchCatalog_FilterByBrand_ReturnsFiltered() {
        FiltrosProducto filtros = new FiltrosProducto(null, "Miller", null, null, null, null);
        List<ProductSummaryProjection> results = queryRepository.searchCatalog(filtros);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).nombre()).isEqualTo("Mascara de Soldar Miller");
        assertThat(results.get(0).marca()).isEqualTo("Miller");
    }

    @Test
    void searchCatalog_FilterByPriceRange_ReturnsFiltered() {
        FiltrosProducto filtros = new FiltrosProducto(null, null, new BigDecimal("100"), new BigDecimal("200"), null, null);
        List<ProductSummaryProjection> results = queryRepository.searchCatalog(filtros);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).nombre()).isEqualTo("Electrodo E6011");
    }

    @Test
    void searchCatalog_FilterSoloDisponibles_ReturnsOnlyWithStock() {
        FiltrosProducto filtros = new FiltrosProducto(null, null, null, null, true, null);
        List<ProductSummaryProjection> results = queryRepository.searchCatalog(filtros);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).nombre()).isEqualTo("Electrodo E6011");
        assertThat(results.get(0).stock()).isEqualTo(20);
    }

    @Test
    void searchCatalog_FilterBySearchTerm_ReturnsMatching() {
        FiltrosProducto filtros = new FiltrosProducto(null, null, null, null, null, "fotosensible");
        List<ProductSummaryProjection> results = queryRepository.searchCatalog(filtros);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).nombre()).isEqualTo("Mascara de Soldar Miller");
    }

    @Test
    void searchCatalog_VerifiesSpecificationsAndRelationshipsMapping() {
        FiltrosProducto filtros = new FiltrosProducto("Soldadura", null, null, null, null, null);
        List<ProductSummaryProjection> results = queryRepository.searchCatalog(filtros);

        assertThat(results).hasSize(1);
        ProductSummaryProjection dto = results.get(0);
        assertThat(dto.imagen()).isEqualTo("/images/electrodo.png");
        assertThat(dto.marca()).isEqualTo("Lincoln Electric");
        assertThat(dto.destacado()).isFalse();
        assertThat(dto.relacionados()).containsExactly(prod2.getPublicId());
    }
}
