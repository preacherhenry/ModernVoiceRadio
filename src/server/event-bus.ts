import { EventEmitter } from "node:events";

export type PublicLiveEvent =
  | {
      type: "status";
      payload: {
        status: "OFFLINE" | "CONNECTING" | "LIVE" | "ENDED";
        programName?: string;
        presenterName?: string;
        episodeTitle?: string;
        coverImage?: string;
        startedAt?: string | null;
        sessionId?: string;
      };
    }
  | { type: "now-playing"; payload: { song: string; artist: string } }
  | { type: "listeners"; payload: { count: number } }
  | { type: "emergency"; payload: { active: boolean; message?: string } };

export type ChatEvent = {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
};

export type BroadcastMeterEvent = {
  sessionId: string;
  peakDb: number;
  clipping: boolean;
};

const bus = new EventEmitter();
bus.setMaxListeners(500);

export function publishPublicEvent(event: PublicLiveEvent) {
  bus.emit("public", event);
}

export function subscribePublicEvents(handler: (event: PublicLiveEvent) => void) {
  bus.on("public", handler);
  return () => bus.off("public", handler);
}

export function publishChatMessage(message: ChatEvent) {
  bus.emit("chat", message);
}

export function subscribeChatMessages(handler: (message: ChatEvent) => void) {
  bus.on("chat", handler);
  return () => bus.off("chat", handler);
}

export function publishRelayError(sessionId: string, message: string) {
  bus.emit("relay-error", { sessionId, message });
}

export function subscribeRelayErrors(handler: (event: { sessionId: string; message: string }) => void) {
  bus.on("relay-error", handler);
  return () => bus.off("relay-error", handler);
}
