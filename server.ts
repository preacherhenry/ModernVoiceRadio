import { createServer } from "node:http";
import { parse } from "node:url";
import { loadEnvConfig } from "@next/env";

// Must happen before any module that reads process.env at load time
// (e.g. Prisma constructing its client) — static `import`s are hoisted
// above this file's own code, so those modules are loaded dynamically
// below, strictly after env vars are in place.
loadEnvConfig(process.cwd());

async function main() {
  const { default: next } = await import("next");
  const { handleLiveUpdatesSse } = await import("./src/server/sse");
  const { handleInternalStudioRequest } = await import("./src/server/internal-control");
  const { handleBroadcastUpgrade } = await import("./src/server/ws-broadcast");
  const { handleChatUpgrade } = await import("./src/server/ws-chat");
  const { startListenerSampler } = await import("./src/server/listener-sampler");

  const dev = process.env.NODE_ENV !== "production";
  const port = Number(process.env.PORT) || 3000;
  // In production (e.g. behind Render's proxy) we must bind all interfaces,
  // not just loopback, or the platform can never reach the process.
  const hostname = process.env.HOSTNAME || (dev ? "localhost" : "0.0.0.0");

  const app = next({ dev, hostname, port });
  await app.prepare();

  const handle = app.getRequestHandler();
  const upgradeHandle = app.getUpgradeHandler();

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || "/", true);

      if (req.method === "GET" && parsedUrl.pathname === "/api/live-updates") {
        handleLiveUpdatesSse(res);
        return;
      }

      if (req.method === "POST" && parsedUrl.pathname === "/internal/studio") {
        await handleInternalStudioRequest(req, res);
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("[server] request error:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  server.on("upgrade", async (req, socket, head) => {
    const parsedUrl = parse(req.url || "/", true);
    const sessionId = typeof parsedUrl.query.sessionId === "string" ? parsedUrl.query.sessionId : "";

    try {
      if (parsedUrl.pathname === "/ws/broadcast" && sessionId) {
        await handleBroadcastUpgrade(req, socket, head, sessionId);
        return;
      }

      if (parsedUrl.pathname === "/ws/studio-chat" && sessionId) {
        await handleChatUpgrade(req, socket, head, sessionId);
        return;
      }

      // Not one of ours — let Next handle its own upgrade needs (HMR, etc).
      upgradeHandle(req, socket, head);
    } catch (err) {
      console.error("[server] upgrade error:", err);
      socket.destroy();
    }
  });

  server.listen(port, () => {
    console.log(
      `> Modern Voice Radio ready on http://${hostname}:${port} (${dev ? "development" : "production"})`
    );
  });

  startListenerSampler();
}

main().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
