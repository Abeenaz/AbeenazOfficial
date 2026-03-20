import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Abeenaz Beauty Parlour - Admin",
  description: "Luxury beauty parlour management system for Abeenaz. Manage clients, bills, loyalty programs, and more.",
  keywords: ["Abeenaz", "Beauty Parlour", "Salon Management", "Loyalty Program", "Karachi"],
  authors: [{ name: "Abeenaz Beauty Parlour" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Abeenaz Beauty Parlour",
    description: "Where Elegance Meets Excellence - Luxury beauty experiences in Karachi",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#0d0b07] text-[#f5f0e8]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
