"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  CheckCircle2,
  Sparkles,
  Copy,
  ChevronRight,
  Monitor,
  Smartphone,
  Terminal,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";

import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "sonner";

interface CheckItemProps {
  text: React.ReactNode;
  checked: boolean;
  onToggle: () => void;
}

function CheckItem({ text, checked, onToggle }: CheckItemProps) {
  return (
    <button
      className={`group flex items-center gap-4 p-4 w-full text-left transition-all rounded-xl border ${
        checked
          ? "bg-green-500/5 dark:bg-green-500/10 border-green-500/20 shadow-sm"
          : "bg-background border-border hover:border-green-500/50 hover:bg-accent/5 hover:shadow-sm"
      }`}
      onClick={onToggle}
    >
      <div
        className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
          checked
            ? "bg-green-500 border-green-500 scale-110 shadow-md"
            : "border-muted-foreground/30 bg-background group-hover:border-green-500/70"
        }`}
      >
        <CheckCircle2
          className={`w-4 h-4 text-white stroke-[3] ${
            checked ? "opacity-100" : "opacity-0"
          } transition-opacity`}
        />
      </div>
      <span
        className={`text-base ${
          checked
            ? "text-foreground font-medium"
            : "text-muted-foreground group-hover:text-foreground transition-colors"
        }`}
      >
        {text}
      </span>
    </button>
  );
}

function SessionStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<"checking" | "ready" | "inactive">(
    "checking"
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;

    const checkSession = async () => {
      try {
        const response = await fetch(
          `/api/live-copilot/status?userId=${userId}`
        );
        const data = await response.json();

        if (data.isActive) {
          setStatus("ready");
          toast.success("🎉 Session Connected!", {
            description:
              "Your Live Interview Helper is now active and ready to assist.",
            duration: 5000,
          });
          if (intervalId) clearInterval(intervalId);
        } else {
          setStatus("inactive");
        }
      } catch {
        setStatus("inactive");
      }
    };

    checkSession();
    intervalId = setInterval(checkSession, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [userId]);

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
        status === "ready"
          ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
          : status === "checking"
          ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
          : "bg-muted border-border text-muted-foreground"
      }`}
    >
      {status === "ready" && (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Session Active</span>
        </>
      )}
      {status === "checking" && (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Waiting for connection...</span>
        </>
      )}
      {status === "inactive" && (
        <>
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Run the script to connect</span>
        </>
      )}
    </div>
  );
}

