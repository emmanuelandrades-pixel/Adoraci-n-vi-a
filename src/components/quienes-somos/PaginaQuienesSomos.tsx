"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cargarMinisterio } from "@/lib/data-loader/cargarMinisterio";
import { MinisterioConfig } from "@/types/ministerio";
import { Heart, Target, Eye, CheckCircle, Mail, Phone, MapPin, Link2 } from "lucide-react";

export function PaginaQuienesSomos() {
  const [config, setConfig] = useState<MinisterioConfig | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarMinisterio().then((m) => {
      setConfig(m);
      setCargando(false);
    });
  }, []);

  if (cargando) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-card rounded-xl border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!config) {
    return <p className="text-muted-foreground">No se pudo cargar la información del ministerio.</p>;
  }

  const { ministerio, contacto, redes_sociales } = config;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary/30 bg-primary/10 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Adoración Viña Casa de Amor"
            width={80}
            height={80}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
            }}
          />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">{ministerio.nombre_oficial}</h1>
        <p className="text-muted-foreground flex items-center justify-center gap-1.5">
          <MapPin className="w-4 h-4" />
          {ministerio.ubicacion}
        </p>
      </div>

      {/* Quiénes somos */}
      {ministerio.quienes_somos && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            Quiénes Somos
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{ministerio.quienes_somos}</p>
        </div>
      )}

      {/* Misión */}
      {ministerio.mision && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Misión
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{ministerio.mision}</p>
        </div>
      )}

      {/* Visión */}
      {ministerio.vision && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Visión
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{ministerio.vision}</p>
        </div>
      )}

      {/* Valores */}
      {ministerio.valores.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            Valores
          </h2>
          <ul className="space-y-2">
            {ministerio.valores.map((valor, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                {valor}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contacto */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Contacto</h2>
        <div className="space-y-2.5">
          {contacto.email && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <span>{contacto.email}</span>
            </div>
          )}
          {contacto.telefono && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Phone className="w-4 h-4 text-primary" />
              <span>{contacto.telefono}</span>
            </div>
          )}
          {contacto.ubicacion && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{contacto.ubicacion}</span>
            </div>
          )}
        </div>

        {(redes_sociales.instagram || redes_sociales.facebook || redes_sociales.youtube) && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Redes Sociales</p>
            <div className="flex flex-col gap-2">
              {redes_sociales.instagram && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link2 className="w-4 h-4 text-pink-400" />
                  <span>Instagram: {redes_sociales.instagram}</span>
                </div>
              )}
              {redes_sociales.facebook && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link2 className="w-4 h-4 text-blue-400" />
                  <span>Facebook: {redes_sociales.facebook}</span>
                </div>
              )}
              {redes_sociales.youtube && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link2 className="w-4 h-4 text-red-400" />
                  <span>YouTube: {redes_sociales.youtube}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
