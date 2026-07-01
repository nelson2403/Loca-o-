import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse usa require dinâmico e APIs de Node — mantê-lo externo (não
  // empacotado) evita erros de bundling no servidor.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
