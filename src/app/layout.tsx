import type { Metadata } from "next";
import {
  Inter,
  Noto_Sans_Devanagari,
  Poppins,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dhurandhar Career Academy",
  description: "Dhurandhar Career Academy platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${notoSansDevanagari.variable} min-h-screen bg-background text-foreground font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
