
"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AppData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileText, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
      toast({ variant: "destructive", title: "Data Kosong", description: "Tidak ada data untuk diekspor." });
      return;
    }

    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Judul Utama (Hanya LAPORAN KAS sesuai permintaan)
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); 
    doc.text("LAPORAN KAS", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${dateStr} - Semester ${data.currentSemester}`, 105, 28, { align: "center" });

    doc.setDrawColor(200);
    doc.line(14, 35, 196, 35);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("1. Ringkasan Keuangan", 14, 45);

    autoTable(doc, {
      startY: 48,
      head: [['Kategori', 'Jumlah']],
      body: [
        ['Total Pemasukan', `Rp ${totalIncome.toLocaleString()}`],
        ['Total Pengeluaran', `Rp ${totalExpenses.toLocaleString()}`],
        ['Saldo Akhir (Tunai)', `Rp ${currentBalance.toLocaleString()}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });

    if (data.students.length > 0) {
      doc.text("2. Rekapitulasi Setoran Mahasiswa", 14, (doc as any).lastAutoTable.finalY + 15);
      
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
        
        return [idx + 1, student.nim, student.name, ...studentPayments, `Rp ${total.toLocaleString()}`];
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 18,
        head: [headers],
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [13, 148, 136], fontSize: 8 },
        styles: { fontSize: 7, cellPadding: 2 },
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
      doc.text("3. Rincian Pengeluaran", 14, 20);

      const expenseBody = data.expenses.map((expense, idx) => [
        idx + 1,
        new Date(expense.date).toLocaleDateString('id-ID'),
        expense.description,
        `Rp ${expense.amount.toLocaleString()}`
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

    // Tanda Tangan
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text("Diverifikasi oleh,", 160, finalY, { align: "center" });
    doc.text("Bendahara Kelas", 160, finalY + 25, { align: "center" });

    doc.save(`Laporan_Kas_Semester_${data.currentSemester}.pdf`);
    toast({ title: "Berhasil", description: "Laporan PDF telah diunduh." });
  };

  const downloadCSV = () => {
    if (data.students.length === 0 && data.expenses.length === 0) return;
    let csvRows: string[] = ["LAPORAN KAS - SEMESTER " + data.currentSemester, ""];
    
    if (data.students.length > 0) {
      const headers = ["NIM", "Nama", ...recordedSundays, "Total"];
      csvRows.push(headers.join(","));
      data.students.forEach(student => {
        const row = [
          `'${student.nim}`, 
          `"${student.name}"`, 
          ...recordedSundays.map(s => data.payments.find(p => p.studentId === student.id && p.weekNumber === s) ? data.weeklyFee : 0),
          data.payments.filter(p => p.studentId === student.id).reduce((a, b) => a + b.amount, 0)
        ];
        csvRows.push(row.join(","));
      });
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Kas.csv`;
    link.click();
    toast({ title: "Berhasil", description: "File CSV telah diunduh." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Laporan & Ekspor</h1>
          <p className="text-muted-foreground">Unduh rekapan kas transparan untuk dibagikan ke mahasiswa.</p>
        </div>
        <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Semester {data.currentSemester}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Format PDF Profesional
            </CardTitle>
            <CardDescription>Format rapi siap cetak dengan rincian iuran dan tanda tangan bendahara.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button size="lg" className="w-full" onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-slate-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-slate-600" />
              Format CSV Spreadsheet
            </CardTitle>
            <CardDescription>Data mentah untuk diolah kembali menggunakan Microsoft Excel atau Google Sheets.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button variant="outline" size="lg" className="w-full" onClick={downloadCSV}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
