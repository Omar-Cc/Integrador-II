import HomePage from "../../../src/features/home/components/homepage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Productos | Marweld Perú S.A.C.",
  description: "Explora equipos, herramientas y consumibles para soldadura y construcción.",
};

export default function ProductosRoute() {
  return <HomePage />;
}
