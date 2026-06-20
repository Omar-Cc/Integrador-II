// Server Component — los datos se consumen de forma asíncrona en el servidor
import { getProductos } from "../services/productos.service";
import { CatalogoFiltros } from "./catalogo-filtros";

export default async function HomePage() {
  const productos = await getProductos();
  return <CatalogoFiltros productos={productos} />;
}
