import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getFeed } from "@/lib/server/queries";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Northwind Shell — Atelier Nord",
  description:
    "A limited drop on Threadrop. 50 made. Holds last 10 minutes. When it's gone, it's gone.",
};

export const viewport = {
  themeColor: "#f2f1ea",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const drops = await getFeed();
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased bg-background`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-mono">
        <CartProvider drops={drops}>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
