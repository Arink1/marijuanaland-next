import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Owner-uploaded photos are served from the Supabase Storage CDN.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Local development against a stand-in storage server.
      ...(process.env.NODE_ENV !== "production"
        ? [{ protocol: "http" as const, hostname: "localhost" }]
        : []),
    ],
    // Only so the optimizer can fetch from that localhost stand-in in dev.
    ...(process.env.NODE_ENV !== "production"
      ? { dangerouslyAllowLocalIP: true }
      : {}),
  },
};

export default nextConfig;
