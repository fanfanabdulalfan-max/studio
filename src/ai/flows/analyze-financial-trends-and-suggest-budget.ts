'use server';
/**
 * @fileOverview An AI Treasury Assistant flow for analyzing financial trends and suggesting budget adjustments.
 *
 * - analyzeFinancialTrendsAndSuggestBudget - A function that handles the financial analysis process.
 * - AnalyzeFinancialTrendsInput - The input type for the analyzeFinancialTrendsAndSuggestBudget function.
 * - AnalyzeFinancialTrendsOutput - The return type for the analyzeFinancialTrendsAndSuggestBudget function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransactionSchema = z.object({
  date: z.string().describe('The date of the transaction in YYYY-MM-DD format.'),
  type: z.enum(['income', 'expense']).describe('The type of transaction, either "income" or "expense".'),
  amount: z.number().describe('The amount of the transaction.'),
  description: z.string().describe('A brief description of the transaction.'),
});

const AnalyzeFinancialTrendsInputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('An array of financial transactions including date, type, amount, and description.'),
});
export type AnalyzeFinancialTrendsInput = z.infer<typeof AnalyzeFinancialTrendsInputSchema>;

const MonthlySummaryEntrySchema = z.object({
  month: z.string().describe('The month in YYYY-MM format.'),
  totalIncome: z.number().describe('Total income for the month.'),
  totalExpenses: z.number().describe('Total expenses for the month.'),
  netBalance: z.number().describe('Net balance (income - expenses) for the month.'),
});

const AnalyzeFinancialTrendsOutputSchema = z.object({
  monthlySummaries: z.array(MonthlySummaryEntrySchema).describe('A summary of financial activity for each month.'),
  trendsAnalysis: z.string().describe('A textual summary of key financial trends observed from the transactions.'),
  budgetSuggestions: z.string().describe('Recommendations for budget adjustments based on the analysis.'),
});
export type AnalyzeFinancialTrendsOutput = z.infer<typeof AnalyzeFinancialTrendsOutputSchema>;

export async function analyzeFinancialTrendsAndSuggestBudget(input: AnalyzeFinancialTrendsInput): Promise<AnalyzeFinancialTrendsOutput> {
  return analyzeFinancialTrendsFlow(input);
}

const analyzeFinancialTrendsPrompt = ai.definePrompt({
  name: 'analyzeFinancialTrendsPrompt',
  input: { schema: AnalyzeFinancialTrendsInputSchema },
  output: { schema: AnalyzeFinancialTrendsOutputSchema },
  prompt: `You are an AI Treasury Assistant. Your task is to analyze the provided financial transaction history, summarize monthly trends, and suggest budget adjustments.

Financial Transaction History:
{{{JSON.stringify transactions}}}

Please perform the following steps:
1. Group the transactions by month (YYYY-MM).
2. For each month, calculate the total income, total expenses, and the net balance (total income - total expenses).
3. Provide a concise textual summary of the key financial trends observed across the months. Highlight significant increases or decreases in income or expenses, and overall financial health.
4. Based on the trends, provide practical and actionable suggestions for budget adjustments to improve financial management.

Ensure your output adheres strictly to the JSON schema provided.`,
});

const analyzeFinancialTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeFinancialTrendsFlow',
    inputSchema: AnalyzeFinancialTrendsInputSchema,
    outputSchema: AnalyzeFinancialTrendsOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeFinancialTrendsPrompt(input);
    return output!;
  }
);
