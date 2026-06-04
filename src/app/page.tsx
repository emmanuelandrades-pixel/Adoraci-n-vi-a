"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BookOpen, ArrowLeftRight, List, Play, FileDown, Calendar,
  Music,
} from "lucide-react";

const NOTAS = ["♩", "♪", "♫", "♬", "𝄞"];

// 22 notas musicales flotantes con posiciones/duraciones/delays fijos
// (no random en render para evitar hydration mismatch)
const FLOTANTES = [
  { nota: "♫", x: 8,  delay: 0,   dur: 14 },
  { nota: "♪", x: 17, delay: 3,   dur: 18 },
  { nota: "♩", x: 26, delay: 7,   dur: 12 },
  { nota: "𝄞", x: 35, delay: 1,   dur: 22 },
  { nota: "♬", x: 43, delay: 5,   dur: 16 },
  { nota: "♫", x: 52, delay: 9,   dur: 20 },
  { nota: "♪", x: 61, delay: 2,   dur: 13 },
  { nota: "♩", x: 70, delay: 11,  dur: 24 },
  { nota: "♬", x: 79, delay: 4,   dur: 17 },
  { nota: "𝄞", x: 88, delay: 8,   dur: 11 },
  { nota: "♫", x: 94, delay: 6,   dur: 19 },
  { nota: "♪", x: 12, delay: 12,  dur: 15 },
  { nota: "♩", x: 23, delay: 0.5, dur: 21 },
  { nota: "𝄞", x: 47, delay: 3.5, dur: 10 },
  { nota: "♬", x: 58, delay: 7.5, dur: 23 },
  { nota: "♫", x: 67, delay: 10,  dur: 14 },
  { nota: "♪", x: 76, delay: 2.5, dur: 18 },
  { nota: "♩", x: 84, delay: 5.5, dur: 16 },
  { nota: "𝄞", x: 91, delay: 9.5, dur: 12 },
  { nota: "♬", x: 4,  delay: 1.5, dur: 20 },
  { nota: "♫", x: 39, delay: 6.5, dur: 22 },
  { nota: "♪", x: 55, delay: 8.5, dur: 17 },
];

