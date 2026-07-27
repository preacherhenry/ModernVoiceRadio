import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, type WebSocket } from "ws";
import { prisma } from "@/lib/prisma";
import { authenticateWsRequest, isBroadcasterRole } from "./ws-auth";
import { writeAudioChunk, getActiveSessionId } from "./broadcast-relay";
import { endBroadcast } from "./broadcast-service";

export const broadcastWss = new WebSocketServer({ noServer: true });

broadcastWss.on(
  "connection",
  (ws: WebSocket, _req: IncomingMessage, sessionId: string, userId: string) => {
    ws.on("message", (data, isBinary) => {
      if (isBinary && getActiveSessionId() === sessionId) {
        writeAudioChunk(sessionId, data as Buffer);
      }
    });

    ws.on("close", () => {
      if (getActiveSessionId() === sessionId) {
        endBroadcast(sessionId, { userId, reason: "Connection lost" }).catch((err) => {
          console.error("[ws-broadcast] failed to auto-end session on disconnect:", err);
        });
      }
    });
  }
);

export async function handleBroadcastUpgrade(
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
  sessionId: string
) {
  const session = await authenticateWsRequest(req);
  if (!session || !isBroadcasterRole(session.role)) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  const broadcastSession = await prisma.broadcastSession.findUnique({ where: { id: sessionId } });
  if (
    !broadcastSession ||
    (broadcastSession.hostUserId !== session.sub && session.role !== "ADMIN") ||
    !["CONNECTING", "LIVE"].includes(broadcastSession.status)
  ) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  broadcastWss.handleUpgrade(req, socket, head, (ws) => {
    broadcastWss.emit("connection", ws, req, sessionId, session.sub);
  });
}
