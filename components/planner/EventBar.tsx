import { PlannerEvent } from "@/lib/planner-data";
import { getInitiativeStyle } from "@/lib/initiatives";
import { EventHoverCard } from "./EventHoverCard";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";

interface EventBarProps {
    event: PlannerEvent;
    viewStartWeek: number; // The starting week of the current view (e.g. 8)
}

export const EventBar = ({ event, viewStartWeek }: EventBarProps) => {
    const { color, label } = getInitiativeStyle(event.type);
    const [isHovered, setIsHovered] = useState(false);

    // Calculate grid column position
    // If view starts at week 8, and event is at week 8, column is 1.
    // Formula: (Event Start - View Start) + 1
    const startCol = event.startWeek - viewStartWeek + 1;
    const span = event.durationWeeks;

    return (
        <div
            className="relative"
            style={{ gridColumn: `${startCol} / span ${span}` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={clsx(
                    "rounded-full flex items-center justify-between px-2 overflow-hidden whitespace-nowrap text-xs font-bold text-white shadow-sm transition-all duration-200 z-10 mx-0.5 my-1 border border-white/20 cursor-pointer h-7",
                    isHovered ? "scale-105 z-50 brightness-110 shadow-lg ring-1 ring-white/30" : "hover:scale-[1.01]"
                )}
                style={{
                    backgroundColor: color
                }}
            >
                <span className="truncate mr-2">{event.title}</span>
                <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider backdrop-blur-sm">
                    {label}
                </span>
            </div>

            <AnimatePresence>
                {isHovered && <EventHoverCard event={event} />}
            </AnimatePresence>
        </div>
    );
};
