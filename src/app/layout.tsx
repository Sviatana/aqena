import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SectionReveal } from "@/components/section-reveal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Anvera — Customer support built from your company knowledge",
    template: "%s | Anvera",
  },
  description:
    "Turn your company knowledge into reliable customer answers and add your assistant to your website.",
  applicationName: "Anvera",
  keywords: [
    "AI knowledge assistant",
    "customer support AI",
    "knowledge base",
    "website chatbot",
  ],
};

export default function RootLayout({
  children,
}: Readonly<LayoutProps<"/">>) {
  return (
    <html lang="en">
      <body className={geistSans.variable}>
        <SectionReveal />
        {children}
      </body>
    </html>
  );
}
