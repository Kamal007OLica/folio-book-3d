import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/**
 * Canonical public address of the book. Open Graph and Twitter crawlers do
 * not resolve relative URLs, so `metadataBase` gives Next an absolute origin
 * (including the GitHub Pages project subpath) to resolve `og.jpg` against.
 * Hardcoded rather than derived from NEXT_PUBLIC_BASE_PATH because the card
 * must point at the deployed book even when built locally or on a root host.
 */
const SITE_URL = "https://kamal007olica.github.io/folio-book-3d/";

const TITLE = "Kamalraaj's Folio, Volume I";
const DESCRIPTION = "An interactive hardcover portfolio. Let's talk & build.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: TITLE,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "og.jpg",
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "A hardcover folio resting in a lit room, waiting to be opened.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["og.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${jakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Applies a previously chosen theme before first paint, so returning
            visitors never see a flash of the default. Deliberately does NOT
            consult prefers-color-scheme: light is the intended first
            impression regardless of OS setting, and only an explicit toggle
            (persisted here) overrides it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem(${JSON.stringify(
              THEME_STORAGE_KEY
            )});if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
