import { create } from "zustand";

export type WorkerUser = {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  phone?: string;
  position?: string;
  area?: string;
};

type AuthState = {
  user: WorkerUser | null;
  isInitialized: boolean;
  login: (email: string) => void;
  logout: () => void;
  initialize: () => void;
  updateUser: (updated: Partial<WorkerUser>) => void;
};

const DEFAULT_WORKER: WorkerUser = {
  name: "Jennifer Reyes",
  email: "jennifer.reyes@marweld.pe",
  role: "Administrador de Sistemas",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  phone: "987 654 321",
  position: "Administradora General",
  area: "Sistemas y Operaciones"
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isInitialized: false,

  login: (email: string) => {
    let role = "Trabajador";
    let name = "Trabajador Invitado";
    if (email.toLowerCase().includes("admin") || email === "jennifer.reyes@marweld.pe" || email === "omar.ccora@marweld.pe") {
      role = "Administrador de Sistemas";
      name = email === "omar.ccora@marweld.pe" ? "Omar Ccora" : "Jennifer Reyes";
    }

    const user: WorkerUser = {
      name,
      email,
      role,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      phone: "987 654 321",
      position: role === "Administrador de Sistemas" ? "Administradora General" : "Asistente de Ventas",
      area: role === "Administrador de Sistemas" ? "Sistemas y Operaciones" : "Almacén y Distribución"
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("marweld_admin_user", JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("marweld_admin_user");
    }
    set({ user: null });
  },

  initialize: () => {
    // Always start logged out upon entering the site so the login screen appears first
    if (typeof window !== "undefined") {
      localStorage.removeItem("marweld_admin_user");
    }
    set({ user: null, isInitialized: true });
  },

  updateUser: (updated: Partial<WorkerUser>) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updated };
      if (typeof window !== "undefined") {
        localStorage.setItem("marweld_admin_user", JSON.stringify(newUser));
      }
      return { user: newUser };
    });
  },
}));
