"use client";

import { useMemo, useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import type { Property } from "./mock-data";
import { buildAmortizationSchedule, calculateLoanSummary, calculatePrepaymentImpact, parseExactIndianPrice, validateLoanInputs } from "@/lib/loanCalculations";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const numberValue = (value: string) => value.trim() === "" ? Number.NaN : Number(value);

export default function ExactLoanCalculator({ property }: { property: Property }) {
  const confirmedListingPrice = useMemo(() => parseExactIndianPrice(property.price), [property.price]);
  const confirmedUnitPrices = useMemo(() => {
    const options = [
      ...(property.configurationDetails || []).map((item) => ({ label: `${item.configuration} · ${item.carpetArea}`, value: parseExactIndianPrice(item.price) })),
      ...(property.villaDetails?.configurationDetails || []).map((item) => ({ label: `${item.configuration} · ${item.builtUpArea}`, value: parseExactIndianPrice(item.price) })),
      ...(property.plotDetails?.plotSizeDetails || []).map((item) => ({ label: `${item.plotSize} plot`, value: item.totalPrice > 0 ? item.totalPrice : null })),
    ].filter((item): item is { label: string; value: number } => item.value !== null);
    return options.filter((item, index) => options.findIndex((option) => option.label === item.label && option.value === item.value) === index);
  }, [property.configurationDetails, property.plotDetails?.plotSizeDetails, property.villaDetails?.configurationDetails]);
  const [propertyPrice, setPropertyPrice] = useState(confirmedListingPrice ? String(confirmedListingPrice) : "");
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenureYears, setTenureYears] = useState("");
  const [prepaymentAmount, setPrepaymentAmount] = useState("");
  const [prepaymentMonth, setPrepaymentMonth] = useState("");

  const inputs = {
    propertyPrice: numberValue(propertyPrice),
    loanAmount: numberValue(loanAmount),
    annualInterestRate: numberValue(interestRate),
    tenureYears: numberValue(tenureYears),
  };
  const hasAllInputs = [propertyPrice, loanAmount, interestRate, tenureYears].every((value) => value.trim() !== "");
  const validationError = hasAllInputs ? validateLoanInputs(inputs) : null;
  const summary = hasAllInputs && !validationError ? calculateLoanSummary(inputs) : null;
  const schedule = useMemo(() => summary ? buildAmortizationSchedule(inputs) : [], [summary, inputs.propertyPrice, inputs.loanAmount, inputs.annualInterestRate, inputs.tenureYears]);
  const prepayment = summary && prepaymentAmount && prepaymentMonth
    ? calculatePrepaymentImpact(inputs, numberValue(prepaymentAmount), numberValue(prepaymentMonth))
    : null;

  const fieldLabelClass = "block min-w-0 text-[10px] font-bold leading-4 text-[#4D5564]";
  const fieldShellClass = "mt-1.5 flex h-[52px] w-full min-w-0 items-center overflow-hidden rounded-xl border border-[#D8DCE4] bg-white shadow-[inset_0_1px_0_rgba(18,27,53,.02)] transition-[border-color,box-shadow] focus-within:border-[#C28C25] focus-within:ring-3 focus-within:ring-[#DDAA42]/15";
  const bareInputClass = "h-full min-w-0 flex-1 bg-transparent px-2.5 text-[12px] font-semibold tabular-nums text-[#172039] outline-none placeholder:text-[#989EAA]";
  const affixClass = "flex h-full shrink-0 items-center border-[#E5E2DC] px-2.5 text-[10px] font-bold text-[#757B86]";

  return <section className="w-full rounded-2xl border border-[#E3DED4] bg-[#FFFDF8] p-4 shadow-[0_10px_30px_rgba(18,27,53,.055)]" aria-labelledby="exact-loan-calculator-title">
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#E7D5AC] bg-[#FFF5DE] text-[#8A6107]"><Calculator className="size-[18px]" strokeWidth={1.8} /></span>
      <div className="min-w-0"><h3 id="exact-loan-calculator-title" className="text-[16px] font-extrabold tracking-[-.02em] text-[#172039]">Loan calculator</h3><p className="text-[9px] leading-4 text-[#687080]">Estimate EMI from confirmed values.</p></div>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-x-2.5 gap-y-3">
      {confirmedUnitPrices.length > 0 && <label className={`${fieldLabelClass} col-span-2`}>Select a confirmed unit price
        <span className={`${fieldShellClass} relative`}>
          <select aria-label="Select confirmed unit price" defaultValue="" onChange={(event) => { if (event.target.value) setPropertyPrice(event.target.value); }} className="h-full min-w-0 flex-1 appearance-none bg-transparent pl-3 pr-9 text-[12px] font-semibold text-[#172039] outline-none">
            <option value="">Choose a unit or enter the price below</option>
            {confirmedUnitPrices.map((option) => <option key={`${option.label}-${option.value}`} value={option.value}>{option.label} · {currency.format(option.value)}</option>)}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4 text-[#747B88]" />
        </span>
      </label>}
      <label className={fieldLabelClass}>Property price
        <span className={fieldShellClass}><span className={`${affixClass} border-r`}>₹</span><input aria-label="Confirmed property price" inputMode="decimal" type="number" min="1" step="1" value={propertyPrice} onChange={(event) => setPropertyPrice(event.target.value)} placeholder="Enter price" className={bareInputClass} /></span>
      </label>
      <label className={fieldLabelClass}>Loan amount
        <span className={fieldShellClass}><span className={`${affixClass} border-r`}>₹</span><input aria-label="Confirmed loan amount" inputMode="decimal" type="number" min="1" step="1" value={loanAmount} onChange={(event) => setLoanAmount(event.target.value)} placeholder="Enter amount" className={bareInputClass} /></span>
      </label>
      <label className={fieldLabelClass}>Interest rate
        <span className={fieldShellClass}><input aria-label="Annual interest rate" inputMode="decimal" type="number" min="0" max="50" step="0.01" value={interestRate} onChange={(event) => setInterestRate(event.target.value)} placeholder="8.50" className={bareInputClass} /><span className={`${affixClass} border-l`}>%</span></span>
      </label>
      <label className={fieldLabelClass}>Tenure
        <span className={fieldShellClass}><input aria-label="Loan tenure in years" inputMode="numeric" type="number" min="1" max="40" step="1" value={tenureYears} onChange={(event) => setTenureYears(event.target.value)} placeholder="20" className={bareInputClass} /><span className={`${affixClass} border-l px-2.5`}>years</span></span>
      </label>
    </div>

    {!hasAllInputs && <p className="mt-3 border-t border-[#E8E3DA] pt-3 text-[9px] leading-4 text-[#687080]">Enter all four confirmed values. No lender rate or loan amount is assumed.</p>}
    {validationError && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] font-semibold leading-4 text-red-700">{validationError}</p>}

    {summary && <div className="mt-4 border-t border-[#E1DDD5] pt-4" aria-live="polite" data-testid="loan-result-area">
      <div className="rounded-xl border border-[#E4D1A5] bg-[#FFF7E5] p-3">
        <p className="text-[10px] font-bold text-[#6D624D]">Estimated monthly EMI</p>
        <p className="mt-0.5 text-[21px] font-extrabold tracking-[-.025em] tabular-nums text-[#172039]">{currency.format(Math.round(summary.monthlyEmi))}</p>
        <dl className="mt-3 grid grid-cols-2 border-t border-[#E5D6B6] pt-2.5">
          {[
            ["Down payment", `${currency.format(Math.round(summary.downPayment))} · ${summary.downPaymentPercentage.toFixed(2)}%`],
            ["Loan to value", `${summary.loanToValuePercentage.toFixed(2)}%`],
            ["Total interest", currency.format(Math.round(summary.totalInterest))],
            ["Total repayment", currency.format(Math.round(summary.totalRepayment))],
          ].map(([label, value], index) => <div key={label} className={`${index % 2 ? "border-l pl-2.5" : "pr-2.5"} ${index > 1 ? "mt-2.5 border-t border-[#E5D6B6] pt-2.5" : ""}`}><dt className="text-[9px] font-semibold text-[#777062]">{label}</dt><dd className="mt-0.5 break-words text-[10px] font-extrabold tabular-nums text-[#172039]">{value}</dd></div>)}
        </dl>
      </div>

      <details className="group mt-3 rounded-xl border border-[#DEDAD2] bg-white/75">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3.5 text-[11px] font-bold text-[#39445A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DDAA42]">Detailed schedule &amp; prepayment <ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary>
        <div className="border-t border-[#E2DED6] p-3.5">
          <div className="grid grid-cols-2 gap-3">
            <label className={fieldLabelClass}>Prepayment amount<span className={fieldShellClass}><span className={`${affixClass} border-r`}>₹</span><input aria-label="Prepayment amount" type="number" min="1" step="1" value={prepaymentAmount} onChange={(event) => setPrepaymentAmount(event.target.value)} placeholder="Optional" className={bareInputClass} /></span></label>
            <label className={fieldLabelClass}>After month<span className={fieldShellClass}><input aria-label="Prepayment after month" type="number" min="1" max={summary.numberOfPayments - 1} step="1" value={prepaymentMonth} onChange={(event) => setPrepaymentMonth(event.target.value)} placeholder="Optional" className={bareInputClass} /></span></label>
          </div>
          {(prepaymentAmount || prepaymentMonth) && !prepayment && <p className="mt-3 text-[10px] font-semibold text-red-700">Enter a positive amount and a month before the final payment.</p>}
          {prepayment && <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg border border-[#E7D9B9] bg-[#FFF9EC] p-3 text-[10px]"><p><span className="block text-[#777062]">Interest saved</span><strong className="mt-1 block tabular-nums text-[#172039]">{currency.format(Math.round(prepayment.interestSaved))}</strong></p><p><span className="block text-[#777062]">Payments saved</span><strong className="mt-1 block tabular-nums text-[#172039]">{prepayment.monthsSaved} months</strong></p></div>}
          <div className="mt-3 max-h-52 overflow-auto rounded-lg border border-[#E2DED6] bg-white">
            <table className="w-full min-w-[360px] text-right text-[9px] tabular-nums"><thead className="sticky top-0 bg-[#F5F3EE] text-[#687080]"><tr><th className="p-2 text-left">Month</th><th className="p-2">Principal</th><th className="p-2">Interest</th><th className="p-2">Balance</th></tr></thead><tbody>{schedule.map((row) => <tr key={row.month} className="border-t border-[#EEEAE2]"><td className="p-2 text-left font-bold">{row.month}</td><td className="p-2">{currency.format(Math.round(row.principal))}</td><td className="p-2">{currency.format(Math.round(row.interest))}</td><td className="p-2">{currency.format(Math.round(row.balance))}</td></tr>)}</tbody></table>
          </div>
        </div>
      </details>
      <p className="mt-3 text-[9px] leading-4 text-[#777062]">Mathematical result based on the entered fixed rate and tenure. Your lender's schedule may differ.</p>
    </div>}

    {!summary && <p className="mt-4 text-[9px] leading-4 text-[#777062]">Mathematical result based on the entered fixed rate and tenure. Your lender's schedule may differ.</p>}
  </section>;
}
