"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { suscribirPush, desuscribirPush, estadoPermiso, registrarSW } from "@/lib/push";

export function NotificacionesBtn() {
  const [permiso, setPermiso] = useState<string>("default");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    registrarSW();
    estadoPermiso().then(setPermiso);
  }, []);

  if (permiso === "unsupported") return null;

  const activar = async () => {
    setCargando(true);
    if (permiso === "granted") {
      await desuscribirPush();
      setPermiso("default");
    } else {
      const ok = await suscribirPush();
      setPermiso(ok ? "granted" : await estadoPermiso());
    }
    setCargando(false);
  };

  const activo = permiso === "granted";

  return (
    <button
      onClick={activar}
      disabled={cargando || permiso === "denied"}
      title={
        permiso === "denied" ? "Notificaciones bloqueadas en el navegador"
        : activo ? "Desactivar notificaciones"
        : "Activar notificaciones de eventos"
      }
      className={`p-2 rounded-lg transition-colors ${
        activo
          ? "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
          : permiso === "denied"
          ? "text-muted-foreground opacity-40 cursor-not-allowed"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      {cargando ? (
        <Bell className="w-4 h-4 animate-pulse" />
      ) : activo ? (
        <BellRing className="w-4 h-4" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
    </button>
  );
}
