import type { Metadata } from "next";
import { Archivo, Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlow = Barlow_Condensed({
  variable: "--font-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Modern Voice Radio 99.5 FM",
  description:
    "Modern Voice Radio 99.5 FM — music, news, interviews and community stories. Listen live, follow your favourite shows, and connect with your presenters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${barlow.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-ink font-body text-white antialiased">
        {children}
      </body>
    </html>
  );
}
