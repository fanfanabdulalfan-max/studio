"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AppData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Sparkles, Loader2, TrendingUp, Info, Activity } from "lucide-react";
import { analyzeFinancialTrendsAndSuggestBudget, AnalyzeFinancialTrendsOutput } from "@/ai/flows/analyze-financial-trends-and-suggest-budget";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [data, , isHydrated] = useLocalStorage<AppData>("kasmahasiswa_data", {
    students: [],
    payments: [],
    expenses: [],
    weeklyFee: 5000,
  });

  const [aiReport, setAiReport] = useState<AnalyzeFinancialTrendsOutput | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!isHydrated) return null;

  const downloadCSV = () => {
    if (data.students.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Tidak ada data mahasiswa untuk diekspor." });
      return;
    }

    // Prepare CSV header
    const weeks = Array.from({ length: 16 }, (_, i) => i + 1);
    const headers = ["ID", "Nama", ...weeks.map(w => `Mgg ${w}`), "Total Bayar"];
    
    // Create rows
    const rows = data.students.map(student => {
      const studentPayments = weeks.map(w => {
        const p = data.payments.find(p => p.studentId === student.id && p.weekNumber === w);
        return p ? p.amount : 0;
      });
      const total = studentPayments.reduce((a, b) => a + b, 0);
      return [student.id, student.name, ...studentPayments, total];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Kas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Berhasil", description: "Laporan CSV telah diunduh." });
  };

  const handleAiAnalysis = async () => {
    if (data.payments.length === 0 && data.expenses.length === 0) {
      toast({ variant: "destructive", title: "Data Kurang", description: "Butuh setidaknya beberapa transaksi untuk analisis AI." });
      return;
    }

    setIsLoadingAi(true);
    try {
      const allTransactions = [
        ...data.payments.map(p => ({
          date: p.date.split('T')[0],
          type: 'income' as const,
          amount: p.amount,
          description: `Setoran Kas Mgg ${p.weekNumber}`
        })),
        ...data.expenses.map(e => ({
          date: e.date.split('T')[0],
          type: 'expense' as const,
          amount: e.amount,
          description: e.description
        }))
      ];

      const result = await analyzeFinancialTrendsAndSuggestBudget({ transactions: allTransactions });
      setAiReport(result);
      toast({ title: "Analisis Selesai", description: "AI telah selesai menganalisis keuangan kelas Anda." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Kesalahan AI", description: "Gagal menghubungkan ke Asisten Keuangan." });
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Laporan & Analisis</h1>
        <p className="text-muted-foreground">Ekspor data transparan dan dapatkan wawasan cerdas dari AI Treasury.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Ekspor Rekapitulasi
            </CardTitle>
            <CardDescription>Unduh semua data pembayaran mahasiswa dalam format CSV (Excel) untuk arsip fisik.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button size="lg" className="w-full max-w-xs" onClick={downloadCSV}>
              <Download className="mr-2 h-4 w-4" />
              Download Laporan (CSV)
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-accent bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              AI Treasury Assistant
            </CardTitle>
            <CardDescription>Gunakan kecerdasan buatan untuk menganalisis tren dan saran anggaran masa depan.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button 
              size="lg" 
              className="w-full max-w-xs bg-accent hover:bg-accent/90" 
              onClick={handleAiAnalysis}
              disabled={isLoadingAi}
            >
              {isLoadingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Analisis dengan AI
            </Button>
          </CardContent>
        </Card>
      </div>

      {aiReport && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <h2 className="text-xl font-bold font-headline flex items-center gap-2 text-primary">
            <TrendingUp className="h-6 w-6 text-accent" />
            Hasil Analisis AI
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {aiReport.monthlySummaries.map((summary, idx) => (
              <Card key={idx} className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Bulan: {summary.month}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Pemasukan</span>
                    <span className="text-sm font-semibold text-accent">Rp {summary.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pengeluaran</span>
                    <span className="text-sm font-semibold text-destructive">Rp {summary.totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between">
                    <span className="text-sm font-bold">Net Balance</span>
                    <span className={cn("text-sm font-bold", summary.netBalance >= 0 ? "text-accent" : "text-destructive")}>
                      Rp {summary.netBalance.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Tren Keuangan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiReport.trendsAnalysis}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-accent" />
                  Saran Anggaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiReport.budgetSuggestions}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}