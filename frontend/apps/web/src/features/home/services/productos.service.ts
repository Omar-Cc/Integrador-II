import { productosMock, preguntasFrecuentesMock } from "../data/productos.mock";
import type {
  FiltrosProducto,
  Producto,
  PreguntaFrecuente,
} from "../types/producto.types";

// Funciones síncronas — sin delays artificiales.
// Cuando conectes el backend real, reemplaza el cuerpo de cada función
// por una llamada axios y vuelve a hacerlas async.

export function getProductos(filtros?: Partial<FiltrosProducto>): Producto[] {
  let lista = [...productosMock];

  if (filtros?.busqueda) {
    const q = filtros.busqueda.toLowerCase();
    lista = lista.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.descripcionCorta.toLowerCase().includes(q),
    );
  }
  if (filtros?.categoria)
    lista = lista.filter((p) => p.categoria === filtros.categoria);
  if (filtros?.marca) lista = lista.filter((p) => p.marca === filtros.marca);
  if (filtros?.precioMin)
    lista = lista.filter((p) => p.precio >= (filtros.precioMin ?? 0));
  if (filtros?.precioMax)
    lista = lista.filter((p) => p.precio <= (filtros.precioMax ?? Infinity));
  if (filtros?.soloDisponibles) lista = lista.filter((p) => p.disponible);

  return lista;
}

export function getProductoById(id: string): Producto | null {
  return productosMock.find((p) => p.id === id) ?? null;
}

export function getProductosRelacionados(ids: string[]): Producto[] {
  return productosMock.filter((p) => ids.includes(p.id));
}

export function getPreguntasFrecuentes(): PreguntaFrecuente[] {
  return preguntasFrecuentesMock;
}
