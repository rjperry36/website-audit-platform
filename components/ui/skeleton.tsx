import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-white/5 shimmer", className)}
            {...props}
        />
    )
}

function SkeletonCard() {
    return (
        <div className="rounded-xl border border-white/10 glass p-6 shadow-lg content-layer">
            <div className="space-y-3">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-20 w-full" />
            </div>
        </div>
    )
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
            ))}
        </div>
    )
}

export { Skeleton, SkeletonCard, SkeletonText }
