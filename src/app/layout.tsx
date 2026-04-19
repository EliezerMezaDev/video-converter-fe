import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@styles/globals.css";
import { ThemeProvider } from "@/src/shared/providers/theme-provider";
import { cn } from "@shadcn/lib/utils";
import { constructMetadata } from "@/src/shared/lib/seo/construct-metadata";
import { JsonLd, constructJsonLd } from "@/src/shared/lib/seo/json-ld";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  ...constructMetadata("root"),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body suppressHydrationWarning>
        <JsonLd schemas={constructJsonLd("root")} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
