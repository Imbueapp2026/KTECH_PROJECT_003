import type { Metadata } from "next";
import { AuthBridge } from "@/lib/auth/index";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avirat Admin",
  description: "Admin console for the Avirat Jewelers catalog.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-surface-muted)] text-[var(--color-ink)] font-[family-name:var(--font-body)]">
        <AuthBridge>
          <ToastProvider>{children}</ToastProvider>
        </AuthBridge>
      </body>
    </html>
  );
}