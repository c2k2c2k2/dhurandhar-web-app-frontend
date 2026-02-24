import type { Metadata } from "next";
import {
  Inter,
  Noto_Sans_Devanagari,
  Poppins,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/modules/i18n";
import { LegacyMarathiInputModeSwitch } from "@/modules/shared/components/LegacyMarathiInputModeSwitch";
import "./globals.css";
import "react-image-crop/dist/ReactCrop.css";
import "katex/dist/katex.min.css";
import "mathlive/fonts.css";
import "mathlive/static.css";

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
  title: "Dhurandhar Sir Career Point Academy",
  description: "Dhurandhar Sir Career Point Academy platform",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
        <I18nProvider>
          <ThemeProvider>
            {children}
            <LegacyMarathiInputModeSwitch />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
