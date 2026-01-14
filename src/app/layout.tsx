import type { Metadata } from "next";
import { Inter, Lato, Roboto } from "next/font/google";
import "./globals.css";
import { AlertProvider } from "@/components/AlertProvider";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lato",
});

const roboto = Roboto({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Z-EMAIL - Email Campaign Builder",
  description: "Professional email campaign builder",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lato.variable} ${roboto.variable} font-sans antialiased`}>
        <AlertProvider>
          <AuthSessionProvider>
            {children}
          </AuthSessionProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
