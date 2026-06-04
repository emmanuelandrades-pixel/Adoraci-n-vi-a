"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Music,
  Calendar,
  List,
  Users,
  FileText,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

const NAVIGATION = [
  { href: "/canciones", label: "Canciones", icon: Music },
  { href: "/set-lists", label: "Set Lists", icon: List },
  { href: "/eventos", label: "Eventos", icon: Calendar },
  { href: "/integrantes", label: "Integrantes", icon: Users },
  { href: "/documentos", label: "Documentos", icon: FileText },
  { href: "/quienes-somos", label: "Quiénes Somos", icon: Heart },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarAbierto, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out",
        "bg-card border-r border-border",
        sidebarAbierto ? "w-60" : "w-16"
      )}
    >
      {/* Logo → link a portada */}
      <Link
        href="/"
        className="flex items-center h-16 px-4 border-b border-border overflow-hidden hover:bg-secondary/50 transition-colors"
        title="Ir a la portada"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-[rgba(124,106,247,0.3)]">
            <Image
              src="/logo.png"
              alt="Adoración Viña"
              width={32}
              height={32}
              className="object-cover w-full h-full"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          {sidebarAbierto && (
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight truncate" style={{ fontFamily: "'Cinzel', serif", color: "#A89CF7" }}>
                Adoración Viña
              </p>
              <p className="text-[10px] text-muted-foreground truncate">← Portada</p>
            </div>
          )}
        </div>
      </Link>

      {/* Navegación */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAVIGATION.map(({ href, label, icon: Icon }) => {
          const activo = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                activo
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              title={!sidebarAbierto ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarAbierto && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle */}
      <div className="p-2 border-t border-border">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={sidebarAbierto ? "Colapsar menú" : "Expandir menú"}
        >
          {sidebarAbierto ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
