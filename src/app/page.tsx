"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { AppData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Users, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [data, , isHydrated] = useLocalStorage<AppData>("kasmahasiswa_data", {
    students: [],
    payments: [],
    expenses: [],
    weeklyFee: 5000,
  });

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  const totalIncome = data.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentBalance = totalIncome - totalExpenses;

  // Prepare chart data (Monthly Summary)
  const monthlyData: Record<string, { month: string; income: number; expense: number }> = {};
  
  data.payments.forEach(p => {
    const month = p.date.substring(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { month, income: 0, expense: 0 };
    monthlyData[month].income += p.amount;
  });

  data.expenses.forEach(e => {
    const month = e.date.substring(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { month, income: 0, expense: 0 };
    monthlyData[month].expense += e.amount;
  });

  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary mb-2">Dashboard Ringkasan</h1>
        <p className="text-muted-foreground">Selamat datang kembali, Bendahara. Inilah status keuangan kelas hari ini.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Rp {currentBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tersedia untuk keperluan kelas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">Rp {totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Berasal dari kas mingguan</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">Rp {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Untuk operasional kelas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{data.students.length} Orang</div>
            <p className="text-xs text-muted-foreground">Terdaftar dalam ledger</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Tren Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => `Rp ${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Pemasukan" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Belum ada data transaksi untuk ditampilkan.</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...data.payments, ...data.expenses]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 6)
                .map((item, idx) => {
                  const isExpense = 'description' in item;
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full shrink-0",
                        isExpense ? "bg-red-100 text-red-600" : "bg-teal-100 text-teal-600"
                      )}>
                        {isExpense ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isExpense ? item.description : `Bayar Kas: ${data.students.find(s => s.id === (item as any).studentId)?.name || 'Mahasiswa'}`}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className={cn("text-sm font-semibold whitespace-nowrap", isExpense ? "text-red-600" : "text-teal-600")}>
                        {isExpense ? "-" : "+"} Rp {item.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              {data.payments.length === 0 && data.expenses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Tidak ada riwayat transaksi.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
