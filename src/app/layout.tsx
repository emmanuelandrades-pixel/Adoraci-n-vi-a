import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-cinzel" });

export const metadata: Metadata = {
  title: "Adoración Viña Casa de Amor",
  description: "Plataforma colaborativa del ministerio musical Adoración Viña Casa de Amor, Talca",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
