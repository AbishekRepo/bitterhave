"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    FileText,
    Calendar,
    Loader2,
    Download,
    CheckCircle2,
    Clock,
    Target,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "sonner";

interface RoadmapItem {
    topic: string;
    description: string;
    estimatedHours: number;
    priority: "high" | "medium" | "low";
    subtopics?: string[];
    isCompleted?: boolean;
}

interface RoadmapData {
    topics: RoadmapItem[];
    totalHours: number;
}

export default function RoadmapPage() {
    const router = useRouter();
    const { profile, isLoggedIn, isLoading: authLoading } = useAuthStore();
    const sparks = profile?.sparks || 0;

    const [jobDescription, setJobDescription] = useState("");
    const [interviewDate, setInterviewDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
    const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());

    // Redirect to login if not authenticated
    React.useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push("/login?next=/service/roadmap");
        }
    }, [authLoading, isLoggedIn, router]);

    const handleSubmit = async () => {
        if (!jobDescription.trim()) {
            toast.error("Please paste a job description");
            return;
        }

        if (!profile?.id) {
            toast.error("Authentication required");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/roadmap/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobDescription: jobDescription.trim(),
                    interviewDate: interviewDate || null,
                    userId: profile.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to generate roadmap");
            }

            const data = await response.json();
            setRoadmap(data);
            setCompletedItems(new Set());
            toast.success("Roadmap generated successfully!");
        } catch (error) {
            console.error("Error generating roadmap:", error);
            toast.error(error instanceof Error ? error.message : "Failed to generate roadmap");
        } finally {
            setLoading(false);
        }
    };

    const toggleComplete = (index: number) => {
        setCompletedItems((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "text-red-400 bg-red-500/10 border-red-500/20";
            case "medium":
                return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
            case "low":
                return "text-green-400 bg-green-500/10 border-green-500/20";
            default:
                return "text-gray-400 bg-gray-500/10 border-gray-500/20";
        }
    };

    const calculateDaysRemaining = () => {
        if (!interviewDate) return null;
        const today = new Date();
        const interview = new Date(interviewDate);
        const diffTime = interview.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const daysRemaining = calculateDaysRemaining();

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 no-print">
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
                {/* Page Title */}
                <div className="mb-8 no-print">
                    <h1 className="text-xl font-semibold text-foreground">
                        Roadmap Generator
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Get a personalized interview prep plan based on job requirements
                    </p>
                </div>

                {/* Input Section */}
                {!roadmap && (
                    <div className="space-y-6">
                        {/* Job Description Input */}
                        <section className="bg-card border border-border rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Job Description</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Paste the full job description for analysis
                                    </p>
                                </div>
                            </div>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                className="w-full h-64 p-4 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                            />
                        </section>

                        {/* Interview Date Input */}
                        <section className="bg-card border border-border rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Interview Date{" "}
                                        <span className="text-muted-foreground font-normal text-sm">
                                            (Optional)
                                        </span>
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Set your target date to calculate a timeline
                                    </p>
                                </div>
                            </div>
                            <input
                                type="date"
                                value={interviewDate}
                                onChange={(e) => setInterviewDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full max-w-xs p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                            />
                        </section>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !jobDescription.trim()}
                                className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating Roadmap...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate Roadmap
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Roadmap Display */}
                {roadmap && (
                    <div className="print-area">
                        {/* Summary Header */}
                        <div className="bg-card border border-border rounded-lg p-6 mb-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">
                                        Your Interview Prep Roadmap
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Target className="w-4 h-4" />
                                            {roadmap.topics.length} topics
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            ~{roadmap.totalHours} hours total
                                        </span>
                                        {daysRemaining !== null && (
                                            <span className="flex items-center gap-1.5 text-primary">
                                                <Calendar className="w-4 h-4" />
                                                {daysRemaining} days remaining
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3 no-print">
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={() => {
                                            setRoadmap(null);
                                            setJobDescription("");
                                            setInterviewDate("");
                                        }}
                                        className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Start Over
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Daily Breakdown (if date provided) */}
                        {daysRemaining !== null && daysRemaining > 0 && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-6 no-print">
                                <p className="text-sm">
                                    <span className="font-medium text-primary">Suggested pace:</span>{" "}
                                    <span className="text-muted-foreground">
                                        ~{Math.ceil(roadmap.totalHours / daysRemaining)} hours/day to
                                        complete before your interview
                                    </span>
                                </p>
                            </div>
                        )}

                        {/* Topics List */}
                        <div className="space-y-4">
                            {roadmap.topics.map((item, index) => (
                                <div
                                    key={index}
                                    className={`bg-card border rounded-lg p-5 transition-all ${completedItems.has(index)
                                            ? "border-green-500/30 bg-green-500/5"
                                            : "border-border"
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleComplete(index)}
                                            className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 transition-all mt-0.5 no-print ${completedItems.has(index)
                                                    ? "bg-green-500 border-green-500"
                                                    : "border-muted-foreground/30 hover:border-green-500/70"
                                                }`}
                                        >
                                            {completedItems.has(index) && (
                                                <CheckCircle2 className="w-4 h-4 text-white stroke-[3]" />
                                            )}
                                        </button>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h3
                                                    className={`font-semibold ${completedItems.has(index)
                                                            ? "line-through text-muted-foreground"
                                                            : ""
                                                        }`}
                                                >
                                                    {item.topic}
                                                </h3>
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(
                                                        item.priority
                                                    )}`}
                                                >
                                                    {item.priority}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {item.estimatedHours}h
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {item.description}
                                            </p>
                                            {item.subtopics && item.subtopics.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {item.subtopics.map((sub, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground"
                                                        >
                                                            {sub}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Progress Summary */}
                        <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Progress</span>
                                <span className="text-sm font-medium">
                                    {completedItems.size} / {roadmap.topics.length} completed
                                </span>
                            </div>
                            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-300"
                                    style={{
                                        width: `${(completedItems.size / roadmap.topics.length) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
