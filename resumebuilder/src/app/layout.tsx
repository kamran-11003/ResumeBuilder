import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResumeBuilder - Create Professional Resumes",
  description: "Build ATS-optimized resumes with professional templates. Import from LinkedIn, customize with ease, and land your dream job.",
  keywords: "resume builder, ATS optimization, professional resume, LinkedIn import, job application",
  authors: [{ name: "ResumeBuilder Team" }],
  openGraph: {
    title: "ResumeBuilder - Create Professional Resumes",
    description: "Build ATS-optimized resumes with professional templates",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeBuilder - Create Professional Resumes",
    description: "Build ATS-optimized resumes with professional templates",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
