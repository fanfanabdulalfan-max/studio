
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'KasMahasiswa Pro - Bendahara Kelas Cerdas',
  description: 'Aplikasi pencatatan uang kas mingguan mahasiswa yang transparan dan digital.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head />
      <body
        className="font-body antialiased min-h-screen flex flex-col bg-background"
        suppressHydrationWarning
      >
        <AppNavbar />
        <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
          {children}
        </main>
        <footer className="py-6 text-center text-muted-foreground text-sm border-t mt-auto">
          <p>&copy; 2026 KasMahasiswa Pro. Build by Mahasiswa.</p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
