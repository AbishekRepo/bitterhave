"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";

export default function ServicesSection() {
    const { isLoggedIn } = useAuthStore();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        if (isLoggedIn) {
            router.push(path);
        } else {
            router.push(`/login?next=${encodeURIComponent(path)}`);
        }
    };

    return (
        <section id="services" className="container mx-auto px-6 pb-8">
            <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 font-serif text-white">
                    Our Features
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Two powerful ways to master your interview preparation.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-6xl mx-auto">
                {/* Service 1: Roadmap Generator */}
                <Card
                    onClick={() => handleNavigation("/service/roadmap-generator")}
                    className="bg-[#1a1a1a] border-gray-800 text-gray-100 hover:border-gray-700 transition-colors cursor-pointer"
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-serif text-blue-400">
                            Roadmap Generator
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            A completely free tool to structure your prep.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative pl-6 border-l border-gray-800 space-y-6 ml-2">
                            {/* Step 1 */}
                            <div className="relative">
                                <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-[#1a1a1a]"></div>
                                <h3 className="text-lg font-bold mb-1 text-gray-200">
                                    Paste the Job Description
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Add your resume for deeper personalization.
                                </p>
                            </div>
                            {/* Step 2 */}
                            <div className="relative">
                                <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-[#1a1a1a]"></div>
                                <h3 className="text-lg font-bold mb-1 text-gray-200">
                                    Pick Your Interview Date
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    We calculate your available study time.
                                </p>
                            </div>
                            {/* Step 3 */}
                            <div className="relative">
                                <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-[#1a1a1a]"></div>
                                <h3 className="text-lg font-bold mb-1 text-gray-200">
                                    Get Your Roadmap
                                </h3>
                                <ul className="space-y-1 text-sm">
                                    <li className="flex items-center gap-2 text-gray-300">
                                        <span className="text-green-400">✓</span> Personalized
                                        roadmap
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-300">
                                        <span className="text-green-400">✓</span> Daily study plan
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-300">
                                        <span className="text-green-400">✓</span> Printable PDF
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Service 2: AI Co-Pilot */}
                <Card
                    onClick={() => handleNavigation("/service/live-copilot")}
                    className="bg-[#1a1a1a] border-gray-800 text-gray-100 hover:border-gray-700 transition-colors cursor-pointer"
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-serif text-purple-400">
                            AI Interview Co-Pilot
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Premium tools powered by credits.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 mb-4">
                            {[
                                "AI Interview Helper (.py tool)",
                                "Press a hotkey anywhere",
                                "Screenshot → get instant answer",
                                "Unlimited AI mock interviews",
                                "Deep skill-gap report",
                                "Priority support",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-purple-500 mt-0.5">✓</span>
                                    <span className="text-gray-200">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
