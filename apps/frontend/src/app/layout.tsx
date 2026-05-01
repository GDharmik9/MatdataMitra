import type { Metadata, Viewport } from "next";
import "./globals.css";
// import AccessibilityPanel from "@/components/AccessibilityPanel";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

// Lazy-load the chat widget since it's not needed for initial paint
const FloatingChat = dynamic(() => import("@/components/FloatingChat"));

export const metadata: Metadata = {
  title: "MatdataMitra — मतदाता मित्र | Interactive Electoral Assistant",
  description:
    "AI-powered multilingual electoral assistant for Indian voters. Get voter registration help, find polling booths, and understand election processes in your language.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo_mitra.png",
    apple: "/images/logo_mitra.png",
  },
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
        <link rel="icon" href="/images/logo_mitra.png" type="image/png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        {/* <AccessibilityPanel /> */}
        <FloatingChat />
      </body>
    </html>
  );
}
