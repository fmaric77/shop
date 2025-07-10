import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import ConditionalFooter from "@/components/ConditionalFooter";
import DynamicHead from "@/components/DynamicHead";
import Chatbot from "@/components/Chatbot";
import "./globals.css";
import "./theme.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shop Store",
  description: "Your online store for amazing products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <ContentProvider>
            <CurrencyProvider>
              <AuthProvider>
                <DynamicHead />
                <ToastProvider>
                  <CartProvider>
                    <div className="flex-grow">{children}</div>
                    <ConditionalFooter />
                    <Chatbot />
                  </CartProvider>
                </ToastProvider>
              </AuthProvider>
            </CurrencyProvider>
          </ContentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
