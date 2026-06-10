import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { themeScript } from "./hooks/use-theme-script";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Analises Juri Capital",
  icons: {
    icon: "/martelo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} suppressHydrationWarning />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <MaintenanceBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
