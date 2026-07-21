import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/app/context/AppContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MS Manajemen Siswa - SMK Negeri 2 Malang",
  description: "Sistem Manajemen Siswa dan Pelanggaran untuk SMK Negeri 2 Malang. Kelola data siswa, kelas, dan pelanggaran dengan mudah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
