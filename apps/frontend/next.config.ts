import type { NextConfig } from "next";
import { serverEnv } from "./app/libs/env";

const nextConfig: NextConfig = {
  // 성능 최적화
  poweredByHeader: false, // X-Powered-By 헤더 제거
  compress: true, // gzip 압축 활성화

  // 이미지 최적화
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 보안 헤더
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://portfolio-six-jet-37.vercel.app",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${serverEnv.apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
