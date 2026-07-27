import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { publishRelayError } from "./event-bus";

const SAMPLE_RATE = 48000;
const CHANNELS = 2;

export const RECORDINGS_DIR = path.join(process.cwd(), "recordings");

type IcecastSourceConfig = {
  host: string;
  port: string;
  mount: string;
  username: string;
  password: string;
};

function getIcecastSourceConfig(): IcecastSourceConfig {
  const host = process.env.ICECAST_SOURCE_HOST;
  const port = process.env.ICECAST_SOURCE_PORT;
  const mount = process.env.ICECAST_SOURCE_MOUNT;
  const username = process.env.ICECAST_SOURCE_USERNAME;
  const password = process.env.ICECAST_SOURCE_PASSWORD;

  if (!host || !port || !mount || !username || !password) {
    throw new Error(
      "Broadcast source not configured. Set ICECAST_SOURCE_HOST, ICECAST_SOURCE_PORT, ICECAST_SOURCE_MOUNT, ICECAST_SOURCE_USERNAME and ICECAST_SOURCE_PASSWORD in .env."
    );
  }

  return { host, port, mount: mount.startsWith("/") ? mount : `/${mount}`, username, password };
}

function buildIcecastUrl(cfg: IcecastSourceConfig): string {
  return `icecast://${encodeURIComponent(cfg.username)}:${encodeURIComponent(cfg.password)}@${cfg.host}:${cfg.port}${cfg.mount}`;
}

type ActiveRelay = {
  sessionId: string;
  streamProcess: ChildProcessWithoutNullStreams;
  recordProcess: ChildProcessWithoutNullStreams | null;
  recordingPaused: boolean;
  recordingPath: string;
  isEmergency: boolean;
};

let currentRelay: ActiveRelay | null = null;

export function getActiveSessionId(): string | null {
  return currentRelay?.sessionId ?? null;
}

export function isRecordingActive(sessionId: string): boolean {
  return currentRelay?.sessionId === sessionId && !!currentRelay.recordProcess && !currentRelay.recordingPaused;
}

function waitForExit(proc: ChildProcessWithoutNullStreams): Promise<void> {
  return new Promise((resolve) => {
    if (proc.exitCode !== null || proc.signalCode !== null) {
      resolve();
      return;
    }
    proc.once("exit", () => resolve());
  });
}

async function finalizeRecording(
  proc: ChildProcessWithoutNullStreams,
  filePath: string
): Promise<{ filePath: string; fileSizeBytes: number }> {
  if (!proc.stdin.destroyed) proc.stdin.end();
  await waitForExit(proc);
  const stat = await fs.promises.stat(filePath).catch(() => null);
  return { filePath, fileSizeBytes: stat?.size ?? 0 };
}

function attachProcessLogging(sessionId: string, label: string, proc: ChildProcessWithoutNullStreams) {
  proc.stderr.on("data", (chunk: Buffer) => {
    const text = chunk.toString().trim();
    if (text) console.error(`[relay:${sessionId}] ${label}:`, text);
  });
  proc.on("error", (err) => {
    console.error(`[relay:${sessionId}] ${label} process error:`, err);
    publishRelayError(sessionId, `${label} failed: ${err.message}`);
  });
}

