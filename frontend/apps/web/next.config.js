import process from "node:process";

/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
