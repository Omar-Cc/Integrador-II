import { notFound } from "next/navigation";
import { ProductoDetallePage } from "../../../../src/features/home/components/producto-detalle-page";
import {
  getProductoById,
  getProductosRelacionados,
  getPreguntasFrecuentes,
} from "../../../../src/features/home/services/productos.service";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductoRoute({ params }: Props) {
  const { id } = await params;

  const producto = await getProductoById(id);
  if (!producto) notFound();

  const [relacionados, preguntas] = await Promise.all([
    getProductosRelacionados(producto.relacionados),
    getPreguntasFrecuentes(),
  ]);

  return (
    <ProductoDetallePage
      producto={producto}
      relacionados={relacionados}
      preguntas={preguntas}
    />
  );
}
