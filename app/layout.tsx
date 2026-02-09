import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Website Audit Platform | SiteAudit Agent",
    description: "Autonomous website auditing platform powered by Google Antigravity - crawls websites, captures screenshots, and performs SEO, accessibility, performance, and brand compliance audits",
    keywords: ["website audit", "SEO", "accessibility", "performance", "brand compliance", "web crawling"],
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
