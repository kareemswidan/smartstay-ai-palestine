import { spawn } from "node:child_process";
import { openSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "node_modules", "vinext", "dist", "cli.js");
const port = process.argv[2] || "3000";
const log = openSync(path.join(root, "work", `background-${port}.log`), "a");
const child = spawn(process.execPath, [cli, "dev", "--port", port], {
  cwd: root,
  detached: true,
  stdio: ["ignore", log, log],
  windowsHide: true,
  env: { ...process.env, WRANGLER_LOG_PATH: `.wrangler/wrangler-${port}.log` },
});
child.unref();
console.log(child.pid);
