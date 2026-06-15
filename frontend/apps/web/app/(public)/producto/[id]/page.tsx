import { notFound } from "next/navigation";
import { ProductoDetallePage } from "../../../../src/features/home/components/producto-detalle-page";
import {
  getProductoById,
  getProductosRelacionados,
  getPreguntasFrecuentes,
} from "../../../../src/features/home/services/productos.service";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductoRoute({ params }: Props) {
  const { id } = await params;

  const producto = getProductoById(id);
  if (!producto) notFound();

  const relacionados = getProductosRelacionados(producto.relacionados);
  const preguntas = getPreguntasFrecuentes();

  return (
    <ProductoDetallePage
      producto={producto}
      relacionados={relacionados}
      preguntas={preguntas}
    />
  );
}
