import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/store";
import { ToastProvider } from "@/lib/toast";
import { storeConfig } from "@/lib/config";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: storeConfig.nameFull,
  description: "Order supplies fast",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: storeConfig.name,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <CartProvider>
          <ToastProvider>
            <div className="min-h-screen bg-bg">
              <main className="max-w-lg mx-auto pb-24">{children}</main>
              <BottomNav />
            </div>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
