import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "@uploadthing/react/styles.css";

import { isDevAuthBypass } from "@/lib/auth-mode";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jobby | AI Hiring Intelligence",
  description:
    "AI-powered resume and job intelligence platform with ATS analytics and explainable hiring insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <>
      {isDevAuthBypass ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Local dev auth bypass is active. Set real Clerk keys and disable
          DEV_AUTH_BYPASS for production-like auth flow.
        </div>
      ) : null}
      <div className="flex min-h-full flex-col bg-background">{children}</div>
      <Toaster position="top-right" richColors closeButton />
    </>
  );

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {isDevAuthBypass ? content : <ClerkProvider>{content}</ClerkProvider>}
      </body>
    </html>
  );
}
