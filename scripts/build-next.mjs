import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const nextEnvPath = new URL("../next-env.d.ts", import.meta.url);
const devRoutesReference = '/// <reference path="./.next/types/routes.d.ts" />';

function runBuild() {
  return new Promise((resolve) => {
    const child = spawn("npx", ["next", "build"], {
      env: { ...process.env, NEXT_DIST_DIR: ".next-build" },
      shell: process.platform === "win32",
      stdio: "inherit"
    });

    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function restoreDevRoutesReference() {
  const source = await readFile(nextEnvPath, "utf8");
  const restored = source.replace(
    /\/\/\/ <reference path="\.\/\.next[^"]*\/types\/routes\.d\.ts" \/>/,
    devRoutesReference
  );

  if (restored !== source) {
    await writeFile(nextEnvPath, restored);
  }
}

const exitCode = await runBuild();
await restoreDevRoutesReference();
process.exit(exitCode);
