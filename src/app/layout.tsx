import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { themeScript } from "./hooks/use-theme-script";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";

export const metadata: Metadata = {
  title: "Analises Juri Capital",
  icons: {
    icon: "/martelo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <MaintenanceBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
