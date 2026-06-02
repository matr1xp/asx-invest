import type { Instrument } from '../types';

export interface IncomeInput {
  amount: number;
  cashYieldPct: number;
  franking: Instrument['franking'];
  marginalRatePct: number;
}
export interface IncomeResult {
  cashIncome: number; frankingCredit: number; grossedIncome: number;
  tax: number; netIncome: number;
}

const CORP_RATE = 0.30;

export function estimateIncome(input: IncomeInput): IncomeResult {
  const cashIncome = input.amount * (input.cashYieldPct / 100);
  const frankedFraction = input.franking === 'Fully' ? 1 : input.franking === 'Partial' ? 0.5 : 0;
  const frankingCredit = cashIncome * frankedFraction * (CORP_RATE / (1 - CORP_RATE));
  const grossedIncome = cashIncome + frankingCredit;
  const rate = input.marginalRatePct / 100;
  const tax = grossedIncome * rate;
  const netIncome = cashIncome - tax + frankingCredit;
  return { cashIncome, frankingCredit, grossedIncome, tax, netIncome };
}
