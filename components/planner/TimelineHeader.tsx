import { MonthData } from "@/lib/planner-data";

interface TimelineHeaderProps {
    months: MonthData[];
    weeks: number[];
    totalColumns: number;
}

export const TimelineHeader = ({ months, weeks, totalColumns }: TimelineHeaderProps) => {
    return (
        <div className="sticky top-0 z-20 bg-[#1a1a2e] shadow-lg border-b border-white/10 uppercase text-gray-400 text-xs font-medium tracking-wider">

            {/* Months Row */}
            <div
                className="grid border-b border-white/10"
                style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}
            >
                {months.map((month) => {
                    // Calculate span based on weeks in THIS view
                    // If a month is partially cut off, we need to handle it? 
                    // For now, we assume standard views (3/6/12) align with months.
                    // But if we slice weeks, we must ensure month span matches visible weeks.

                    // Simplified: We pass in only full months relevant to the view for now (as per logic in parent)
                    // But actually, safer to calculate span intersecting with 'weeks' array.
                    const visibleStart = Math.max(month.startWeek, weeks[0]);
                    const visibleEnd = Math.min(month.endWeek, weeks[weeks.length - 1]);
                    const span = Math.max(0, visibleEnd - visibleStart + 1);

                    if (span === 0) return null;

                    return (
                        <div
                            key={month.name}
                            className="py-2 text-center border-r border-white/10 last:border-r-0 bg-white/5"
                            style={{ gridColumn: `span ${span}` }}
                        >
                            {month.name}
                        </div>
                    );
                })}
            </div>

            {/* Weeks Row */}
            <div
                className="grid"
                style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}
            >
                {weeks.map((week) => (
                    <div key={week} className="py-2 text-center border-r border-white/10 last:border-r-0">
                        W{week}
                    </div>
                ))}
            </div>
        </div>
    );
};
