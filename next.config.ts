import type { NextConfig } from "next";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://tally.so https://meet.jit.si https://*.jit.si https://8x8.vc https://accounts.google.com/gsi/client;
  style-src 'self' 'unsafe-inline' https://meet.jit.si https://*.jit.si https://accounts.google.com/gsi/style;
  img-src 'self' data: blob: https:;
  font-src 'self' data: https://meet.jit.si https://*.jit.si;
  connect-src 'self' https: wss:;
  frame-src 'self' https://tally.so https://meet.jit.si https://*.jit.si https://8x8.vc https://accounts.google.com/gsi/;
  frame-ancestors 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://tally.so;
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
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
            value:
              "camera=(self \"https://meet.jit.si\" \"https://*.jit.si\" \"https://8x8.vc\" \"https://*.8x8.vc\"), microphone=(self \"https://meet.jit.si\" \"https://*.jit.si\" \"https://8x8.vc\" \"https://*.8x8.vc\"), display-capture=(self \"https://meet.jit.si\" \"https://*.jit.si\" \"https://8x8.vc\" \"https://*.8x8.vc\"), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
