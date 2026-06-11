import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Thoth — The Agency Operating System for Global Brand Work",
    description: "One knowledge graph for every client brand, every team and every campaign — reasoned over by specialist AI agents that brief, plan, staff, audit and optimise across every market and channel.",
    keywords: ["agency operating system", "client brand management", "knowledge graph", "AI agents", "campaign planning", "agency operations", "briefing assistant", "capacity planning", "media planning", "brand compliance"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
