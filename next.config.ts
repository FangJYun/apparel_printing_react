import type { NextConfig } from "next";

const appBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath: appBasePath || undefined
};

export default nextConfig;
