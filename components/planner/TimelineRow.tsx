import { PlannerEvent, PlannerRow } from "@/lib/planner-data";
import { EventBar } from "./EventBar";
import { PlanningMarker } from "./PlanningMarker";

interface TimelineRowProps {
    row: PlannerRow;
    events: PlannerEvent[];
    totalColumns: number;
    viewStartWeek: number;
    hoveredProjectId: string | null;
    onHoverProject: (id: string | null) => void;
}

export const TimelineRow = ({ row, events, totalColumns, viewStartWeek, hoveredProjectId, onHoverProject }: TimelineRowProps) => {
    return (
        <div className="relative border-b border-white/5 w-full group">
            {/* Row Content (Grid Container) */}
            <div
                className="relative w-full grid py-1"
                style={{
                    gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`
                }}
            >
                {events.map((event) => {
                    // Only render event if it falls within the current view
                    if (event.startWeek + event.durationWeeks <= viewStartWeek) return null;

                    // Render Planning Marker
                    if ((event.status === 'planning') || (!event.durationWeeks && !event.status)) {
                        return (
                            <PlanningMarker
                                key={event.id}
                                event={event}
                                viewStartWeek={viewStartWeek}
                                hoveredProjectId={hoveredProjectId}
                                onHoverProject={onHoverProject}
                            />
                        );
                    }

                    // Render Standard Event Bar
                    return (
                        <EventBar
                            key={event.id}
                            event={event}
                            viewStartWeek={viewStartWeek}
                            hoveredProjectId={hoveredProjectId}
                            onHoverProject={onHoverProject}
                        />
                    );
                })}
            </div>
        </div>
    );
};
