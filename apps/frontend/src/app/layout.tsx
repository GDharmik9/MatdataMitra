import type { Metadata, Viewport } from "next";
import "./globals.css";
// import AccessibilityPanel from "@/components/AccessibilityPanel";
import Navbar from "@/components/Navbar";
import FloatingChat from "@/components/FloatingChat";

export const metadata: Metadata = {
  title: "MatdataMitra — मतदाता मित्र | Interactive Electoral Assistant",
  description:
    "AI-powered multilingual electoral assistant for Indian voters. Get voter registration help, find polling booths, and understand election processes in your language.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        <main>{children}</main>
        {/* <AccessibilityPanel /> */}
        <FloatingChat />
      </body>
    </html>
  );
}
