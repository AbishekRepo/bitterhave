"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroButtons() {
    const { isLoggedIn } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const destination = mounted && isLoggedIn ? "/service" : "/login";

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full transition-all shadow-lg hover:shadow-blue-500/25 font-bold tracking-wide">
                <Link href={destination}>
                    Try Free – 20 Sparks
                </Link>
            </Button>
            <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-6 text-lg rounded-full transition-all font-bold tracking-wide bg-transparent">
                <Link href="#services">
                    Features
                </Link>
            </Button>
        </div>
    );
}
