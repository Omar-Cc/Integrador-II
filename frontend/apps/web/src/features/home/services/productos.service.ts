import { apiRequest } from "../../../shared/api/client";
import { preguntasFrecuentesMock } from "../data/productos.mock";
import type {
  FiltrosProducto,
  Producto,
  PreguntaFrecuente,
  Categoria,
  Marca,
} from "../types/producto.types";

// Helper mapper to transform backend projection to frontend Producto type
function mapProjectionToProducto(p: any): Producto {
  return {
    id: p.publicId,
    nombre: p.nombre,
    descripcionCorta: p.descripcionCorta,
    descripcionLarga: p.descripcionLarga || p.descripcion || "",
    precio: p.precio,
    precioAnterior: p.precioAnterior || undefined,
    imagen: p.imagen,
    categoria: p.categoria as Categoria,
    marca: p.marca as Marca,
    disponible: p.disponible,
    stock: p.stock,
    destacado: p.destacado,
    caracteristicas: p.caracteristicas || [],
    relacionados: p.relacionados || [],
  };
}

export async function getProductos(filtros?: Partial<FiltrosProducto>): Promise<Producto[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filtros) {
      if (filtros.categoria) queryParams.set("categoria", filtros.categoria);
      if (filtros.marca) queryParams.set("marca", filtros.marca);
      if (filtros.precioMin !== undefined) queryParams.set("precioMin", filtros.precioMin.toString());
      if (filtros.precioMax !== undefined) queryParams.set("precioMax", filtros.precioMax.toString());
      if (filtros.soloDisponibles !== undefined) queryParams.set("soloDisponibles", filtros.soloDisponibles.toString());
      if (filtros.busqueda) queryParams.set("busqueda", filtros.busqueda);
    }

    const queryString = queryParams.toString();
    const path = `/api/v1/products${queryString ? `?${queryString}` : ""}`;
    
    const projections = await apiRequest<any[]>(path);
    return projections.map(mapProjectionToProducto);
  } catch (error) {
    console.error("Error fetching products from backend:", error);
    return [];
  }
}

export async function getProductoById(id: string): Promise<Producto | null> {
  try {
    const p = await apiRequest<any>(`/api/v1/products/${id}`);
    return mapProjectionToProducto(p);
  } catch (error) {
    console.error(`Error fetching product by id ${id}:`, error);
    return null;
  }
}

export async function getProductosRelacionados(ids: string[]): Promise<Producto[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const promises = ids.map(id => getProductoById(id));
    const products = await Promise.all(promises);
    return products.filter((p): p is Producto => p !== null);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

export async function getPreguntasFrecuentes(): Promise<PreguntaFrecuente[]> {
  return preguntasFrecuentesMock;
}
