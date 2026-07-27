import type { ServerResponse } from "node:http";
import { subscribePublicEvents, type PublicLiveEvent } from "./event-bus";

const HEARTBEAT_MS = 25000;

export function handleLiveUpdatesSse(res: ServerResponse) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("retry: 3000\n\n");

  const send = (event: PublicLiveEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  const unsubscribe = subscribePublicEvents(send);
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, HEARTBEAT_MS);

  res.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
}
