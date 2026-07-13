import { EventEmitter } from "events";

const STATUS_EVENT = "status-update";

// Stashed on `global` (not module scope) so Next.js dev-mode HMR
// re-evaluation reuses the same emitter/state instead of producers
// (/api/upload) and consumers (/api/status) silently diverging —
// same reasoning as the existing global.aiResponses pattern.
if (!global.__statusEmitter) {
  global.__statusEmitter = new EventEmitter();
  // Each open browser tab holds one SSE listener; raise the cap so
  // Node doesn't log a MaxListenersExceededWarning.
  global.__statusEmitter.setMaxListeners(50);
}
if (!global.currentStatus) {
  global.currentStatus = {
    stage: "idle", // idle | receiving | ocr | ai | done | error
    message: "Waiting for a screenshot...",
    imageId: null,
    filename: null,
    timestamp: null,
    data: null, // full stored response payload, set only on stage "done"
    error: null,
    updatedAt: new Date().toISOString(),
  };
}

export const statusEmitter = global.__statusEmitter;
export { STATUS_EVENT };

export function getStatus() {
  return global.currentStatus;
}

const IN_PROGRESS_STAGES = ["receiving", "ocr", "ai"];
// A run stuck in-progress longer than this (hard crash, lost process)
// no longer blocks new uploads.
const BUSY_STALE_MS = 90_000;

export function isBusy() {
  const s = global.currentStatus;
  if (!IN_PROGRESS_STAGES.includes(s.stage)) return false;
  return Date.now() - new Date(s.updatedAt).getTime() < BUSY_STALE_MS;
}

export function updateStatus(partial) {
  const next = {
    ...global.currentStatus,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  global.currentStatus = next;
  global.__statusEmitter.emit(STATUS_EVENT, next);
  return next;
}
