/**
 * Builds the static SPA bundle consumed by the Capacitor Android app.
 *
 * 1. Runs the normal Vite build with CAP_BUILD=1, which enables TanStack Start
 *    SPA mode and emits dist/client/_shell.html.
 * 2. Copies that shell to dist/client/index.html so Capacitor can load it
 *    directly from the Android WebView.
 *
 * The regular `npm run build` (SSR/web) is unaffected.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const result = spawnSync("vite", ["build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, CAP_BUILD: "1" },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const shell = resolve(root, "dist/client/_shell.html");
const index = resolve(root, "dist/client/index.html");

if (!existsSync(shell)) {
  console.error("[capacitor] dist/client/_shell.html not found — SPA build failed.");
  process.exit(1);
}

copyFileSync(shell, index);
console.log("[capacitor] Wrote dist/client/index.html");
