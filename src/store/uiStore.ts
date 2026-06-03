import { create } from "zustand";

interface UIState {
  sidebarAbierto: boolean;
  temaOscuro: boolean;
  toggleSidebar: () => void;
  setSidebar: (abierto: boolean) => void;
  toggleTema: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarAbierto: true,
  temaOscuro: true,
  toggleSidebar: () => set((s) => ({ sidebarAbierto: !s.sidebarAbierto })),
  setSidebar: (abierto) => set({ sidebarAbierto: abierto }),
  toggleTema: () => set((s) => ({ temaOscuro: !s.temaOscuro })),
}));
