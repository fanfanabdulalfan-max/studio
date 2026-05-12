export interface Student {
  id: string;
  name: string;
  nim: string;
}

export interface Payment {
  id: string;
  studentId: string;
  weekNumber: number;
  amount: number;
  date: string;
  status: 'paid' | 'unpaid';
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
}
