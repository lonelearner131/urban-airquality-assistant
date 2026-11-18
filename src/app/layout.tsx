import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmogShield | Urban Air Quality & Winter Smog Assistant",
  description:
    "Production-grade urban air quality assistant for families and communities facing severe winter smog in Delhi-NCR and worldwide.",
  applicationName: "SmogShield",
  keywords: [
    "air quality",
    "AQI",
    "Delhi smog",
    "winter pollution",
    "PM2.5",
    "clean air",
    "N95 mask",
  ],
  authors: [{ name: "SmogShield Engineering" }],
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
