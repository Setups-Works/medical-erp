import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Providers } from "./providers";
import "@/styles/globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const brand = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-brand-serif" });

export const metadata: Metadata = {
  title: { default: "MENO", template: "%s · MENO" },
  description: "Pharmacy Management, Simplified.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Paints the saved scheme before React loads, so Dark never flashes white. Light / Dark only.
const themeScript = `try{var t=localStorage.getItem('meno-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${brand.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
