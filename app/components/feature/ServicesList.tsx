import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function ServicesList() {
    return (
        <div className="w-full">
            <div className="text-center mb-4">
                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 blur-2xl"></div>
                    <p className="relative text-base md:text-lg max-w-2xl mx-auto px-6 py-4">
                        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent font-semibold">
                            Powerful AI-driven tools
                        </span>
                        <span className="text-gray-300"> to accelerate your </span>
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                            interview preparation journey
                        </span>
                        <span className="text-gray-300">.</span>
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12 cursor-pointer">
                {/* Service 1: Roadmap Generator */}
                <Card className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 border-gray-800 text-gray-100 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="pb-3 relative z-10">
                        <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Roadmap Generator
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm">
                            Get a personalized interview prep roadmap tailored to your timeline and goals.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 relative z-10">
                        <ul className="space-y-2.5">
                            {[
                                "Paste job description & resume",
                                "AI analyzes requirements",
                                "Personalized study roadmap",
                                "Day-by-day preparation plan"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                    <span className="text-blue-400 mt-0.5 text-base">✓</span>
                                    <span className="text-gray-300">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Service 2: AI Co-Pilot */}
                <Card className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 border-gray-800 text-gray-100 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 overflow-hidden">
                    {/* Premium Badge */}
                    <div className="absolute top-3 right-3 z-20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 blur-md opacity-75 animate-pulse"></div>
                            <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                MUST TRY
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="pb-3 relative z-10">
                        <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            AI Interview Co-Pilot
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm">
                            Real-time AI assistance during interviews with instant answers and insights.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 relative z-10">
                        <ul className="space-y-2.5">
                            {[
                                "AI Interview Helper (.py tool)",
                                "Hotkey-activated screenshot analysis",
                                "Instant intelligent answers",
                                "Unlimited AI mock interviews"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                    <span className="text-blue-400 mt-0.5 text-base">✓</span>
                                    <span className="text-gray-300">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Coming Soon Message */}
            <div className="text-center py-8 max-w-3xl mx-auto">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl"></div>
                    <p className="relative text-gray-400 text-sm md:text-base font-medium px-6 py-3 rounded-full bg-[#1a1a1a] border border-gray-800">
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                            More exciting services
                        </span>{" "}
                        are in progress and will be coming soon!
                    </p>
                </div>
            </div>
        </div>
    );
}
