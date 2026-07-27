import type { IncomingMessage, ServerResponse } from "node:http";
import { prisma } from "@/lib/prisma";
import {
  startBroadcast,
  endBroadcast,
  startEmergencyBroadcast,
  endEmergencyBroadcast,
  updateStreamInfo,
  StudioOccupiedError,
} from "./broadcast-service";
import { pauseRecording, resumeRecording, stopRecordingEarly, getActiveSessionId } from "./broadcast-relay";
import { publishPublicEvent } from "./event-bus";

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

export async function handleInternalStudioRequest(req: IncomingMessage, res: ServerResponse) {
  const secret = req.headers["x-internal-secret"];
  if (!process.env.INTERNAL_API_SECRET || secret !== process.env.INTERNAL_API_SECRET) {
    sendJson(res, 401, { ok: false, error: "Unauthorized" });
    return;
  }

  let body: { action?: string; params?: Record<string, unknown> };
  try {
    body = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { ok: false, error: "Invalid JSON body" });
    return;
  }

  const params = (body.params ?? {}) as Record<string, string | null | undefined>;

  try {
    switch (body.action) {
      case "start": {
        const session = await startBroadcast(params as never);
        sendJson(res, 200, { ok: true, session });
        return;
      }
      case "end": {
        const session = await endBroadcast(String(params.sessionId), params as never);
        sendJson(res, 200, { ok: true, session });
        return;
      }
      case "pause-recording": {
        pauseRecording(String(params.sessionId));
        await prisma.recording
          .update({ where: { sessionId: String(params.sessionId) }, data: { status: "PAUSED" } })
          .catch(() => null);
        sendJson(res, 200, { ok: true });
        return;
      }
      case "resume-recording": {
        resumeRecording(String(params.sessionId));
        await prisma.recording
          .update({ where: { sessionId: String(params.sessionId) }, data: { status: "RECORDING" } })
          .catch(() => null);
        sendJson(res, 200, { ok: true });
        return;
      }
      case "stop-recording": {
        const result = await stopRecordingEarly(String(params.sessionId));
        if (result) {
          await prisma.recording
            .update({
              where: { sessionId: String(params.sessionId) },
              data: { status: "STOPPED", fileSizeBytes: result.fileSizeBytes },
            })
            .catch(() => null);
        }
        sendJson(res, 200, { ok: true });
        return;
      }
      case "emergency-start": {
        const session = await startEmergencyBroadcast(params as never);
        sendJson(res, 200, { ok: true, session });
        return;
      }
      case "emergency-end": {
        const session = await endEmergencyBroadcast(String(params.sessionId), params as never);
        sendJson(res, 200, { ok: true, session });
        return;
      }
      case "update-info": {
        const session = await updateStreamInfo(String(params.sessionId), params as never);
        sendJson(res, 200, { ok: true, session });
        return;
      }
      case "status": {
        sendJson(res, 200, { ok: true, activeSessionId: getActiveSessionId() });
        return;
      }
      case "set-now-playing": {
        publishPublicEvent({
          type: "now-playing",
          payload: { song: String(params.song ?? ""), artist: String(params.artist ?? "") },
        });
        sendJson(res, 200, { ok: true });
        return;
      }
      default:
        sendJson(res, 400, { ok: false, error: `Unknown action: ${String(body.action)}` });
    }
  } catch (err) {
    if (err instanceof StudioOccupiedError) {
      sendJson(res, 409, { ok: false, error: err.message, activeSessionId: err.activeSessionId });
      return;
    }
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[internal-control] error:", err);
    sendJson(res, 500, { ok: false, error: message });
  }
}
