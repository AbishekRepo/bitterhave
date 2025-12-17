"use client";

import React, { useState } from "react";
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

export default function LiveCopilotPage() {
  const { profile } = useAuthStore();
  const sparks = profile?.sparks || 0;
  const [hotkey, setHotkey] = useState("Ctrl + Shift + X");
  const [recording, setRecording] = useState(false);
  const [copied, setCopied] = useState(false);
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
              {/* Windows Title Bar */}
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

              {/* Console Content */}
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
                    "Please check you installed python and verified checks to proceed.",
                  action: {
                    label: "Got it",
                    onClick: () => console.log("Toast closed"),
                  },
                });
              }}
            />
          ) : null}

          <div
            className={
              !checks.python || !checks.verified
                ? "opacity-40 pointer-events-none select-none transition-opacity duration-300"
                : "transition-opacity duration-300"
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
                  other applications during your interview.
                </p>
              </div>
            </section>

            {/* Step 3: Download */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  3
                </div>
                <h3 className="text-xl font-semibold">
                  Download Helper Script
                </h3>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <button className="flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                  <Download className="w-5 h-5" />
                  Download live_helper.py
                </button>
                <p className="text-sm text-muted-foreground mt-4">
                  This Python script includes embedded authentication tokens for
                  your account. Store it securely.
                </p>
              </div>
            </section>

            {/* Step 4: Execution */}
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
                    Command
                  </span>
                  <button
                    onClick={copyCommand}
                    className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground transition-colors"
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
                toast.error("Please complete the system requirements first", {
                  description:
                    "Please check you installed python and verified checks to proceed.",
                  action: {
                    label: "Got it",
                    onClick: () => console.log("Toast closed"),
                  },
                });
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
