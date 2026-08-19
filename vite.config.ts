import vinext from "vinext";
import { defineConfig } from "vite";
import { sites } from "./build/sites-vite-plugin";

// Sandboxed and networked filesystems block FSEvents, so HMR needs polling
// there. Opt in with VITE_USE_POLLING=1 when file changes stop being picked up.
const useWatchPolling = process.env.VITE_USE_POLLING === "1";

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: useWatchPolling
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      // Worker name, compatibility settings and bindings all come from
      // wrangler.jsonc. They used to be declared inline here instead, with a
      // placeholder D1 id that only Miniflare could tolerate, which left the
      // project with no config a real deploy could use. Passing them here as
      // well would not override that file but append to it, and Cloudflare
      // rejects the result: two bindings named DB, and nodejs_compat twice.
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      }),
    ],
  };
});
