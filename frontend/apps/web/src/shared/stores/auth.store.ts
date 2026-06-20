import { create } from "zustand";
import { authService } from "../../features/auth/services/auth.service";
import type { AuthFlow, AuthUser, MfaChallenge } from "../api/types";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  challenge: MfaChallenge | null;
  isInitialized: boolean;
  setAuth: (flow: AuthFlow) => void;
  setChallenge: (challenge: MfaChallenge | null) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  challenge: null,
  isInitialized: false,
  setAuth: (flow) => {
    if (typeof window !== "undefined") {
      if (flow.mfaChallenge) sessionStorage.setItem("marweld_mfa_challenge", JSON.stringify(flow.mfaChallenge));
      else sessionStorage.removeItem("marweld_mfa_challenge");
    }
    set({ accessToken: flow.accessToken, user: flow.user, challenge: flow.mfaChallenge });
  },
  setChallenge: (challenge) => {
    if (typeof window !== "undefined") {
      if (challenge) sessionStorage.setItem("marweld_mfa_challenge", JSON.stringify(challenge));
      else sessionStorage.removeItem("marweld_mfa_challenge");
    }
    set({ challenge });
  },
  initialize: async () => {
    try {
      const flow = await authService.refresh();
      set({ accessToken: flow.accessToken, user: flow.user, challenge: null, isInitialized: true });
    } catch {
      let challenge = null;
      try {
        const saved = sessionStorage.getItem("marweld_mfa_challenge");
        challenge = saved ? JSON.parse(saved) : null;
      } catch { sessionStorage.removeItem("marweld_mfa_challenge"); }
      set({ accessToken: null, user: null, challenge, isInitialized: true });
    }
  },
  logout: async () => {
    try {
      await authService.logout();
    } finally {
      if (typeof window !== "undefined") sessionStorage.removeItem("marweld_mfa_challenge");
      set({ accessToken: null, user: null, challenge: null });
    }
  },
}));
