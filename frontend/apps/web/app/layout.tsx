import type { Metadata } from "next";
import localFont from "next/font/local";
import "@marweld/ui/globals.css";
import { AuthProvider } from "../src/shared/components/auth-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Marweld Perú S.A.C.",
  description:
    "Soluciones en construcción y materiales de calidad para proyectos en todo el Perú.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
