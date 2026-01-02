"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  CheckCircle2,
  Sparkles,
  Copy,
  Monitor,
  Smartphone,
  ExternalLink,
  ChevronDown,
  X,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

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
  const [showSessionModal, setShowSessionModal] = useState(false);
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

    // Show the session modal with QR code
    setShowSessionModal(true);
  };

  const getSessionUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/service/live-copilot/session/${sessionId}`;
    }
    return `/service/live-copilot/session/${sessionId}`;
  };

  const copySessionLink = () => {
    navigator.clipboard.writeText(getSessionUrl());
    toast.success("Link copied to clipboard!");
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

        {/* Quick Info Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-8 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            Your script will be auto-configured with your account credentials.
          </p>
        </div>

        {/* Step 1: System Requirements */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              1
            </div>
            <h3 className="text-xl font-semibold">Verify Python</h3>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <p className="text-sm text-muted-foreground flex-1">
                Python 3.9+ required.{" "}
                <a
                  href="https://www.python.org/downloads/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  Download Python
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <CheckItem
                text="Python installed"
                checked={checks.python}
                onToggle={() =>
                  setChecks({ ...checks, python: !checks.python })
                }
              />
              <CheckItem
                text={
                  <>
                    Verified via{" "}
                    <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono">
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
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  2
                </div>
                <h3 className="text-xl font-semibold">Select Hotkey</h3>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full p-3 text-left text-sm font-medium rounded-lg border border-border bg-background hover:border-primary/50 focus:border-primary focus:outline-none transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{hotkey}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {hotkeyOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setHotkey(option.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 text-sm ${hotkey === option.value ? 'bg-primary/5' : ''}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Step 3: Download */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Download Script</h3>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                {/* Download button - prominent */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Get your personalized script</p>
                    {sessionId && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Session ready
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    {downloading ? "Downloading..." : "Download Script"}
                  </button>
                </div>

                {/* Dependencies - compact */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Install dependencies first:</p>
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded block truncate">
                        pip install keyboard pillow pystray requests
                      </code>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("pip install keyboard pillow pystray requests");
                        toast.success("Copied!");
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
                      title="Copy command"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 4: Run Script */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  4
                </div>
                <h3 className="text-xl font-semibold">Run Script</h3>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-sm font-mono bg-muted px-3 py-2 rounded flex-1">
                    python live_helper.py
                  </code>
                  <button
                    onClick={copyCommand}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">{hotkey}</kbd> to capture
                </p>
              </div>
            </section>

            {/* Step 5: Connect Session */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  5
                </div>
                <h3 className="text-xl font-semibold">Connect Session</h3>
              </div>

              <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold">View on Mobile</h4>
                    <p className="text-sm text-muted-foreground">
                      Scan QR code or open link on your phone
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      <Monitor className="w-3 h-3" />
                      Desktop: Soon
                    </span>
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
            →
          </button>
        </div>

        {!sessionId && checks.python && checks.verified && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Download the script first to create a session
          </p>
        )}
      </main>

      {/* Session Modal with QR Code */}
      {showSessionModal && sessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSessionModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowSessionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Connect Your Session</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Scan the QR code with your phone to view responses
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-xl shadow-inner">
                <QRCodeSVG
                  value={getSessionUrl()}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Session Link */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Session Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm font-mono text-muted-foreground truncate">
                  {getSessionUrl()}
                </div>
                <button
                  onClick={copySessionLink}
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Continue in Browser Button */}
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/service/live-copilot/session/${sessionId}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Continue in Browser
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Or open the link on your mobile device
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
