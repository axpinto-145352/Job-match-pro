import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobMatch Pro - AI-Powered Job Search",
  description:
    "Find your perfect job with AI-powered matching. Aggregate jobs from 7+ sources, scored against your resume and preferences.",
  keywords: [
    "job search",
    "AI job matching",
    "job aggregator",
    "career",
    "job board",
  ],
  openGraph: {
    title: "JobMatch Pro - AI-Powered Job Search",
    description:
      "Find your perfect job with AI-powered matching across 7+ job boards.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
