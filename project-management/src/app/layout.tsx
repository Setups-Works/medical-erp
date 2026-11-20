import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const brand = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-brand-serif" });

export const metadata: Metadata = {
  title: "MENO Hub",
  description: "Project management for the MENO pharmacy ERP team",
};

// Paints the saved theme before React loads, so dark mode never flashes white.
const themeScript = `try{var t=localStorage.getItem('hub-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${brand.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <Toaster position="bottom-right" toastOptions={{ className: "!bg-raised !text-ink !shadow-pop !rounded-tile !border-0 !font-sans" }} />
      </body>
    </html>
  );
}
