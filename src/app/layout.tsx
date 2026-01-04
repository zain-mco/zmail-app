import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AlertProvider } from "@/components/AlertProvider";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ZMAIL - Email Campaign Builder",
  description: "Professional email campaign builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AlertProvider>
          <AuthSessionProvider>
            {children}
          </AuthSessionProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
