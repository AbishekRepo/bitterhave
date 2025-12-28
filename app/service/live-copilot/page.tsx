"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      className={`group flex items-center gap-4 p-4 w-full text-left transition-all rounded-xl border ${checked
        ? "bg-green-500/5 dark:bg-green-500/10 border-green-500/20 shadow-sm"
        : "bg-background border-border hover:border-green-500/50 hover:bg-accent/5 hover:shadow-sm"
        }`}
      onClick={onToggle}
    >
      <div
        className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${checked
          ? "bg-green-500 border-green-500 scale-110 shadow-md"
          : "border-muted-foreground/30 bg-background group-hover:border-green-500/70"
          }`}
      >
        <CheckCircle2
          className={`w-4 h-4 text-white stroke-[3] ${checked ? "opacity-100" : "opacity-0"
            } transition-opacity`}
        />
      </div>
      <span
        className={`text-base ${checked
          ? "text-foreground font-medium"
          : "text-muted-foreground group-hover:text-foreground transition-colors"
          }`}
      >
        {text}
      </span>
    </button>
  );
}

export default function LiveCopilotPage() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const sparks = profile?.sparks || 0;

  // Available hotkey options
  const hotkeyOptions = [
    { value: "Ctrl + Alt + Shift + A", label: "Ctrl + Alt + Shift + A", description: "Completely free." },
    { value: "Ctrl + Alt + Shift + B", label: "Ctrl + Alt + Shift + B", description: "Unused natively." },
    { value: "Ctrl + Alt + Shift + F", label: "Ctrl + Alt + Shift + F", description: "Safe and ergonomic." },
    { value: "Ctrl + Alt + Shift + G", label: "Ctrl + Alt + Shift + G", description: "Highly available." },
    { value: "Ctrl + Alt + Shift + H", label: "Ctrl + Alt + Shift + H", description: "No conflicts." },
    { value: "Ctrl + Alt + Shift + J", label: "Ctrl + Alt + Shift + J", description: "Free across environments." },
    { value: "Ctrl + Alt + Shift + M", label: "Ctrl + Alt + Shift + M", description: "Excellent choice." },
    { value: "Ctrl + Alt + Shift + N", label: "Ctrl + Alt + Shift + N", description: "Unused." },
    { value: "Ctrl + Alt + Shift + V", label: "Ctrl + Alt + Shift + V", description: "Safe (distinct from common two-modifier combos)." },
    { value: "Ctrl + Alt + Shift + X", label: "Ctrl + Alt + Shift + X", description: "Very reliable." },
  ];

  const [hotkey, setHotkey] = useState("Ctrl + Alt + Shift + A");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [checks, setChecks] = useState({
    python: false,
    verified: false,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyCommand = () => {
    navigator.clipboard.writeText("python live_helper.py");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
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

      // Get session ID from response header
      const newSessionId = response.headers.get("X-Session-Id");
      if (newSessionId) {
        setSessionId(newSessionId);
      }

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
        description: "Install dependencies with: pip install keyboard pillow pystray requests",
      });
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const handleConnectSession = () => {
    if (!checks.python || !checks.verified) {
      toast.error("Please complete the system requirements first");
      return;
    }

    if (!sessionId) {
      toast.error("Please download the script first", {
        description: "Download the live_helper.py script to create a session."
      });
      return;
    }

    // Navigate to session page
    router.push(`/service/live-copilot/session/${sessionId}`);
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

        {/* Steps 2-5 Container */}
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

                {/* Custom Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full p-4 text-left text-base font-medium rounded-lg border-2 border-border bg-background hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{hotkey}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-background border-2 border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                      {hotkeyOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setHotkey(option.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 ${hotkey === option.value ? 'bg-primary/5' : ''
                            }`}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-base font-medium text-foreground">
                              {option.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mt-3">
                  Choose a key combination from the safe options above. Default is Ctrl + Alt + Shift + A.
                </p>
              </div>
            </section>

            {/* Step 3: Download */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Download & Install</h3>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                {/* Install dependencies */}
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
                      onClick={handleDownload}
                      disabled={downloading}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {downloading ? "Downloading..." : "Download live_helper.py"}
                    </button>
                  </div>

                  {sessionId && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Script downloaded! Session created.
                      </span>
                    </div>
                  )}
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
            </section>

            {/* Step 4: Start Helper */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  4
                </div>
                <h3 className="text-xl font-semibold">Start the Helper</h3>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden font-mono text-sm">
                <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-sans">
                    Run the script
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
            </section>

            {/* Step 5: Output Method */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  5
                </div>
                <h3 className="text-xl font-semibold">View Responses</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6 text-left">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <Monitor className="w-6 h-6 text-foreground" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">
                    Terminal Output
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI responses are displayed directly in the terminal where the script runs.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    Hotkey:{" "}
                    <span className="text-primary font-semibold">{hotkey}</span>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 text-left">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6 text-foreground" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Web Dashboard</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    View responses on any device. Click &quot;Connect Session&quot; below to open.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    Auto-refresh enabled
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={handleConnectSession}
            disabled={!sessionId}
            className={`flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-lg transition-all shadow-lg ${!checks.python || !checks.verified || !sessionId
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
          >
            Connect Live Session
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {!sessionId && checks.python && checks.verified && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Download the script first to create a session
          </p>
        )}
      </main>
    </div>
  );
}
