import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, type WebSocket } from "ws";
import { prisma } from "@/lib/prisma";
import { authenticateWsRequest, isBroadcasterRole } from "./ws-auth";
import { publishChatMessage, subscribeChatMessages, type ChatEvent } from "./event-bus";

export const chatWss = new WebSocketServer({ noServer: true });

chatWss.on(
  "connection",
  async (ws: WebSocket, _req: IncomingMessage, sessionId: string, userId: string, userName: string) => {
    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: { user: { select: { name: true } } },
    });

    ws.send(
      JSON.stringify({
        type: "history",
        messages: history.map((m) => ({
          id: m.id,
          sessionId: m.sessionId,
          userId: m.userId,
          userName: m.user.name,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
        })),
      })
    );

    const unsubscribe = subscribeChatMessages((event) => {
      if (event.sessionId !== sessionId) return;
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: "message", message: event }));
      }
    });

    ws.on("message", async (data) => {
      let parsed: { body?: string };
      try {
        parsed = JSON.parse(data.toString());
      } catch {
        return;
      }
      const body = (parsed.body ?? "").trim().slice(0, 1000);
      if (!body) return;

      const created = await prisma.chatMessage.create({ data: { sessionId, userId, body } });
      const event: ChatEvent = {
        id: created.id,
        sessionId,
        userId,
        userName,
        body,
        createdAt: created.createdAt.toISOString(),
      };
      publishChatMessage(event);
    });

    ws.on("close", () => {
      unsubscribe();
    });
  }
);

export async function handleChatUpgrade(
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

  chatWss.handleUpgrade(req, socket, head, (ws) => {
    chatWss.emit("connection", ws, req, sessionId, session.sub, session.name);
  });
}
