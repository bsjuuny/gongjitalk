import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/gongjitalk",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
