export interface Student {
  id: string;
  name: string;
  nim: string;
}

export interface Payment {
  id: string;
  studentId: string;
  weekNumber: string; // Menyimpan format YYYY-MM-DD
  amount: number;
  date: string;
  status: 'paid' | 'unpaid';
  semester?: number; // Opsional: Untuk mendukung filter semester di masa depan
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export interface AppData {
  students: Student[];
  payments: Payment[];
  expenses: Expense[];
  weeklyFee: number;
  currentSemester: number;
}
