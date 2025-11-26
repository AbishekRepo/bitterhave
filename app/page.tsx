"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 50) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }
                setLastScrollY(window.scrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);

        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [lastScrollY]);

    return (
        <div className="min-h-screen text-gray-100 font-sans selection:bg-purple-500 selection:text-white bg-[#0a0a0a]">
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'} bg-[#141414]/95 backdrop-blur-sm border-b border-white/5`}>
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-xl font-bold tracking-tight font-serif">Bitterhave</div>
                    <div className="flex gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            <section className="container mx-auto pl-6 pb-5 pt-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="flex-1 text-center lg:text-left z-10">
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white font-serif leading-[1.1]">
                        Your AI Interview <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Co-Pilot</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Paste any Job Description + your interview date → get a complete, day-wise preparation roadmap in under 30 sec.
                    </p>
                    <Link href="/dashboard">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 text-lg rounded-full transition-all shadow-lg hover:shadow-blue-500/25 font-bold tracking-wide">
                            GET STARTED
                        </Button>
                    </Link>
                </div>
                <div className="hidden lg:block flex-1 relative w-full aspect-[4/3] lg:aspect-square max-h-[500px]">
                    <div className="relative w-full h-full">
                        <Image
                            src="/hero-image-coding.png"
                            alt="AI Interview Co-Pilot"
                            fill
                            className="object-cover object-center lg:object-[left_70%]"
                            priority
                        />
                        {/* Gradient Blends */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent lg:w-2/3"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent h-1/3 mt-auto"></div>
                    </div>
                </div>
            </section>

            {/* Main Content - Our Services */}
            <section className="container mx-auto px-6 pb-8">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2 font-serif text-white">Our Services</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Two powerful ways to master your interview preparation.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 max-w-6xl mx-auto">
                    {/* Service 1: Roadmap Generator */}
                    <Card className="bg-[#1a1a1a] border-gray-800 text-gray-100 hover:border-gray-700 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl font-serif text-blue-400">Roadmap Generator</CardTitle>
                            <CardDescription className="text-gray-400">
                                A completely free tool to structure your prep.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative pl-6 border-l border-gray-800 space-y-6 ml-2">
                                {/* Step 1 */}
                                <div className="relative">
                                    <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-[#1a1a1a]"></div>
                                    <h3 className="text-lg font-bold mb-1 text-gray-200">Paste the Job Description</h3>
                                    <p className="text-gray-400 text-sm">Add your resume for deeper personalization.</p>
                                </div>
                                {/* Step 2 */}
                                <div className="relative">
                                    <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-[#1a1a1a]"></div>
                                    <h3 className="text-lg font-bold mb-1 text-gray-200">Pick Your Interview Date</h3>
                                    <p className="text-gray-400 text-sm">We calculate your available study time.</p>
                                </div>
                                {/* Step 3 */}
                                <div className="relative">
                                    <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-[#1a1a1a]"></div>
                                    <h3 className="text-lg font-bold mb-1 text-gray-200">Get Your Roadmap</h3>
                                    <ul className="space-y-1 text-sm">
                                        <li className="flex items-center gap-2 text-gray-300">
                                            <span className="text-green-400">✓</span> Personalized roadmap
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
                    <Card className="bg-[#1a1a1a] border-gray-800 text-gray-100 hover:border-gray-700 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl font-serif text-purple-400">AI Interview Co-Pilot</CardTitle>
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
                                    "Priority support"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-purple-500 mt-0.5">✓</span>
                                        <span className="text-gray-200">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-[#242424] rounded-lg p-3 border border-gray-700 space-y-2">
                                <div className="flex justify-between items-center text-sm p-1.5 rounded hover:bg-[#2a2a2a] transition-colors">
                                    <span className="font-medium text-gray-300">Starter Pack</span>
                                    <span className="text-gray-500">100 credits</span>
                                </div>
                                <div className="flex justify-between items-center text-sm bg-[#2a2a2a] p-1.5 rounded border border-gray-600">
                                    <span className="font-bold text-white">Regular Pack</span>
                                    <span className="text-gray-400">500 credits</span>
                                </div>
                                <div className="flex justify-between items-center text-sm p-1.5 rounded hover:bg-[#2a2a2a] transition-colors">
                                    <span className="font-medium text-gray-300">Pro Pack</span>
                                    <span className="text-gray-500">1000 credits</span>
                                </div>
                                <p className="text-center text-xs text-gray-500 pt-1">Credits never expire.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Pricing Footer */}
            <section className="container mx-auto px-6 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-2 font-serif">Pricing (Simple & Flexible)</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto items-center">
                    <div className="text-center md:text-right">
                        <h3 className="text-xl font-bold mb-2 font-serif">Free Forever</h3>
                        <p className="text-gray-400">Roadmap only</p>
                    </div>

                    <div className="text-center md:text-left border-l-0 md:border-l border-gray-700 md:pl-12">
                        <h3 className="text-xl font-bold mb-2 font-serif">Credit Packs</h3>
                        <p className="text-gray-400 mb-6">Pay once, use anytime</p>

                        <div className="space-y-2 mb-8">
                            <div className="text-gray-400">100 credits</div>
                            <div className="text-gray-400">300 credits</div>
                            <div className="text-gray-100 font-bold">1000 credits (best value)</div>
                        </div>

                        <Link href="/dashboard" className="inline-block px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-100 font-bold rounded-lg border border-gray-600 transition-all">
                            Buy Credits
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="container mx-auto px-6 py-8 text-center text-gray-600 text-sm">
                © {new Date().getFullYear()} Bitterhave. All rights reserved.
            </footer>
        </div>
    );
}

