import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NativeAuthListener from "@/components/NativeAuthListener";
import PushNotificationSetup from "@/components/PushNotificationSetup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OxSporties",
  description: "OxSporties is a sports social platform for Oxfordshire players and venues.",
};

// viewport-fit=cover lets the page extend under the iPhone notch/home
// indicator and status bar, and — critically — makes env(safe-area-
// inset-*) resolve to real pixel values instead of 0. Without this,
// the native app shell (which fills the true screen edges, unlike
// Safari) renders content flush against the home indicator.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NativeAuthListener />
        <PushNotificationSetup />
        {children}
      </body>
    </html>
  );
}
