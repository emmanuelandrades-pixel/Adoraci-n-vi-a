"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarAbierto, temaOscuro } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    if (temaOscuro) {
      root.classList.remove("light");
    } else {
      root.classList.add("light");
    }
  }, [temaOscuro]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          sidebarAbierto ? "ml-60" : "ml-16"
        )}
      >
        <Navbar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
