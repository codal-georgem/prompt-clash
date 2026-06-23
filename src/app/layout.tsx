import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const headingFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Prompt Clash",
  description: "Prompt engineering learning game for teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} flex min-h-screen flex-col bg-background font-body text-foreground antialiased`}>
        {/* <SiteHeader /> */}
        <div className="flex-1">
          {children}
        </div>
        {/* <SiteFooter /> */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
