"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AppData, Payment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Wallet, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function KasPage() {
  const [data, setData, isHydrated] = useLocalStorage<AppData>("kasmahasiswa_data", {
    students: [],
    payments: [],
    expenses: [],
    weeklyFee: 5000,
  });

  const [currentWeek, setCurrentWeek] = useState(1);
  const [search, setSearch] = useState("");

  if (!isHydrated) return null;

  const togglePayment = (studentId: string) => {
    const existingPayment = data.payments.find(
      (p) => p.studentId === studentId && p.weekNumber === currentWeek
    );

    if (existingPayment) {
      // Remove payment (Unpaid)
      setData({
        ...data,
        payments: data.payments.filter((p) => p.id !== existingPayment.id),
      });
      toast({ title: "Status Diperbarui", description: "Status pembayaran diubah menjadi Belum Bayar." });
    } else {
      // Add payment (Paid)
      const newPayment: Payment = {
        id: crypto.randomUUID(),
        studentId,
        weekNumber: currentWeek,
        amount: data.weeklyFee,
        date: new Date().toISOString(),
        status: "paid",
      };
      setData({
        ...data,
        payments: [...data.payments, newPayment],
      });
      toast({ title: "Pembayaran Berhasil", description: `Terima kasih atas pembayarannya.` });
    }
  };

  const filteredStudents = data.students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nim.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Input Kas Mingguan</h1>
          <p className="text-muted-foreground">Catat setoran mingguan mahasiswa dengan satu klik.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">Minggu ke-</div>
          <Select value={currentWeek.toString()} onValueChange={(v) => setCurrentWeek(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Pilih Minggu" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 16 }).map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4 text-accent" />
              Filter & Pengaturan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cari Nama/NIM</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari mahasiswa..."
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nominal (Rp)</label>
              <Input
                type="number"
                value={data.weeklyFee}
                onChange={(e) => setData({ ...data, weeklyFee: parseInt(e.target.value) || 0 })}
                className="h-9"
              />
              <p className="text-[10px] text-muted-foreground">Akan otomatis digunakan untuk setiap input baru.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <CardTitle className="text-lg">Daftar Mahasiswa - Minggu {currentWeek}</CardTitle>
            <div className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold">
              Rp {data.weeklyFee.toLocaleString()}/mgg
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Mahasiswa</TableHead>
                  <TableHead className="text-center">Status Bayar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => {
                    const isPaid = data.payments.some(
                      (p) => p.studentId === student.id && p.weekNumber === currentWeek
                    );
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium text-primary">{student.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{student.nim}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={isPaid ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "w-32 transition-all",
                              isPaid ? "bg-accent hover:bg-accent/90" : "hover:bg-accent/10 hover:text-accent"
                            )}
                            onClick={() => togglePayment(student.id)}
                          >
                            {isPaid ? "Sudah Bayar" : "Belum Bayar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                      Tidak ada mahasiswa yang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
