import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const command = process.platform === "win32" ? path.join(root, "node_modules", ".bin", "vinext.cmd") : path.join(root, "node_modules", ".bin", "vinext");
const [mode = "dev", ...extraArgs] = process.argv.slice(2);
const child = spawn(command, [mode, ...extraArgs], { cwd: root, stdio: "inherit", shell: process.platform === "win32", env: { ...process.env, WRANGLER_LOG_PATH: ".wrangler/wrangler.log" } });
child.on("exit", (code) => process.exit(code ?? 1));
