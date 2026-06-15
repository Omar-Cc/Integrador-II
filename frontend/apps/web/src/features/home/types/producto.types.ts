export type Categoria =
  | "Soldadura"
  | "Herramientas"
  | "Seguridad"
  | "Abrasivos"
  | "Electricidad";

export type Marca = "Lincoln" | "Miller" | "ESAB" | "3M" | "Bosch" | "DeWalt";

export type Producto = {
  id: string;
  nombre: string;
  descripcionCorta: string;
  descripcionLarga: string;
  precio: number;
  precioAnterior?: number;
  imagen: string;
  categoria: Categoria;
  marca: Marca;
  disponible: boolean;
  stock: number;
  destacado: boolean;
  caracteristicas: { label: string; valor: string }[];
  relacionados: string[]; // ids
};

export type FiltrosProducto = {
  categoria: Categoria | "";
  marca: Marca | "";
  precioMin: number;
  precioMax: number;
  soloDisponibles: boolean;
  busqueda: string;
};

export type PreguntaFrecuente = {
  pregunta: string;
  respuesta: string;
};
