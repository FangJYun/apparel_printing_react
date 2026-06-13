import type { NextConfig } from "next";

const appBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";
const distDir = process.env.NEXT_DIST_DIR || ".next";

const nextConfig: NextConfig = {
  basePath: appBasePath || undefined,
  distDir
};

export default nextConfig;
