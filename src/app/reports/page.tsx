"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AppData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Sparkles, Loader2, TrendingUp, Info, Activity, FileText } from "lucide-react";
import { analyzeFinancialTrendsAndSuggestBudget, AnalyzeFinancialTrendsOutput } from "@/ai/flows/analyze-financial-trends-and-suggest-budget";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO, isValid } from "date-fns";
import { id } from "date-fns/locale";

export default function ReportsPage() {
  const [data, , isHydrated] = useLocalStorage<AppData>("kasmahasiswa_data", {
    students: [],
    payments: [],
    expenses: [],
    weeklyFee: 5000,
    currentSemester: 1,
  });

  const [aiReport, setAiReport] = useState<AnalyzeFinancialTrendsOutput | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!isHydrated) return null;

  const totalIncome = data.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentBalance = totalIncome - totalExpenses;

  const recordedSundays = Array.from(new Set(
    data.payments
      .map(p => p.weekNumber)
      .filter(val => typeof val === 'string')
  )).sort();

  const downloadPDF = () => {
    if (data.students.length === 0 && data.expenses.length === 0) {
      toast({ variant: "destructive", title: "Data Kosong", description: "Tidak ada data transaksi untuk diekspor." });
      return;
    }

    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); 
    doc.text("LAPORAN KAS KELELAS DIGITAL", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${dateStr} - Semester ${data.currentSemester}`, 105, 28, { align: "center" });

    doc.setDrawColor(200);
    doc.line(14, 35, 196, 35);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Ringkasan Keuangan", 14, 45);

    autoTable(doc, {
      startY: 48,
      head: [['Kategori', 'Jumlah']],
      body: [
        ['Total Pemasukan', `Rp {totalIncome.toLocaleString()}`],
        ['Total Pengeluaran', `Rp {totalExpenses.toLocaleString()}`],
        ['Saldo Akhir (Cash on Hand)', `Rp {currentBalance.toLocaleString()}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });

    if (data.students.length > 0) {
      doc.text("Rekapitulasi Setoran Minggu Mahasiswa", 14, (doc as any).lastAutoTable.finalY + 15);
      
      const dateHeaders = recordedSundays.map(s => {
        const d = parseISO(s);
        return isValid(d) ? format(d, "dd/MM") : s;
      });
      const headers = ["No", "NIM", "Nama", ...dateHeaders, "Total"];
      
      const body = data.students.map((student, idx) => {
        const studentPayments = recordedSundays.map(s => {
          const p = data.payments.find(p => p.studentId === student.id && p.weekNumber === s);
          return p ? "V" : "-";
        });
        const total = data.payments
          .filter(p => p.studentId === student.id)
          .reduce((sum, p) => sum + p.amount, 0);
        
        return [idx + 1, student.nim, student.name, ...studentPayments, `Rp {total.toLocaleString()}`];
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 18,
        head: [headers],
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [13, 148, 136], fontSize: 7 },
        styles: { fontSize: 6, cellPadding: 2 },
        columnStyles: {
          1: { cellWidth: 20 },
          2: { cellWidth: 35 },
          [headers.length - 1]: { fontStyle: 'bold', halign: 'right' }
        }
      });
    }

    if (data.expenses.length > 0) {
      doc.addPage();
      doc.setFontSize(12);
      doc.text("Rincian Pengeluaran Kas Kelas", 14, 20);

      const expenseBody = data.expenses.map((expense, idx) => [
        idx + 1,
        new Date(expense.date).toLocaleDateString('id-ID'),
        expense.description,
        `Rp {expense.amount.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: 25,
        head: [['No', 'Tanggal', 'Keterangan', 'Nominal']],
        body: expenseBody,
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] },
        columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } }
      });
    }

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("KasMahasiswa Pro - Semester " + data.currentSemester, 105, 285, { align: "center" });
      doc.text(`Halaman {i} dari {pageCount}`, 196, 285, { align: "right" });
    }

    doc.save(`Laporan_Kas_Semester_{data.currentSemester}_{new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "Berhasil", description: "Laporan PDF telah diunduh." });
  };

  const downloadCSV = () => {
    if (data.students.length === 0 && data.expenses.length === 0) {
      toast({ variant: "destructive", title: "Data Kosong", description: "Tidak ada data untuk diekspor." });
      return;
    }

    let csvRows: string[] = [];
    csvRows.push("LAPORAN KAS MAHASISWA - SEMESTER " + data.currentSemester);
    csvRows.push("");

    if (data.students.length > 0) {
      csvRows.push("REKAPITULASI PEMBAYARAN KAS MAHASISWA (BERDASARKAN TANGGAL)");
      const headers = ["NIM", "Nama", ...recordedSundays, "Total Bayar"];
      csvRows.push(headers.join(","));
      
      data.students.forEach(student => {
        const studentPayments = recordedSundays.map(s => {
          const p = data.payments.find(p => p.studentId === student.id && p.weekNumber === s);
          return p ? p.amount : 0;
        });
        const total = studentPayments.reduce((a, b) => a + b, 0);
        csvRows.push([`'${student.nim}`, `"${student.name}"`, ...studentPayments, total].join(","));
      });
      csvRows.push(""); csvRows.push(""); 
    }

    if (data.expenses.length > 0) {
      csvRows.push("LAPORAN PENGELUARAN KAS");
      csvRows.push("Tanggal,Keterangan,Nominal");
      data.expenses.forEach(expense => {
        csvRows.push([
          new Date(expense.date).toLocaleDateString('id-ID'),
          `"${expense.description.replace(/"/g, '""')}"`,
          expense.amount
        ].join(","));
      });
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Kas_Smt_{data.currentSemester}_{new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Berhasil", description: "Laporan lengkap format CSV telah diunduh." });
  };

  const handleAiAnalysis = async () => {
    if (data.payments.length === 0 && data.expenses.length === 0) {
      toast({ variant: "destructive", title: "Data Kurang", description: "Minimal harus ada beberapa transaksi agar AI bisa menganalisis." });
      return;
    }

    setIsLoadingAi(true);
    try {
      const allTransactions = [
        ...data.payments
          .filter(p => typeof p.weekNumber === 'string')
          .map(p => ({
            date: p.weekNumber,
            type: 'income' as const,
            amount: p.amount,
            description: `Setoran Kas Mingguan`
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
      toast({ title: "Analisis Selesai", description: "Wawasan cerdas telah dihasilkan oleh AI Treasury." });
    } catch (error) {
      toast({ variant: "destructive", title: "Kesalahan AI", description: "Gagal menghubungkan ke layanan AI. Pastikan API Key valid." });
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Laporan & Analisis</h1>
          <p className="text-muted-foreground">Analisis transparansi keuangan kelas dan ekspor data ke format profesional.</p>
        </div>
        <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Semester {data.currentSemester}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Laporan PDF
            </CardTitle>
            <CardDescription>Format rapi siap print untuk dibagikan di grup kelas atau dosen wali.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button size="lg" className="w-full" onClick={downloadPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-slate-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-slate-600" />
              Laporan CSV
            </CardTitle>
            <CardDescription>Data mentah format spreadsheet untuk diolah manual di Excel atau Google Sheets.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button variant="outline" size="lg" className="w-full" onClick={downloadCSV}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-accent bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              AI Treasury
            </CardTitle>
            <CardDescription>Gunakan kecerdasan buatan untuk mendeteksi tren pengeluaran yang boros.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button 
              size="lg" 
              className="w-full bg-accent hover:bg-accent/90" 
              onClick={handleAiAnalysis}
              disabled={isLoadingAi}
            >
              {isLoadingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Analisis AI
            </Button>
          </CardContent>
        </Card>
      </div>

      {aiReport && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <h2 className="text-xl font-bold font-headline flex items-center gap-2 text-primary">
            <TrendingUp className="h-6 w-6 text-accent" />
            Wawasan Keuangan AI
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
                    <span className="text-sm font-bold">Saldo Bulanan</span>
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
                  Rekomendasi Bendahara
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
