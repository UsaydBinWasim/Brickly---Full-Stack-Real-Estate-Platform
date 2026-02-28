import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    dangerouslyAllowSVG: true,
    // Allow localhost images in development (Next.js blocks private IPs by default)
    ...(process.env.NODE_ENV !== "production" && {
      unoptimized: true,
    }),
  },
};

export default nextConfig;