/** Starts streaming a live mic feed (raw PCM pushed via writeAudioChunk) to Icecast, plus a parallel recording. */
export async function startBroadcastRelay(sessionId: string): Promise<void> {
  if (currentRelay) {
    throw new Error("A broadcast is already live. End it before starting a new one.");
  }

  const cfg = getIcecastSourceConfig();
  const icecastUrl = buildIcecastUrl(cfg);

  const streamProcess = spawn("ffmpeg", [
    "-loglevel", "error",
    "-f", "s16le",
    "-ar", String(SAMPLE_RATE),
    "-ac", String(CHANNELS),
    "-i", "pipe:0",
    "-f", "mp3",
    "-content_type", "audio/mpeg",
    icecastUrl,
  ]);
  attachProcessLogging(sessionId, "stream", streamProcess);
  streamProcess.on("exit", (code) => {
    if (currentRelay?.sessionId === sessionId && code !== 0 && code !== null) {
      publishRelayError(sessionId, `Stream to Icecast exited unexpectedly (code ${code}).`);
    }
  });

  await fs.promises.mkdir(RECORDINGS_DIR, { recursive: true });
  const recordingPath = path.join(RECORDINGS_DIR, `${sessionId}.mp3`);

  const recordProcess = spawn("ffmpeg", [
    "-loglevel", "error",
    "-f", "s16le",
    "-ar", String(SAMPLE_RATE),
    "-ac", String(CHANNELS),
    "-i", "pipe:0",
    "-f", "mp3",
    recordingPath,
  ]);
  attachProcessLogging(sessionId, "record", recordProcess);

  currentRelay = {
    sessionId,
    streamProcess,
    recordProcess,
    recordingPaused: false,
    recordingPath,
    isEmergency: false,
  };
}

/** Starts streaming a looped pre-recorded emergency audio file to Icecast, taking over from any active session. */
export async function startEmergencyRelay(sessionId: string, audioFilePath: string): Promise<void> {
  if (currentRelay) {
    await stopBroadcastRelay(currentRelay.sessionId);
  }

  const cfg = getIcecastSourceConfig();
  const icecastUrl = buildIcecastUrl(cfg);

  const streamProcess = spawn("ffmpeg", [
    "-loglevel", "error",
    "-re",
    "-stream_loop", "-1",
    "-i", audioFilePath,
    "-f", "mp3",
    "-content_type", "audio/mpeg",
    icecastUrl,
  ]);
  attachProcessLogging(sessionId, "emergency", streamProcess);

  currentRelay = {
    sessionId,
    streamProcess,
    recordProcess: null,
    recordingPaused: false,
    recordingPath: "",
    isEmergency: true,
  };
}

export function writeAudioChunk(sessionId: string, chunk: Buffer) {
  if (!currentRelay || currentRelay.sessionId !== sessionId || currentRelay.isEmergency) return;

  if (!currentRelay.streamProcess.stdin.destroyed) {
    currentRelay.streamProcess.stdin.write(chunk);
  }
  if (
    currentRelay.recordProcess &&
    !currentRelay.recordingPaused &&
    !currentRelay.recordProcess.stdin.destroyed
  ) {
    currentRelay.recordProcess.stdin.write(chunk);
  }
}

export function pauseRecording(sessionId: string) {
  if (currentRelay?.sessionId === sessionId) currentRelay.recordingPaused = true;
}

export function resumeRecording(sessionId: string) {
  if (currentRelay?.sessionId === sessionId) currentRelay.recordingPaused = false;
}

export async function stopRecordingEarly(
  sessionId: string
): Promise<{ filePath: string; fileSizeBytes: number } | null> {
  if (!currentRelay || currentRelay.sessionId !== sessionId || !currentRelay.recordProcess) return null;
  const proc = currentRelay.recordProcess;
  const filePath = currentRelay.recordingPath;
  currentRelay.recordProcess = null;
  return finalizeRecording(proc, filePath);
}

export async function stopBroadcastRelay(
  sessionId: string
): Promise<{ recording: { filePath: string; fileSizeBytes: number } | null }> {
  if (!currentRelay || currentRelay.sessionId !== sessionId) {
    return { recording: null };
  }

  const { streamProcess, recordProcess, recordingPath } = currentRelay;
  currentRelay = null;

  if (!streamProcess.stdin.destroyed) streamProcess.stdin.end();
  await waitForExit(streamProcess);

  let recording: { filePath: string; fileSizeBytes: number } | null = null;
  if (recordProcess) {
    recording = await finalizeRecording(recordProcess, recordingPath);
  }

  return { recording };
}
