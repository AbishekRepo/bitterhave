import { getStatus, statusEmitter, STATUS_EVENT } from "@/app/lib/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const encoder = new TextEncoder();
  let onUpdate;
  let heartbeat;

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {
          // controller already closed (client gone); ignore
        }
      };

      send(getStatus()); // flush current status immediately on connect

      onUpdate = (status) => send(status);
      statusEmitter.on(STATUS_EVENT, onUpdate);

      // Idle-connection insurance for any future reverse proxy; harmless
      // today since this app is only ever run via next dev/next start.
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // ignore
        }
      }, 25000);

      const cleanup = () => {
        clearInterval(heartbeat);
        statusEmitter.off(STATUS_EVENT, onUpdate);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      req.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      clearInterval(heartbeat);
      if (onUpdate) statusEmitter.off(STATUS_EVENT, onUpdate);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
