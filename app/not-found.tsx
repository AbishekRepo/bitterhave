import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <div className="relative z-10 space-y-6">
                {/* Animated 404 Text */}
                <h1 className="text-9xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-gradient pb-2">
                    404
                </h1>

                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Page not found
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
                    </p>
                </div>

                <div className="flex justify-center pt-4">
                    <Link
                        href="/"
                        className="group inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-primary/25 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-pink-500/10 blur-[120px]" />
            </div>
        </div>
    );
}
