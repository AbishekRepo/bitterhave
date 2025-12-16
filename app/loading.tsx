export default function Loading() {
    return (
        <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 py-20">
            <div className="relative flex h-20 w-20 items-center justify-center">
                {/* Outer glowing ring */}
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75 duration-1000"></div>

                {/* Spinning border */}
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary shadow-lg shadow-primary/20"></div>

                {/* Inner pulsating dot */}
                <div className="absolute h-4 w-4 animate-pulse rounded-full bg-primary"></div>
            </div>

            <p className="animate-pulse text-sm font-medium text-muted-foreground/80 tracking-widest uppercase">
                Loading
            </p>
        </div>
    );
}
