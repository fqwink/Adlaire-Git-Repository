import { loadConfig } from "./config.ts";
import { createApp } from "./server.ts";

const config = loadConfig();
const app = await createApp(config);

Deno.serve({ hostname: config.host, port: config.port }, app.fetch);
