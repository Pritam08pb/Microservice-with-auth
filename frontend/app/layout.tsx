import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import StoreProvider from "@/components/StoreProvider";
import GlobalSocketManager from "@/components/GlobalSocketManager";

export const metadata: Metadata = {
  title: "Helpy Video Call",
  description: "Advanced Secure Video Communications Architecture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={` h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <StoreProvider>
          <GlobalSocketManager>
            {children}
            <Toaster position="top-center" theme="dark" richColors />
          </GlobalSocketManager>
        </StoreProvider>

      </body>
    </html>
  );
}
