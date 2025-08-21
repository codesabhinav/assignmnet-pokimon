import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/contexts/theme-context";
import { PokemonProvider } from "@/contexts/pokemon-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Resource Explorer - Explore and Discover Resources",
  description: "Discover and explore amazing resources with detailed information, categories, and more in this modern Resource Explorer application.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <PokemonProvider>
              {children}
            </PokemonProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
