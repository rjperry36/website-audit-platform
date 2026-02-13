import { PlannerEvent, PlannerRow } from "@/lib/planner-data";
import { EventBar } from "./EventBar";

interface TimelineRowProps {
    row: PlannerRow;
    events: PlannerEvent[];
    totalColumns: number;
    viewStartWeek: number;
}

export const TimelineRow = ({ row, events, totalColumns, viewStartWeek }: TimelineRowProps) => {
    return (
        <div className="relative border-b border-white/5 w-full group">



            {/* Row Content (Grid Container) */}
            <div
                className="relative w-full grid py-1"
                style={{
                    gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`
                }}
            >
                {events.map((event) => (
                    // Only render event if it falls within the current view
                    // (Simple check: end of event > view start)
                    // But strict filtering ensures we don't render way off-screen events negatively
                    (event.startWeek + event.durationWeeks > viewStartWeek) && (
                        <EventBar key={event.id} event={event} viewStartWeek={viewStartWeek} />
                    )
                ))}
            </div>
        </div>
    );
};
