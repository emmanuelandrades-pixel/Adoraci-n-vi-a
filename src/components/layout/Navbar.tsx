"use client";

import { Menu, Moon, Sun, Music } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { usePathname } from "next/navigation";

const TITULOS: Record<string, string> = {
  "/canciones": "Biblioteca de Canciones",
  "/set-lists": "Set Lists",
  "/eventos": "Eventos",
  "/integrantes": "Integrantes",
  "/documentos": "Documentos",
  "/quienes-somos": "Quiénes Somos",
};

export function Navbar() {
  const { toggleSidebar, temaOscuro, toggleTema } = useUIStore();
  const pathname = usePathname();

  const titulo = Object.entries(TITULOS).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] ?? "Adoración Viña";

  return (
    <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-foreground">{titulo}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTema}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={temaOscuro ? "Modo claro" : "Modo oscuro"}
        >
          {temaOscuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