const FEATURES = [
  {
    icon: BookOpen,
    titulo: "Biblioteca",
    desc: "144 canciones con acordes y secciones completas",
  },
  {
    icon: ArrowLeftRight,
    titulo: "Transposición",
    desc: "Cambia de tono en tiempo real sin perder los acordes",
  },
  {
    icon: List,
    titulo: "Set Lists",
    desc: "Arma el orden del culto con voces e instrumentistas",
  },
  {
    icon: Play,
    titulo: "Modo Ensayo",
    desc: "Pantalla completa con auto-scroll para el escenario",
  },
  {
    icon: FileDown,
    titulo: "Exportar PDF",
    desc: "Set list completo con letra y acordes para compartir",
  },
  {
    icon: Calendar,
    titulo: "Eventos",
    desc: "Planifica cultos, retiros y conferencias con tu equipo",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          50%  { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
        @keyframes pulse-border {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.75; }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 0.15; }
        }
        @keyframes flotar {
          0%   { transform: translateY(100vh) rotate(-8deg); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateY(-120px) rotate(8deg); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUpSlow {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-enter   { animation: fadeUp 1s ease forwards; }
        .stats-enter  { animation: fadeUpSlow 1.3s ease forwards; }
        .feats-enter  { animation: fadeUpSlow 1.5s ease forwards; }
        .shimmer-text {
          background: linear-gradient(135deg, #C8BFFF 0%, #E8E4FF 40%, #A89CF7 70%, #7C6AF7 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0D0F18",
          color: "#E8E4FF",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {/* Líneas horizontales decorativas */}
        {[22, 44, 66, 88].map((pct) => (
          <div
            key={pct}
            style={{
              position: "absolute",
              left: 0, right: 0,
              top: `${pct}%`,
              height: 1,
              backgroundColor: "rgba(124,106,247,0.05)",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Notas musicales flotantes */}
        {FLOTANTES.map((f, i) => (
          <div
            key={i}
            style={{
              position: "fixed",
              left: `${f.x}%`,
              bottom: -40,
              fontSize: 18,
              color: "rgba(124,106,247,0.12)",
              pointerEvents: "none",
              animation: `flotar ${f.dur}s linear ${f.delay}s infinite`,
              zIndex: 0,
            }}
          >
            {f.nota}
          </div>
        ))}

        {/* Contenido principal */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 560,
            margin: "0 auto",
            padding: "80px 24px 60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* ── Hero ─────────────────────────────────────────────── */}
          <div className="hero-enter" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, width: "100%" }}>
            {/* Logo animado */}
            <div style={{ position: "relative", marginBottom: 28 }}>
              {/* Anillo exterior */}
              <div style={{
                position: "absolute",
                inset: -10,
                borderRadius: "50%",
                border: "1px solid rgba(124,106,247,0.15)",
                animation: "pulse-ring 3s ease-in-out infinite",
              }} />
              {/* Borde animado */}
              <div style={{
                position: "absolute",
                inset: -3,
                borderRadius: "50%",
                border: "2px solid #7C6AF7",
                animation: "pulse-border 3s ease-in-out infinite",
              }} />
              {/* Imagen circular */}
              <div style={{
                width: 136, height: 136,
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "rgba(124,106,247,0.08)",
                border: "1px solid rgba(124,106,247,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Image
                  src="/logo.png"
                  alt="Adoración Viña Casa de Amor"
                  width={136}
                  height={136}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  priority
                  onError={(e) => {
                    const parent = (e.target as HTMLImageElement).parentElement!;
                    parent.innerHTML = `<div style="font-size:48px;color:rgba(124,106,247,0.5)">♫</div>`;
                  }}
                />
              </div>
            </div>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 14px",
              borderRadius: 99,
              backgroundColor: "rgba(124,106,247,0.10)",
              border: "1px solid rgba(124,106,247,0.22)",
              fontSize: 11, color: "#A89CF7",
              marginBottom: 16,
              letterSpacing: "0.04em",
            }}>
              <Music size={12} />
              Plataforma del ministerio
            </div>

            {/* Título */}
            <h1
              className="shimmer-text"
              style={{
                fontFamily: "var(--font-cinzel), 'Cinzel', serif",
                fontSize: 30,
                fontWeight: 600,
                lineHeight: 1.3,
                textAlign: "center",
                margin: 0,
                marginBottom: 8,
              }}
            >
              Adoración Viña<br />Casa de Amor
            </h1>
            <p style={{ fontSize: 12, color: "#5A5E78", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 28 }}>
              Talca · Chile
            </p>

            {/* Versículo */}
            <div style={{ maxWidth: 360, textAlign: "center", marginBottom: 32 }}>
              <p style={{ fontStyle: "italic", fontSize: 14, color: "#6B6F8A", lineHeight: 1.7, margin: 0 }}>
                "Dios es Espíritu, por eso todos los que lo adoran deben hacerlo en espíritu y en verdad."
              </p>
              <p style={{ fontSize: 12, color: "#4A4E68", marginTop: 8, fontStyle: "normal" }}>
                — Juan 4:24 NTV
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => router.push("/canciones")}
              style={{
                padding: "12px 28px",
                borderRadius: 10,
                border: "1px solid rgba(124,106,247,0.35)",
                backgroundColor: "rgba(124,106,247,0.12)",
                color: "#C8BFFF",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "background-color 0.2s",
                marginBottom: 52,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(124,106,247,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(124,106,247,0.12)")}
            >
              Entrar a la plataforma →
            </button>
          </div>

          {/* ── Estadísticas ─────────────────────────────────────── */}
          <div
            className="stats-enter"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0,
              width: "100%",
              border: "1px solid rgba(124,106,247,0.12)",
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 28,
            }}
          >
            {[
              { valor: "144", label: "Canciones" },
              { valor: "∞",   label: "Set lists" },
              { valor: "12",  label: "Tonalidades" },
              { valor: "PDF", label: "Exportación" },
            ].map(({ valor, label }, i) => (
              <div
                key={label}
                style={{
                  padding: "18px 8px",
                  textAlign: "center",
                  borderRight: i < 3 ? "1px solid rgba(124,106,247,0.10)" : "none",
                  backgroundColor: "rgba(124,106,247,0.04)",
                }}
              >
                <div style={{
                  fontFamily: "var(--font-cinzel), 'Cinzel', serif",
                  fontSize: 20,
                  color: "#7C6AF7",
                  marginBottom: 4,
                }}>
                  {valor}
                </div>
                <div style={{ fontSize: 10, color: "#4A4E68", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* ── Features grid ────────────────────────────────────── */}
          <div
            className="feats-enter"
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 48,
            }}
          >
            {FEATURES.map(({ icon: Icon, titulo, desc }, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              return (
                <div
                  key={titulo}
                  style={{
                    padding: "20px 16px",
                    backgroundColor: "#111420",
                    borderRight: col < 2 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    borderBottom: row < 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    transition: "background-color 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#161926")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#111420")}
                >
                  <Icon size={18} color="#7C6AF7" style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#D4CFFF", marginBottom: 5 }}>
                    {titulo}
                  </div>
                  <div style={{ fontSize: 11, color: "#5A5E78", lineHeight: 1.5 }}>
                    {desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Footer ───────────────────────────────────────────── */}
          <p style={{ fontSize: 10, color: "#2E3148", letterSpacing: "0.12em", textAlign: "center" }}>
            ADORACIÓN VIÑA CASA DE AMOR · TALCA · USO INTERNO
          </p>
        </div>
      </div>
    </>
  );
}
