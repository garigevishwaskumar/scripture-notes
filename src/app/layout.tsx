import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Newsreader, Cinzel } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const scriptureFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-scripture",
  display: "swap",
  style: ["normal", "italic"],
});

const serifDisplay = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#080b11",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ScriptureNotes — King James Bible & Journaling Studio",
  description: "Experience the timeless beauty of the King James Bible with elegant typography, chapter-linked personal notes, verse highlighting, and offline sync.",
  keywords: ["Bible", "KJV", "Scripture", "Bible Study", "Journal", "Personal Notes", "PWA", "Offline Bible"],
  authors: [{ name: "ScriptureNotes" }],
  metadataBase: new URL("https://biblenotetaker.vercel.app"),
  openGraph: {
    title: "ScriptureNotes — King James Bible & Journaling Studio",
    description: "Read, study, and reflect. Private personal notes synced to every chapter of the King James Bible.",
    url: "https://biblenotetaker.vercel.app",
    siteName: "ScriptureNotes",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScriptureNotes — King James Bible & Journaling Studio",
    description: "Read, study, and reflect. Private personal notes synced to every chapter of the King James Bible.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ScriptureNotes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark h-full antialiased ${sansFont.variable} ${scriptureFont.variable} ${serifDisplay.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="application-name" content="ScriptureNotes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ScriptureNotes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const mode = localStorage.getItem('scripture_mode');
                if (mode === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] selection:bg-amber-500/25 selection:text-amber-700 dark:selection:text-amber-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
