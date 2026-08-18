import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ExactLoanCalculator from "@/components/acres/ExactLoanCalculator";
import { buildAmortizationSchedule, calculateLoanSummary, calculateMonthlyEmi, calculatePrepaymentImpact, parseExactIndianPrice, validateLoanInputs } from "@/lib/loanCalculations";

const inputs = { propertyPrice: 8_000_000, loanAmount: 6_000_000, annualInterestRate: 8.5, tenureYears: 20 };

describe("exact loan calculations", () => {
  it("parses only a single confirmed Indian property price", () => {
    expect(parseExactIndianPrice("₹ 1.25 Cr + Charges")).toBe(12_500_000);
    expect(parseExactIndianPrice("₹ 85 Lacs")).toBe(8_500_000);
    expect(parseExactIndianPrice("₹ 1.25 - 1.80 Cr")).toBeNull();
    expect(parseExactIndianPrice("₹ 80 L to ₹ 1 Cr")).toBeNull();
  });

  it("calculates EMI, down payment, LTV, interest and repayment from confirmed inputs", () => {
    const summary = calculateLoanSummary(inputs);
    expect(summary).not.toBeNull();
    expect(summary?.monthlyEmi).toBeCloseTo(52_069.36, 1);
    expect(summary?.downPayment).toBe(2_000_000);
    expect(summary?.downPaymentPercentage).toBe(25);
    expect(summary?.loanToValuePercentage).toBe(75);
    expect(summary?.totalRepayment).toBeCloseTo((summary?.monthlyEmi || 0) * 240, 6);
    expect(summary?.totalInterest).toBeCloseTo((summary?.totalRepayment || 0) - 6_000_000, 6);
  });

  it("supports zero-interest repayment and rejects invalid values", () => {
    expect(calculateMonthlyEmi(1_200_000, 0, 120)).toBe(10_000);
    expect(validateLoanInputs({ ...inputs, loanAmount: 9_000_000 })).toContain("cannot exceed");
    expect(validateLoanInputs({ ...inputs, tenureYears: 20.5 })).toContain("whole number");
  });

  it("fully amortizes the balance and calculates prepayment savings", () => {
    const schedule = buildAmortizationSchedule(inputs);
    expect(schedule).toHaveLength(240);
    expect(schedule[schedule.length - 1]?.balance).toBeCloseTo(0, 6);
    const impact = calculatePrepaymentImpact(inputs, 500_000, 24);
    expect(impact?.monthsSaved).toBeGreaterThan(0);
    expect(impact?.interestSaved).toBeGreaterThan(0);
  });

  it("renders no assumed loan result before confirmed inputs are entered", () => {
    const html = renderToStaticMarkup(<ExactLoanCalculator property={{ id: "p1", title: "Confirmed Home", subtitle: "Jakkur", price: "₹ 1.25 Cr", configs: [], area: "1200 sqft", image: "home.jpg" }} />);
    expect(html).toContain("Loan calculator");
    expect(html).toContain("No lender rate or loan amount is assumed");
    expect(html).toContain("bg-[#FFFDF8]");
    expect(html).toContain("h-[52px]");
    expect(html).toContain(">₹<");
    expect(html).toContain(">%<");
    expect(html).toContain(">years<");
    expect(html).not.toContain("bg-[#172039]");
    expect(html).not.toContain("Monthly EMI");
  });

  it("renders the separated light EMI result after valid confirmed inputs", async () => {
    const host = document.createElement("div");
    const root = createRoot(host);
    await act(async () => root.render(<ExactLoanCalculator property={{ id: "p2", title: "Confirmed Home", subtitle: "Jakkur", price: "₹ 80 Lacs", configs: [], area: "1200 sqft", image: "home.jpg" }} />));

    const enter = async (label: string, value: string) => {
      const input = host.querySelector(`input[aria-label="${label}"]`) as HTMLInputElement;
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      await act(async () => {
        setValue?.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    };

    await enter("Confirmed loan amount", "6000000");
    await enter("Annual interest rate", "8.5");
    await enter("Loan tenure in years", "20");

    expect(host.querySelector('[data-testid="loan-result-area"]')).toBeTruthy();
    expect(host.textContent).toContain("Estimated monthly EMI");
    expect(host.textContent).toContain("₹52,069");
    expect(host.querySelector('[data-testid="loan-result-area"]')?.className).not.toContain("bg-[#172039]");

    await act(async () => root.unmount());
  });
});
