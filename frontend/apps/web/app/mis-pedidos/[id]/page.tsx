import { OrderDetailPage } from "../../../src/features/orders/components/order-detail-page";

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <OrderDetailPage publicId={id} />;
}
