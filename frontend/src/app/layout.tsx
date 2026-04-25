import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FakeCheckAI — Plateforme de fact-checking collaboratif",
  description:
    "Plateforme collaborative de vérification des faits assistée par intelligence artificielle. Détectez, analysez et réfutez les rumeurs en temps réel.",
};

import { ClientInitializer } from "./ClientInitializer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-white text-gray-900 antialiased">
        <ClientInitializer />
        {children}
      </body>
    </html>
  );
}
