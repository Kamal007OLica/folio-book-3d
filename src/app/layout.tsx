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

export const metadata: Metadata = {
  title: "Folio — Kamalraaj Senthilkumar",
  description: "An interactive hardcover portfolio. Let's talk & build.",
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
