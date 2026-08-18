export type LoanInputs = {
  propertyPrice: number;
  loanAmount: number;
  annualInterestRate: number;
  tenureYears: number;
};

export type LoanSummary = {
  monthlyEmi: number;
  downPayment: number;
  downPaymentPercentage: number;
  totalInterest: number;
  totalRepayment: number;
  loanToValuePercentage: number;
  numberOfPayments: number;
};

export type AmortizationRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

const validFinite = (value: number) => Number.isFinite(value);

export function validateLoanInputs(inputs: LoanInputs): string | null {
  if (![inputs.propertyPrice, inputs.loanAmount, inputs.annualInterestRate, inputs.tenureYears].every(validFinite)) return "Enter valid numeric values.";
  if (inputs.propertyPrice <= 0) return "Property price must be greater than zero.";
  if (inputs.loanAmount <= 0) return "Loan amount must be greater than zero.";
  if (inputs.loanAmount > inputs.propertyPrice) return "Loan amount cannot exceed the confirmed property price.";
  if (inputs.annualInterestRate < 0 || inputs.annualInterestRate > 50) return "Interest rate must be between 0% and 50%.";
  if (!Number.isInteger(inputs.tenureYears) || inputs.tenureYears < 1 || inputs.tenureYears > 40) return "Tenure must be a whole number from 1 to 40 years.";
  return null;
}

export function calculateMonthlyEmi(principal: number, annualInterestRate: number, numberOfPayments: number): number {
  if (![principal, annualInterestRate, numberOfPayments].every(validFinite) || principal <= 0 || annualInterestRate < 0 || numberOfPayments <= 0) return 0;
  const monthlyRate = annualInterestRate / 1200;
  if (monthlyRate === 0) return principal / numberOfPayments;
  const growth = Math.pow(1 + monthlyRate, numberOfPayments);
  return principal * monthlyRate * growth / (growth - 1);
}

export function calculateLoanSummary(inputs: LoanInputs): LoanSummary | null {
  if (validateLoanInputs(inputs)) return null;
  const numberOfPayments = inputs.tenureYears * 12;
  const monthlyEmi = calculateMonthlyEmi(inputs.loanAmount, inputs.annualInterestRate, numberOfPayments);
  const totalRepayment = monthlyEmi * numberOfPayments;
  const downPayment = inputs.propertyPrice - inputs.loanAmount;
  return {
    monthlyEmi,
    downPayment,
    downPaymentPercentage: downPayment / inputs.propertyPrice * 100,
    totalInterest: totalRepayment - inputs.loanAmount,
    totalRepayment,
    loanToValuePercentage: inputs.loanAmount / inputs.propertyPrice * 100,
    numberOfPayments,
  };
}

export function buildAmortizationSchedule(inputs: LoanInputs): AmortizationRow[] {
  const summary = calculateLoanSummary(inputs);
  if (!summary) return [];
  const monthlyRate = inputs.annualInterestRate / 1200;
  let balance = inputs.loanAmount;
  const rows: AmortizationRow[] = [];
  for (let month = 1; month <= summary.numberOfPayments && balance > 0.000001; month += 1) {
    const interest = balance * monthlyRate;
    const principal = Math.min(balance, summary.monthlyEmi - interest);
    const payment = principal + interest;
    balance = Math.max(0, balance - principal);
    rows.push({ month, payment, principal, interest, balance });
  }
  return rows;
}

export function calculatePrepaymentImpact(inputs: LoanInputs, prepaymentAmount: number, afterMonth: number) {
  const summary = calculateLoanSummary(inputs);
  if (!summary || !validFinite(prepaymentAmount) || prepaymentAmount <= 0 || !Number.isInteger(afterMonth) || afterMonth < 1 || afterMonth >= summary.numberOfPayments) return null;
  const monthlyRate = inputs.annualInterestRate / 1200;
  let balance = inputs.loanAmount;
  let totalInterest = 0;
  let month = 0;
  while (balance > 0.000001 && month < summary.numberOfPayments) {
    month += 1;
    const interest = balance * monthlyRate;
    const principal = Math.min(balance, summary.monthlyEmi - interest);
    totalInterest += interest;
    balance = Math.max(0, balance - principal);
    if (month === afterMonth) balance = Math.max(0, balance - Math.min(prepaymentAmount, balance));
  }
  return {
    revisedNumberOfPayments: month,
    monthsSaved: summary.numberOfPayments - month,
    revisedTotalInterest: totalInterest,
    interestSaved: Math.max(0, summary.totalInterest - totalInterest),
  };
}

export function parseExactIndianPrice(value?: string): number | null {
  if (!value?.trim() || /(?:-|–|—)|\bto\b/i.test(value)) return null;
  const cleaned = value
    .replace(/(?:₹|inr|rs\.?)/gi, " ")
    .replace(/\+\s*charges?/gi, " ")
    .replace(/\b(?:starting|from|onwards|approximately|approx\.?|about)\b/gi, " ")
    .replace(/,/g, " ")
    .trim();
  const matches = [...cleaned.matchAll(/(\d+(?:\.\d+)?)\s*(crores?|cr|lakhs?|lacs?|lac|l)?\b/gi)];
  if (matches.length !== 1) return null;
  const amount = Number(matches[0][1]);
  const unit = (matches[0][2] || "").toLowerCase();
  const multiplier = unit.startsWith("cr") || unit.startsWith("crore") ? 10_000_000 : unit.startsWith("l") ? 100_000 : 1;
  const result = amount * multiplier;
  return Number.isFinite(result) && result > 0 ? result : null;
}
