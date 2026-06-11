export const appBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

export function withBasePath(path: string) {
  if (!appBasePath || path.startsWith("http")) {
    return path;
  }

  return `${appBasePath}${path}`;
}
