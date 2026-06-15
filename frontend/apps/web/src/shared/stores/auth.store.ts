import { create } from "zustand";

export type User = {
  name: string;
  email: string;
  role: string;
};

type AuthState = {
  user: User | null;
  isInitialized: boolean;
  login: (email: string) => void;
  logout: () => void;
  initialize: () => void;
};

function extractNameFromEmail(email: string): string {
  const prefix = email.split("@")[0] || "Cliente";
  return prefix
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,

  login: (email: string) => {
    const name = extractNameFromEmail(email);
    const user: User = {
      name,
      email,
      role: "Cliente",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("marweld_user", JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("marweld_user");
    }
    set({ user: null });
  },

  initialize: () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("marweld_user");
        if (saved) {
          set({ user: JSON.parse(saved), isInitialized: true });
          return;
        }
      } catch (e) {
        console.error("Error initializing auth store", e);
      }
    }
    set({ user: null, isInitialized: true });
  },
}));
