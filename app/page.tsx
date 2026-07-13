"use client";

import { useEffect, useState } from "react";
import ResponseDisplay from "./components/ResponseDisplay";

type Stage = "idle" | "receiving" | "ocr" | "ai" | "done" | "error";
type ConnectionState = "connecting" | "connected" | "reconnecting";

interface StatusPayload {
  stage: Stage;
  message: string;
  data?: {
    data?: {
      choices?: { message?: { content?: string } }[];
    };
  } | null;
}

const STAGE_STYLES: Record<Stage, { dot: string; label: string; pulse?: boolean }> = {
  idle: { dot: "bg-gray-400", label: "Waiting for screenshot" },
  receiving: { dot: "bg-blue-400", label: "Screenshot received", pulse: true },
  ocr: { dot: "bg-blue-400", label: "Extracting text…", pulse: true },
  ai: { dot: "bg-blue-400", label: "Asking AI…", pulse: true },
  done: { dot: "bg-green-400", label: "Done" },
  error: { dot: "bg-red-500", label: "Error" },
};

export default function Home() {
  const [response, setResponse] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Waiting for a screenshot..."
  );
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/status");

    es.onopen = () => setConnectionState("connected");

    es.onmessage = (event) => {
      const payload: StatusPayload = JSON.parse(event.data);
      setConnectionState("connected");
      setStage(payload.stage);
      setStatusMessage(payload.message);

      if (payload.stage === "done" && payload.data) {
        const content = payload.data.data?.choices?.[0]?.message?.content;
        if (content) setResponse(content);
      }
      // On "error", intentionally leave `response` as-is so the last
      // successful answer stays visible; the pill communicates the failure.
    };

    es.onerror = () => setConnectionState("reconnecting");

    return () => es.close();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/response");
      const data = await res.json();
      const content = data?.data?.data?.choices?.[0]?.message?.content;
      if (data.success && content) setResponse(content);
    } catch (error) {
      console.error("Error refreshing response:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const style = STAGE_STYLES[stage];

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen bg-gray-900">
      {/* Live status pill */}
      <div className="fixed top-4 right-4 z-10 flex items-center gap-2 bg-gray-800/90 border border-gray-700 rounded-full px-3 py-1 text-xs text-gray-100 shadow-md">
        <span
          className={`h-2 w-2 rounded-full ${style.dot} ${
            style.pulse ? "animate-pulse" : ""
          }`}
        />
        <span>{stage === "error" ? statusMessage : style.label}</span>
        {connectionState === "reconnecting" && (
          <span className="text-gray-400">(reconnecting…)</span>
        )}
      </div>

      {/* Fallback manual refresh */}
      <button
        onClick={refresh}
        disabled={refreshing}
        className="text-xs text-gray-400 hover:text-gray-200 underline mb-2 disabled:opacity-50"
      >
        {refreshing ? "Refreshing..." : "Refresh manually"}
      </button>

      {/* Response Display */}
      <div className="rounded-lg bg-gray-800 min-h-[200px] shadow-inner mt-2 p-4 overflow-hidden">
        {response ? (
          <ResponseDisplay content={response} />
        ) : (
          <p className="text-center text-gray-100">
            {stage === "error" ? statusMessage : "Just wait for a moment"}
          </p>
        )}
      </div>
    </div>
  );
}
