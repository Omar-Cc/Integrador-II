// Server Component — los datos se consumen síncronamente, sin useEffect ni loading
import { getProductos } from "../services/productos.service";
import { CatalogoFiltros } from "./catalogo-filtros";

export default function HomePage() {
  const productos = getProductos();
  return <CatalogoFiltros productos={productos} />;
}
