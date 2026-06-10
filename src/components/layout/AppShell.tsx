"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import { useSetListStore } from "@/store/setlistStore";
import { useEventosStore } from "@/store/eventosStore";
import { useDocumentosStore } from "@/store/documentosStore";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarAbierto, temaOscuro, setSidebar } = useUIStore();
  const suscribirSetlists   = useSetListStore((s) => s.suscribir);
  const suscribirEventos    = useEventosStore((s) => s.suscribir);
  const suscribirDocumentos = useDocumentosStore((s) => s.suscribir);

  // En mobile, cerrar sidebar por defecto
  useEffect(() => {
    if (window.innerWidth < 768) setSidebar(false);
  }, [setSidebar]);

  useEffect(() => {
    const root = document.documentElement;
    if (temaOscuro) root.classList.remove("light");
    else root.classList.add("light");
  }, [temaOscuro]);

  // Suscripciones en tiempo real
  useEffect(() => {
    const unsubA = suscribirSetlists();
    const unsubB = suscribirEventos();
    const unsubC = suscribirDocumentos();
    return () => { unsubA(); unsubB(); unsubC(); };
  }, [suscribirSetlists, suscribirEventos, suscribirDocumentos]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Overlay oscuro en mobile cuando sidebar está abierto */}
      {sidebarAbierto && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          // En desktop: empuja el contenido. En mobile: siempre ml-0
          "ml-0",
          "md:ml-16",
          sidebarAbierto && "md:ml-60"
        )}
      >
        <Navbar />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
