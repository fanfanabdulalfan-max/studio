"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet, CreditCard, FileBarChart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-primary text-primary-foreground border-none p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/10">
                  <span className="text-xl font-bold font-headline">KasMahasiswa <span className="text-accent">Pro</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-white/10",
                        pathname === item.href ? "bg-white/10 text-accent" : "text-primary-foreground/80"
                      )}
                    >
                      <item.icon className="h-6 w-6" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}