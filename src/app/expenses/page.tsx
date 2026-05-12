"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AppData, Expense } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Receipt, Plus, CalendarIcon } from "lucide-react";

export default function ExpensesPage() {
  const [data, setData, isHydrated] = useLocalStorage<AppData>("kasmahasiswa_data", {
    students: [],
    payments: [],
    expenses: [],
    weeklyFee: 5000,
  });

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  if (!isHydrated) return null;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description: desc,
      amount: parseInt(amount),
      date: new Date(date).toISOString(),
    };

    setData({
      ...data,
      expenses: [newExpense, ...data.expenses],
    });

    setDesc("");
    setAmount("");
    toast({ title: "Tercatat", description: "Pengeluaran kelas berhasil ditambahkan." });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Catatan Pengeluaran</h1>
        <p className="text-muted-foreground">Pantau setiap rupiah yang dikeluarkan untuk keperluan kelas.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-accent" />
              Tambah Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Keterangan</label>
                <Textarea
                  placeholder="Contoh: Beli spidol papan tulis"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nominal (Rp)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-8"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Simpan Pengeluaran
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-accent" />
              Riwayat Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.expenses.length > 0 ? (
                    data.expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(expense.date).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="font-medium text-primary">{expense.description}</TableCell>
                        <TableCell className="text-right font-bold text-destructive">
                          - Rp {expense.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                        Belum ada catatan pengeluaran.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
