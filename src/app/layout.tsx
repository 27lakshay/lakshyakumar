import type { ReactNode } from "react";
import type { Viewport } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";
import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
  GeistPixelTriangle,
} from "geist/font/pixel";


import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VercelAnalytics from "@/components/VercelAnalytics";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ThemeProvider } from "@/components/ThemeProvider";
import { baseMetadata } from "@/lib/metadata";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({subsets:['latin'],variable:'--font-sans'});

const departureMono = localFont({
  src: "../../public/fonts/departureMono.woff2",
  variable: "--font-departure-mono",
  display: "swap",
});

export const metadata = baseMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0C0F" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        spaceGrotesk.variable,
        departureMono.variable,
        GeistPixelSquare.variable,
        GeistPixelGrid.variable,
        GeistPixelCircle.variable,
        GeistPixelTriangle.variable,
        GeistPixelLine.variable,
        "font-sans",
      )}
    >
      <body className="relative min-h-dvh w-full bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.classList.remove("dark")}else{document.documentElement.classList.add("dark")}}catch(e){document.documentElement.classList.add("dark")}})();`,
          }}
        />
        <ThemeProvider>
          <SmoothScroll>
            <div
              data-theme-content
              className="relative z-10 flex min-h-dvh w-full flex-col"
            >
              <Navbar />
              {children}
              <Footer />
            </div>
          </SmoothScroll>
        </ThemeProvider>
        <VercelAnalytics />
      </body>
    </html>
  );
}
