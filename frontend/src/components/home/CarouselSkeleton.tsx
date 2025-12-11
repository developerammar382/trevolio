export default function CarouselSkeleton() {
    return (
        <div className="relative w-full h-[500px] md:h-[600px] bg-slate-900 overflow-hidden">
            {/* Skeleton Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 animate-pulse" />

            {/* Skeleton Content */}
            <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl">
                        {/* Title Skeleton */}
                        <div className="h-16 md:h-20 bg-slate-700/50 rounded-lg mb-4 w-3/4 animate-pulse" />

                        {/* Subtitle Skeleton */}
                        <div className="h-8 bg-slate-700/50 rounded-lg mb-8 w-1/2 animate-pulse" />

                        {/* Button Skeleton */}
                        <div className="h-14 bg-slate-700/50 rounded-xl w-40 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Dots Skeleton */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                <div className="w-12 h-3 bg-white/30 rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-white/20 rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-white/20 rounded-full animate-pulse" />
            </div>
        </div>
    );
}
