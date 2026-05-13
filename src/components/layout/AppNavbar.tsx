"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet, CreditCard, FileBarChart, Menu, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kas", label: "Kas Mingguan", icon: Wallet },
  { href: "/students", label: "Mahasiswa", icon: Users },
  { href: "/expenses", label: "Pengeluaran", icon: CreditCard },
  { href: "/reports", label: "Laporan", icon: FileBarChart },
];

export function AppNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    const data = localStorage.getItem("kasmahasiswa_data");
    if (!data) {
      toast({
        variant: "destructive",
        title: "Gagal Export",
        description: "Tidak ada data yang bisa diekspor.",
      });
      return;
    }

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `backup_kas_mahasiswa_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Berhasil",
      description: "Data telah diunduh sebagai file JSON.",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Basic validation
        const parsed = JSON.parse(content);
        if (!parsed.students || !parsed.payments || !parsed.expenses) {
          throw new Error("Format data tidak valid");
        }

        localStorage.setItem("kasmahasiswa_data", content);
        toast({
          title: "Import Berhasil",
          description: "Data kas telah diperbarui. Memuat ulang halaman...",
        });
        
        // Refresh page to update all state
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Import Gagal",
          description: "File JSON tidak valid atau rusak.",
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = "";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-accent p-1.5">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight font-headline">KasMahasiswa <span className="text-accent">Pro</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-white/10",
                pathname === item.href ? "bg-white/10 text-accent font-semibold" : "text-primary-foreground/80"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          
          <div className="ml-4 flex items-center gap-2 border-l border-white/20 pl-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 text-primary-foreground/80 hover:bg-white/10"
              onClick={handleExportData}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 text-primary-foreground/80 hover:bg-white/10"
              onClick={handleImportClick}
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Import
            </Button>
          </div>
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-primary text-primary-foreground border-none p-0 flex flex-col">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigasi Mobile</SheetTitle>
                <SheetDescription>Menu navigasi untuk aplikasi KasMahasiswa Pro</SheetDescription>
              </SheetHeader>
              
              <div className="p-6 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="rounded-lg bg-accent p-1">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold font-headline">KasMahasiswa <span className="text-accent">Pro</span></span>
                </div>
                <p className="text-[10px] text-primary-foreground/60 uppercase tracking-widest font-medium">BENDAHARA DIGITAL</p>
              </div>

              <ScrollArea className="flex-1">
                <nav className="p-4 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-white/10",
                        pathname === item.href ? "bg-white/10 text-accent shadow-inner" : "text-primary-foreground/80"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="pt-6 pb-2 px-4">
                    <p className="text-[10px] text-primary-foreground/40 uppercase tracking-widest font-bold mb-4">Manajemen Data</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-accent flex flex-col h-20 gap-2 items-center justify-center"
                        onClick={() => {
                          handleExportData();
                          setIsOpen(false);
                        }}
                      >
                        <Download className="h-5 w-5" />
                        <span className="text-xs">Export JSON</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-accent flex flex-col h-20 gap-2 items-center justify-center"
                        onClick={() => {
                          handleImportClick();
                          setIsOpen(false);
                        }}
                      >
                        <Upload className="h-5 w-5" />
                        <span className="text-xs">Import JSON</span>
                      </Button>
                    </div>
                  </div>
                </nav>
              </ScrollArea>

              <div className="p-6 border-t border-white/10 bg-black/10 shrink-0">
                <p className="text-[10px] text-center text-primary-foreground/40 leading-relaxed">
                  Developer Abdul Muis Nur Alfan.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Hidden File Input for Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: "none" }} 
        accept=".json"
        onChange={handleFileChange}
      />
    </header>
  );
}