export default function LiveCopilotPage() {
  const { profile } = useAuthStore();
  const sparks = profile?.sparks || 0;
  const [hotkey, setHotkey] = useState("Ctrl + Shift + X");
  const [recording, setRecording] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [checks, setChecks] = useState({
    python: false,
    verified: false,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!recording) return;
    e.preventDefault();
    const keys: string[] = [];
    if (e.ctrlKey) keys.push("Ctrl");
    if (e.shiftKey) keys.push("Shift");
    if (e.altKey) keys.push("Alt");
    if (e.metaKey) keys.push("Meta");
    if (e.key && !["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
      keys.push(e.key.toUpperCase());
    }
    if (keys.length > 1) {
      setHotkey(keys.join(" + "));
    }
  };

  const copyCommand = () => {
    navigator.clipboard.writeText("python live_helper.py");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOneClickSetup = async () => {
    if (!profile?.id) {
      toast.error("Authentication required", {
        description: "Please log in to download the setup script.",
      });
      return;
    }

    setDownloading(true);
    const isWindows = navigator.platform.toLowerCase().includes("win");
    const isMac = navigator.platform.toLowerCase().includes("mac");

    try {
      const response = await fetch("/api/live-copilot/download-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          hotkey: hotkey,
          platform: isWindows ? "windows" : isMac ? "macos" : "linux",
        }),
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = isWindows ? "setup-live-helper.bat" : "setup-live-helper.sh";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("✅ Setup script downloaded!", {
        description: isWindows
          ? "Double-click the .bat file to install everything automatically"
          : "Run in terminal: chmod +x setup-live-helper.sh && ./setup-live-helper.sh",
        duration: 8000,
      });
    } catch {
      toast.error("Download failed", {
        description: "Please try the manual setup option below",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleManualDownload = async () => {
    if (!profile?.id) {
      toast.error("Authentication required");
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch("/api/live-copilot/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          hotkey: hotkey,
        }),
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "live_helper.py";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Downloaded live_helper.py", {
        description:
          "Install dependencies with: pip install keyboard pillow pystray requests",
      });
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight font-serif hover:opacity-80 transition-opacity"
          >
            Bitterhave
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              <span className="text-muted-foreground">Sparks:</span>{" "}
              <span className="text-foreground font-semibold">{sparks}</span>
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-12 pt-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">
            Live Interview Helper
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time AI assistance for interviews
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-3">Setup Instructions</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Follow these steps to configure your Live Interview Helper. This
              tool captures screenshots on demand and provides AI-powered
              responses in real-time.
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> The downloaded
              file is uniquely generated for your account with embedded
              authentication. No manual configuration required.
            </div>
          </div>
        </section>

        {/* Step 1: System Requirements */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              1
            </div>
            <h3 className="text-xl font-semibold">System Requirements</h3>
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-muted-foreground mb-2">
                If you have Python installed on your system, please manually
                check the boxes below to proceed. Otherwise, download and
                install Python from the link below:
              </p>
              <a
                href="https://www.python.org/downloads/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                https://www.python.org/downloads/
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <CheckItem
                text="Python 3.9 or higher installed"
                checked={checks.python}
                onToggle={() =>
                  setChecks({ ...checks, python: !checks.python })
                }
              />
              <CheckItem
                text={
                  <>
                    Verified via{" "}
                    <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                      python --version
                    </code>
                  </>
                }
                checked={checks.verified}
                onToggle={() =>
                  setChecks({ ...checks, verified: !checks.verified })
                }
              />
            </div>

            <div className="rounded-lg overflow-hidden shadow-2xl border border-border/50 bg-[#0c0c0c] font-mono text-sm ring-1 ring-white/10">
              <div className="bg-[#1f1f1f] px-3 py-1.5 flex items-center justify-between select-none border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs text-white font-sans">
                    Command Prompt
                  </span>
                </div>
                <div className="flex gap-4 text-white/40">
                  <span className="hover:text-white cursor-pointer px-1">
                    _
                  </span>
                  <span className="hover:text-white cursor-pointer px-1">
                    □
                  </span>
                  <span className="hover:text-white hover:bg-red-600 px-2 -mr-3 transition-colors cursor-pointer">
                    ×
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-1 font-mono text-xs md:text-sm text-[#cccccc]">
                <div className="mb-4 text-xs opacity-70">
                  Microsoft Windows [Version 10.0.19045.3693]
                  <br />
                  (c) Microsoft Corporation. All rights reserved.
                </div>

                <div className="text-green-400/80 mb-2 select-none">
                  REM Check if python is installed:
                </div>

                <div>
                  <span className="select-none">C:\Users\You&gt;</span>
                  <span className="text-white ml-1">python --version</span>
                </div>
                <div className="mb-3 pl-0.5">Python 3.11.4</div>

                <div>
                  <span className="select-none">C:\Users\You&gt;</span>
                  <span className="animate-pulse bg-white/50 inline-block w-2 h-4 ml-1 align-middle"></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps 2-6 Container */}
        <div className="relative">
          {!checks.python || !checks.verified ? (
            <div
              className="absolute inset-0 z-10 cursor-not-allowed bg-background/50 backdrop-blur-[1px]"
              onClick={() => {
                toast.error("Please complete the system requirements first", {
                  description:
                    "Check that you have Python installed and verified.",
                });
              }}
            />
          ) : null}

          <div
            className={
              !checks.python || !checks.verified
                ? "opacity-40 pointer-events-none select-none"
                : ""
            }
          >
            {/* Step 2: Hotkey Configuration */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  2
                </div>
                <h3 className="text-xl font-semibold">
                  Configure Activation Hotkey
                </h3>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <label className="block text-sm font-medium text-muted-foreground mb-3">
                  Keyboard Shortcut
                </label>
                <div
                  className={`relative flex items-center justify-center p-6 text-xl font-semibold rounded-lg border-2 transition-all cursor-pointer ${
                    recording
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                  onClick={() => setRecording(!recording)}
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setRecording(false)}
                >
                  {recording ? "Press key combination..." : hotkey}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded border border-border">
                    {recording ? "Listening" : "Click to edit"}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Choose a unique key combination that won&apos;t conflict with
                  other applications.
                </p>
              </div>
            </section>

            {/* Step 3: One-Click Setup */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Setup & Download</h3>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                {/* One-Click Setup - Recommended */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1">
                        ⭐ Recommended: One-Click Setup
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Download a setup script that automatically installs all
                        dependencies and starts the helper.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleOneClickSetup}
                    disabled={downloading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download One-Click Setup
                      </>
                    )}
                  </button>

                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>
                        Automatically installs all required dependencies
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Downloads and configures the helper script</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Starts the session automatically</span>
                    </p>
                  </div>

                  <div className="mt-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">
                        Security Note:
                      </strong>{" "}
                      This script contains your personal authentication
                      credentials. Do not share it with others.
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or manual setup
                    </span>
                  </div>
                </div>

                {/* Manual Setup Option */}
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    If the automatic setup doesn&apos;t work (antivirus
                    blocking), use manual setup:
                  </p>

                  <div className="space-y-3">
                    <div className="bg-card border border-border rounded-lg overflow-hidden font-mono text-sm">
                      <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-sans">
                          Step 1: Install dependencies
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              "pip install keyboard pillow pystray requests"
                            );
                            toast.success("Copied!");
                          }}
                          className="p-1 hover:bg-background rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4">
                        <span className="text-muted-foreground">$</span> pip
                        install keyboard pillow pystray requests
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Step 2: Download Python script
                      </span>
                      <button
                        onClick={handleManualDownload}
                        disabled={downloading}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        Download live_helper.py
                      </button>
                    </div>
                  </div>

                  <details className="group">
                    <summary className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:text-primary/80">
                      <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                      What do these dependencies do?
                    </summary>
                    <div className="mt-3 ml-6 space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          <code className="px-1 py-0.5 bg-muted rounded text-xs">
                            keyboard
                          </code>{" "}
                          - Captures hotkey presses
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          <code className="px-1 py-0.5 bg-muted rounded text-xs">
                            pillow
                          </code>{" "}
                          - Takes screenshots
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          <code className="px-1 py-0.5 bg-muted rounded text-xs">
                            pystray
                          </code>{" "}
                          - System tray icon
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          <code className="px-1 py-0.5 bg-muted rounded text-xs">
                            requests
                          </code>{" "}
                          - API communication
                        </span>
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </section>

            {/* Step 4: Start Helper */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  4
                </div>
                <h3 className="text-xl font-semibold">Start the Helper</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg overflow-hidden font-mono text-sm">
                  <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-sans">
                      For One-Click Setup
                    </span>
                  </div>
                  <div className="p-4 text-muted-foreground">
                    <p className="mb-2">
                      Windows:{" "}
                      <span className="text-foreground">
                        Double-click setup-live-helper.bat
                      </span>
                    </p>
                    <p>
                      Mac/Linux:{" "}
                      <span className="text-foreground">
                        Run ./setup-live-helper.sh
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden font-mono text-sm">
                  <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-sans">
                      For Manual Setup
                    </span>
                    <button
                      onClick={copyCommand}
                      className="p-1 hover:bg-background rounded"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-muted-foreground">$</span> python
                      live_helper.py
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Initializing... Done
                      <br />
                      <span className="text-green-600 dark:text-green-500">
                        ✓ Active - Listening for {hotkey}
                      </span>
                    </div>
                  </div>
                </div>

                {profile?.id && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Connection Status:
                    </p>
                    <SessionStatus userId={profile.id} />
                  </div>
                )}
              </div>
            </section>

            {/* Step 5: Output Method */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  5
                </div>
                <h3 className="text-xl font-semibold">Select Output Method</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <button className="bg-card border border-border hover:border-primary/50 rounded-lg p-6 text-left transition-all group">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <Monitor className="w-6 h-6 text-foreground" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">
                    Desktop Overlay
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Display responses directly on your screen. Best for single
                    monitor setups.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    Activated by:{" "}
                    <span className="text-primary font-semibold">{hotkey}</span>
                  </div>
                </button>

                <button className="bg-card border border-border hover:border-primary/50 rounded-lg p-6 text-left transition-all group">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <Smartphone className="w-6 h-6 text-foreground" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Mobile Console</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    View responses on your mobile device. Keeps your primary
                    screen clear.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    Auto-sync enabled
                  </div>
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={() => {
              if (!checks.python || !checks.verified) {
                toast.error("Please complete the system requirements first");
                return;
              }
            }}
            className={`flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-lg transition-all shadow-lg ${
              !checks.python || !checks.verified
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            Connect Live Session
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
