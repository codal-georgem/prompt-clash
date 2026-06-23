import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
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
      <body className={`${headingFont.variable} ${bodyFont.variable} min-h-screen bg-background font-body text-foreground antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
