"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, RefreshCw, Clock, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AIResponse {
  id: string;
  session_id: string;
  image_id: string;
  filename: string;
  ai_response: string | null;
  created_at: string;
}

export default function LiveCopilotSession() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResponses = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `/api/live-copilot/responses?sessionId=${sessionId}&limit=50`
      );
      const data = await response.json();

      if (data.success) {
        setResponses(data.responses || []);
      }
    } catch (error) {
      console.error("Failed to fetch responses:", error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchResponses();

    // Auto-refresh every 5 seconds to check for new responses
    const interval = setInterval(fetchResponses, 5000);
    return () => clearInterval(interval);
  }, [fetchResponses]);

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Invalid session</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/service/live-copilot"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Setup</span>
          </Link>

          <button
            onClick={fetchResponses}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Live Responses</h1>
          <p className="text-muted-foreground mt-1">
            Real-time AI responses from your screenshots
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
            Session: {sessionId}
          </p>
        </div>

        {loading && responses.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : responses.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Waiting for screenshots...</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Run the <code className="px-1 py-0.5 bg-muted rounded text-xs">live_helper.py</code> script and press your hotkey to capture a screenshot.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              This page auto-refreshes every 5 seconds.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response, index) => (
              <div
                key={response.id}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {responses.length - index}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{response.filename}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(response.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 border border-border/50 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-primary mb-3">AI Analysis</h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                        {response.ai_response || "Processing..."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
