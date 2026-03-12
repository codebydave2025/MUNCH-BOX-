import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import AuthWrapper from "./components/AuthWrapper";
import ClientLayout from "./components/ClientLayout";

export const metadata: Metadata = {
  title: "MUNCHBOX | Good Food, Good Mood",
  description: "Order delicious food from MUNCHBOX.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AuthWrapper>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AuthWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
