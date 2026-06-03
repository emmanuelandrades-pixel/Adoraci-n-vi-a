import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Servir archivos de /data como estáticos
  async headers() {
    return [
      {
        source: "/data/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
