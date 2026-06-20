import { useState, useEffect } from "react";
import { AdminLayout } from "./shared/components/layout/admin-layout";
import { DashboardPanel } from "./features/dashboard/components/dashboard-panel";
import { InventarioPanel } from "./features/inventario/components/inventario-panel";
import { PedidosPanel } from "./features/pedidos/components/pedidos-panel";
import { UsuariosPanel } from "./features/usuarios/components/usuarios-panel";
import { ConfiguracionPanel } from "./features/configuracion/components/configuracion-panel";
import { ReposicionesPanel } from "./features/reposiciones/components/reposiciones-panel";
import { LoginPage } from "./features/auth/components/login-page";
import { ReplenishmentModal } from "./shared/components/layout/replenishment-modal";
import { useAuthStore } from "./shared/stores/auth.store";

type Tab = "dashboard" | "inventario" | "pedidos" | "usuarios" | "configuracion" | "reposiciones";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { user, initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Determine if the user is a Worker (non-admin)
  const isAdmin = user ? (user.role === "Administrador" || user.role === "Administrador de Sistemas") : false;
  const isWorker = user ? !isAdmin : false;

  // Block manual access and redirect restricted routes to Dashboard
  useEffect(() => {
    if (user && isWorker && (activeTab === "reposiciones" || activeTab === "usuarios")) {
      setActiveTab("dashboard");
    }
  }, [activeTab, isWorker, user]);

  // If auth state is not yet initialized from localStorage, show a premium loading spinner
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  // If there is no authenticated user, render the Login flow
  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPanel />;
      case "inventario":
        return <InventarioPanel />;
      case "pedidos":
        return <PedidosPanel />;
      case "usuarios":
        return isAdmin ? <UsuariosPanel /> : <DashboardPanel />;
      case "reposiciones":
        return isAdmin ? <ReposicionesPanel /> : <DashboardPanel />;
      case "configuracion":
        return <ConfiguracionPanel />;
      default:
        return <DashboardPanel />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)}>
      {renderContent()}
      <ReplenishmentModal />
    </AdminLayout>
  );
}

export default App;
