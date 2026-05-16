
import type { Metadata } from 'next';
import './globals.css';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { Toaster } from '@/components/ui/toaster';

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
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background">
        <AppNavbar />
        <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
          {children}
        </main>
        <footer className="py-6 text-center text-muted-foreground text-sm border-t mt-auto">
          <p>&copy; 2026 KasMahasiswa Pro. Build by Mahasiswa (Universitas Slamat Sri).</p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
