import type { NextConfig } from "next";

const securityHeaders = [
  {
    key:
      "X-Content-Type-Options",

    value:
      "nosniff",
  },
  {
    key:
      "Referrer-Policy",

    value:
      "strict-origin-when-cross-origin",
  },
  {
    key:
      "Permissions-Policy",

    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key:
      "X-Permitted-Cross-Domain-Policies",

    value:
      "none",
  },
] as const;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source:
          "/(.*)",

        headers:
          securityHeaders.map(
            (header) => ({
              ...header,
            }),
          ),
      },
    ];
  },
};

export default nextConfig;
