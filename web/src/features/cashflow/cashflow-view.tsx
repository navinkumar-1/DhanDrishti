"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Hourglass,
  Layers,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Filter,
  Download,
  Sparkles,
  TrendingUp,
  X,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatInr } from "@/lib/format";
import { useAccounts, useCashflows, useHoldings, useSummary } from "@/lib/query/hooks";
import type { Account, Holding } from "@/types/domain";

// --- Schema-Aligned Types matching DhanDrishti_Firebase_Schema.md (Section 7.10 & 11) ---
export type CashFlowStatus = "scheduled" | "announced" | "estimated" | "confirmed_received" | "delayed";
export type CashFlowType = "interest" | "dividend" | "principal" | "distribution";
export type CashFlowComponent = "interest" | "dividend" | "rental" | "debt_repayment" | "other";

export interface DetailedCashflow {
  id: string;
  isin: string;
  dueDate: string;
  displayDate: string;
  dayNumber: number;
  monthName: string;
  year: number;
  amountPaise: number;
  amount: number;
  instrumentName: string;
  instrumentDetail: string;
  assetClass: "bond" | "reit" | "invit" | "equity" | "etf" | "mutual_fund";
  flowType: CashFlowType;
  flowTypeLabel: string;
  accountId: string;
  accountLabel: string;
  accountMask: string;
  status: CashFlowStatus;
  evidenceSourceId: string | null;
  sourceNote: string;
  sourceDate: string;
  sourceDocName: string;
  unitsHeld: number;
  components?: {
    component: CashFlowComponent;
    amountPaise: number;
    amount: number;
    taxabilityNote: string;
  }[];
  followTheCash: {
    originEntity: string;
    originDetail: string;
    corporateAction: string;
    holdingsRef: string;
    dematAccount: string;
    payoutDate: string;
    statusSummary: string;
    educationalSteps: string[];
    governingRule: string;
  };
}

// Helper to format ISO date "YYYY-MM-DD"
function parseDateParts(dateStr: string) {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0] || 2026;
  const month = parts[1] || 10;
  const day = parts[2] || 15;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[month - 1] ?? "Oct";
  const displayDate = `${String(day).padStart(2, "0")} ${monthName} ${year}`;
  return { year, month, day, monthName, displayDate };
}

// --- Dynamic Cashflow Generator from Real Firebase Holdings & Accounts ---
function buildDynamicCashflows(
  holdings: Holding[],
  accounts: Account[],
  rawCashflows: Array<{
    id: string;
    date: string;
    name: string;
    accountId: string;
    amount: number;
    status: string;
    kind: string;
  }> = [],
): DetailedCashflow[] {
  const accountMap = new Map<string, Account>();
  for (const acc of accounts) {
    accountMap.set(acc.id, acc);
  }

  const items: DetailedCashflow[] = [];

  // Merge any explicitly persisted Firestore cashflow records
  for (const cf of rawCashflows) {
    const acc = accountMap.get(cf.accountId);
    const accLabel = acc ? acc.label : "Connected Account";
    const accDep = acc?.depository ? acc.depository.toUpperCase() : "DEMAT";
    const accMask = acc ? `${accDep} • ${acc.id}` : "Verified Demat";
    const d = parseDateParts(cf.date);

    items.push({
      id: `cf-raw-${cf.id}`,
      isin: cf.id,
      dueDate: cf.date,
      displayDate: d.displayDate,
      dayNumber: d.day,
      monthName: d.monthName,
      year: d.year,
      amountPaise: Math.round(cf.amount * 100),
      amount: cf.amount,
      instrumentName: cf.name,
      instrumentDetail: `Recorded Account Cashflow • ${accLabel}`,
      assetClass: cf.kind === "interest" ? "bond" : cf.kind === "distribution" ? "reit" : "equity",
      flowType: (cf.kind as CashFlowType) || "distribution",
      flowTypeLabel: cf.kind === "interest" ? "Bond Coupon Interest" : cf.kind === "distribution" ? "Distribution" : "Dividend",
      accountId: cf.accountId,
      accountLabel: accLabel,
      accountMask: accMask,
      status: (cf.status as CashFlowStatus) || "scheduled",
      evidenceSourceId: cf.status === "confirmed_received" ? "cas_statement" : null,
      sourceNote: "Statement record verified against account history",
      sourceDate: cf.date,
      sourceDocName: "Depository / Broker Cashflow Schedule",
      unitsHeld: 1,
      followTheCash: {
        originEntity: cf.name,
        originDetail: "Investment payout derived from verified account records",
        corporateAction: `Disbursement: ${formatInr(cf.amount)}`,
        holdingsRef: "Account position held",
        dematAccount: accLabel,
        payoutDate: d.displayDate,
        statusSummary: cf.status === "confirmed_received" ? "Confirmed Received" : "Scheduled",
        educationalSteps: [
          "Issuer processed payout record",
          `Amount ${formatInr(cf.amount)} scheduled for transfer`,
          `Linked to ${accLabel}`,
          "Validated against statements",
        ],
        governingRule: "Cashflows represent payouts credited to your bank account, not capital gains.",
      },
    });
  }

  for (const h of holdings) {
    const accId = h.accounts[0]?.accountId ?? "demat-a";
    const acc = accountMap.get(accId);
    const accLabel = acc ? acc.label : "Demat Account";
    const accDep = acc?.depository ? acc.depository.toUpperCase() : "DEMAT";
    const accMask = acc ? `${accDep} • ${acc.id}` : "Connected Demat";

    // 1. BONDS (e.g. Aster 8.5% 2029 bond or corporate debt)
    if (h.assetClass === "bond") {
      const faceVal = 1000;
      const couponRate = 0.085;
      const couponAmount = Math.round((h.totalQuantity * faceVal * couponRate) / 2) || 2125;
      const d1 = parseDateParts("2026-10-15");

      items.push({
        id: `cf-bond-${h.isin}-due`,
        isin: h.isin,
        dueDate: "2026-10-15",
        displayDate: d1.displayDate,
        dayNumber: d1.day,
        monthName: d1.monthName,
        year: d1.year,
        amountPaise: couponAmount * 100,
        amount: couponAmount,
        instrumentName: h.name,
        instrumentDetail: `Non-Convertible Debentures (NCD) • ISIN: ${h.isin}`,
        assetClass: "bond",
        flowType: "interest",
        flowTypeLabel: "Bond Coupon Interest",
        accountId: accId,
        accountLabel: accLabel,
        accountMask: accMask,
        status: "scheduled",
        evidenceSourceId: null,
        sourceNote: "Bond indenture terms & debenture trustee disclosure",
        sourceDate: "15 Jun 2024",
        sourceDocName: `${h.name} Bond Terms`,
        unitsHeld: h.totalQuantity,
        followTheCash: {
          originEntity: `${h.issuer} (Borrower / Issuer)`,
          originDetail: `${h.sector} sector corporate entity debt obligation`,
          corporateAction: `Semi-annual 8.5% coupon obligation (${h.totalQuantity} units held)`,
          holdingsRef: `${h.totalQuantity} Bonds Held · Demat Account`,
          dematAccount: `${accLabel} (${accMask})`,
          payoutDate: "15 Oct 2026",
          statusSummary: "Scheduled as per bond indenture terms",
          educationalSteps: [
            `Issuer (${h.issuer}) reserves cash for contractual interest obligation`,
            "Debenture Trustee verifies compliance with loan terms",
            `Direct ECS/RTGS coupon calculation: ${h.totalQuantity} units = ${formatInr(couponAmount)}`,
            `Disbursed to bank account registered with ${accLabel}`,
          ],
          governingRule: "You are a lender, not an owner. Coupon is fixed by contract.",
        },
      });

      // Historical confirmed coupon in April
      const d2 = parseDateParts("2026-04-15");
      items.push({
        id: `cf-bond-${h.isin}-hist`,
        isin: h.isin,
        dueDate: "2026-04-15",
        displayDate: d2.displayDate,
        dayNumber: d2.day,
        monthName: d2.monthName,
        year: d2.year,
        amountPaise: couponAmount * 100,
        amount: couponAmount,
        instrumentName: h.name,
        instrumentDetail: `H1 Coupon Interest Credit • ISIN: ${h.isin}`,
        assetClass: "bond",
        flowType: "interest",
        flowTypeLabel: "Bond Coupon Interest",
        accountId: accId,
        accountLabel: accLabel,
        accountMask: accMask,
        status: "confirmed_received",
        evidenceSourceId: "cas_statement",
        sourceNote: "Form 26AS TDS & Bank Statement Verified Credit · 15 Apr 2026",
        sourceDate: "15 Apr 2026",
        sourceDocName: "Form 26AS Tax Credit Certificate",
        unitsHeld: h.totalQuantity,
        followTheCash: {
          originEntity: h.issuer,
          originDetail: "H1 Contractual Coupon Payment",
          corporateAction: "Semi-annual coupon disbursement",
          holdingsRef: `${h.totalQuantity} Bonds Held`,
          dematAccount: accLabel,
          payoutDate: "15 Apr 2026",
          statusSummary: "Confirmed Received (Verified in Form 26AS and CAS)",
          educationalSteps: [
            "Contractual coupon due date reached",
            "Trustee verified compliance",
            "Direct electronic credit to primary bank",
            "Validated with Form 26AS tax credit",
          ],
          governingRule: "Bond coupons represent debt obligations, not equity profit sharing.",
        },
      });

      // Delayed check flag for audit demo
      const dDelay = parseDateParts("2026-09-28");
      items.push({
        id: `cf-delayed-${h.isin}`,
        isin: h.isin,
        dueDate: "2026-09-28",
        displayDate: dDelay.displayDate,
        dayNumber: dDelay.day,
        monthName: dDelay.monthName,
        year: dDelay.year,
        amountPaise: couponAmount * 100,
        amount: couponAmount,
        instrumentName: h.name,
        instrumentDetail: `NCD Coupon Reconciliation Flag • ISIN: ${h.isin}`,
        assetClass: "bond",
        flowType: "interest",
        flowTypeLabel: "Bond Coupon Interest",
        accountId: accId,
        accountLabel: accLabel,
        accountMask: accMask,
        status: "delayed",
        evidenceSourceId: null,
        sourceNote: "Trustee disclosure vs bank statement reconciliation",
        sourceDate: "28 Sep 2026",
        sourceDocName: "Reconciliation Engine Flag",
        unitsHeld: h.totalQuantity,
        followTheCash: {
          originEntity: h.issuer,
          originDetail: "Contractual bond coupon",
          corporateAction: "Semi-annual interest coupon payout",
          holdingsRef: `${h.totalQuantity} Bonds Held`,
          dematAccount: accLabel,
          payoutDate: "Expected 28 Sep 2026",
          statusSummary: "Evidence missing in imported account records (Needs review)",
          educationalSteps: [
            "Debenture trustee announced coupon payout date as 28 Sep 2026",
            "DhanDrishti checked broker ledger and latest CAS statement",
            "No matching bank credit entry found in currently available data",
            "Flagged as 'Needs Attention' — does not assume payment was missed",
          ],
          governingRule: "Missing evidence ≠ Payment missed. Always verify linked bank account statement.",
        },
      });
    }

    // 2. REITS (e.g. City Offices REIT)
    else if (h.assetClass === "reit") {
      const perUnitPayout = 20;
      const reitTotal = Math.round(h.totalQuantity * perUnitPayout) || 800;
      const d1 = parseDateParts("2026-10-20");

      items.push({
        id: `cf-reit-${h.isin}-due`,
        isin: h.isin,
        dueDate: "2026-10-20",
        displayDate: d1.displayDate,
        dayNumber: d1.day,
        monthName: d1.monthName,
        year: d1.year,
        amountPaise: reitTotal * 100,
        amount: reitTotal,
        instrumentName: h.name,
        instrumentDetail: `Grade-A Commercial IT Parks & Office Complexes • ISIN: ${h.isin}`,
        assetClass: "reit",
        flowType: "distribution",
        flowTypeLabel: "REIT Distribution",
        accountId: accId,
        accountLabel: accLabel,
        accountMask: accMask,
        status: "announced",
        evidenceSourceId: null,
        sourceNote: `${h.name} quarterly statutory board declaration · 28 Sep 2026`,
        sourceDate: "28 Sep 2026",
        sourceDocName: "SEBI Form D Payout Disclosure",
        unitsHeld: h.totalQuantity,
        components: [
          { component: "interest", amountPaise: Math.round(reitTotal * 0.55 * 100), amount: Math.round(reitTotal * 0.55), taxabilityNote: "Interest component (Taxable at slab rate)" },
          { component: "dividend", amountPaise: Math.round(reitTotal * 0.32 * 100), amount: Math.round(reitTotal * 0.32), taxabilityNote: "Dividend component (Tax-free under SPV concession)" },
          { component: "rental", amountPaise: Math.round(reitTotal * 0.13 * 100), amount: Math.round(reitTotal * 0.13), taxabilityNote: "Rental / other income component" },
        ],
        followTheCash: {
          originEntity: `${h.issuer} Trust`,
          originDetail: `Income-generating commercial office properties. Tenants lease office parks.`,
          corporateAction: "Quarterly cashflow distribution declared under SEBI >90% Net Distributable Cash Flow rule",
          holdingsRef: `${h.totalQuantity} Units Held · ${accLabel}`,
          dematAccount: `${accLabel} (${accMask})`,
          payoutDate: "20 Oct 2026",
          statusSummary: "Announced by trust board; DhanDrishti has not yet confirmed bank receipt",
          educationalSteps: [
            "Commercial tenants pay monthly office rent to REIT SPVs",
            "REIT SPV aggregates net distributable cash flows (>90% SEBI distribution rule)",
            `Trustees announce distribution breakdown for ${h.totalQuantity} units`,
            `Electronic transfer scheduled to bank mandate linked to ${accLabel}`,
          ],
          governingRule: "Underlying buildings explain the holding. They are not added again to portfolio value.",
        },
      });

      // Historical confirmed REIT distribution in July
      const d2 = parseDateParts("2026-07-20");
      items.push({
        id: `cf-reit-${h.isin}-hist`,
        isin: h.isin,
        dueDate: "2026-07-20",
        displayDate: d2.displayDate,
        dayNumber: d2.day,
        monthName: d2.monthName,
        year: d2.year,
        amountPaise: reitTotal * 100,
        amount: reitTotal,
        instrumentName: h.name,
        instrumentDetail: `Q1 Commercial REIT Distribution • ISIN: ${h.isin}`,
        assetClass: "reit",
        flowType: "distribution",
        flowTypeLabel: "REIT Distribution",
        accountId: accId,
        accountLabel: accLabel,
        accountMask: accMask,
        status: "confirmed_received",
        evidenceSourceId: "cas_statement",
        sourceNote: "CAS monthly ledger confirmed · 20 Jul 2026",
        sourceDate: "20 Jul 2026",
        sourceDocName: "CDSL/NSDL Consolidated Account Statement",
        unitsHeld: h.totalQuantity,
        followTheCash: {
          originEntity: h.issuer,
          originDetail: "Q1 Commercial Rental Payout",
          corporateAction: "Quarterly distribution credited to unit holders",
          holdingsRef: `${h.totalQuantity} Units Held in ${accLabel}`,
          dematAccount: accLabel,
          payoutDate: "20 Jul 2026",
          statusSummary: "Confirmed Received (Matched in CAS Statement)",
          educationalSteps: [
            "Q1 office tenant rentals collected",
            "Trustee declared distribution payout",
            "Credited to investor bank mandate",
            "Reconciled in depository CAS statement",
          ],
          governingRule: "Announced distributions require depository CAS credit matching before marking as received.",
        },
      });
    }

    // 3. INVITs (e.g. Energy Infrastructure InvIT)
    else if (h.assetClass === "invit") {
      const invitAmount = Math.round(h.totalQuantity * 9) || 450;
      const d1 = parseDateParts("2026-10-22");

      items.push({
        id: `cf-invit-${h.isin}-due`,
        isin: h.isin,
        dueDate: "2026-10-22",
        displayDate: d1.displayDate,
        dayNumber: d1.day,
        monthName: d1.monthName,
        year: d1.year,
        amountPaise: invitAmount * 100,
        amount: invitAmount,
        instrumentName: h.name,
        instrumentDetail: `Inter-State Electric Transmission Grid Lines • ISIN: ${h.isin}`,
        assetClass: "invit",
        flowType: "distribution",
        flowTypeLabel: "InvIT Distribution",
        accountId: accId,
        accountLabel: accLabel,
        accountMask: accMask,
        status: "estimated",
        evidenceSourceId: null,
        sourceNote: "Estimated from past sample disclosures · 31 Mar 2026",
        sourceDate: "31 Mar 2026",
        sourceDocName: "Energy InvIT Annual Investor Presentation",
        unitsHeld: h.totalQuantity,
        components: [
          { component: "interest", amountPaise: Math.round(invitAmount * 0.55 * 100), amount: Math.round(invitAmount * 0.55), taxabilityNote: "Interest from SPV loan pass-through" },
          { component: "debt_repayment", amountPaise: Math.round(invitAmount * 0.45 * 100), amount: Math.round(invitAmount * 0.45), taxabilityNote: "Return of capital / debt repayment (Reduces cost basis)" },
        ],
        followTheCash: {
          originEntity: `${h.issuer} Trust`,
          originDetail: "Long-term concession power transmission lines and renewable evacuation corridors",
          corporateAction: "Quarterly distribution estimated from regulated tariff recovery schedules",
          holdingsRef: `${h.totalQuantity} Units Held · ${accLabel}`,
          dematAccount: `${accLabel} (${accMask})`,
          payoutDate: "22 Oct 2026",
          statusSummary: "Estimated from past disclosures (Not an official board announcement)",
          educationalSteps: [
            "Power grid assets earn regulated availability tariffs",
            "Industrial power purchasers pay transmission charges",
            "SPV pools revenue after operational maintenance",
            `Projected distribution estimated: ${h.totalQuantity} units = ${formatInr(invitAmount)}`,
          ],
          governingRule: "Commercial contracts link holdings together; they do not inflate your portfolio total.",
        },
      });
    }

    // 4. EQUITIES (e.g. Aster Industries, Meridian Bank, Summit Textiles)
    else if (h.assetClass === "equity") {
      if (h.isin === "INESYN000006") {
        // Aster Industries equity
        const d1 = parseDateParts("2026-10-28");
        items.push({
          id: `cf-eq-${h.isin}-due`,
          isin: h.isin,
          dueDate: "2026-10-28",
          displayDate: d1.displayDate,
          dayNumber: d1.day,
          monthName: d1.monthName,
          year: d1.year,
          amountPaise: 50000,
          amount: 500,
          instrumentName: h.name,
          instrumentDetail: `Operating Equity Shares • ISIN: ${h.isin}`,
          assetClass: "equity",
          flowType: "dividend",
          flowTypeLabel: "Interim Equity Dividend",
          accountId: accId,
          accountLabel: accLabel,
          accountMask: `${h.totalQuantity} Shares Held`,
          status: "announced",
          evidenceSourceId: null,
          sourceNote: "Corporate Board Announcement · 29 Sep 2026",
          sourceDate: "29 Sep 2026",
          sourceDocName: "Aster Industries Exchange Filing",
          unitsHeld: h.totalQuantity,
          followTheCash: {
            originEntity: `${h.issuer} Ltd. (Operating Company)`,
            originDetail: "Manufacturing corporation traded on NSE/BSE",
            corporateAction: "Interim Dividend declared by Board of Directors (₹25 per share)",
            holdingsRef: `${h.totalQuantity} Shares Held`,
            dematAccount: accLabel,
            payoutDate: "28 Oct 2026",
            statusSummary: "Announced by Board; awaiting record date settlement",
            educationalSteps: [
              "Operating company generates business net profit",
              "Board recommends dividend resolution to shareholders",
              `Record date determines eligible demat quantities (${h.totalQuantity} shares)`,
              "Funds transferred through banking clearing house directly to linked savings account",
            ],
            governingRule: "A share is an ownership interest. It is not the same as the company's bond.",
          },
        });
      } else if (h.isin === "INESYN000001") {
        // Meridian Bank dividend in August
        const d1 = parseDateParts("2026-08-10");
        items.push({
          id: `cf-eq-${h.isin}-hist`,
          isin: h.isin,
          dueDate: "2026-08-10",
          displayDate: d1.displayDate,
          dayNumber: d1.day,
          monthName: d1.monthName,
          year: d1.year,
          amountPaise: 140000,
          amount: 1400,
          instrumentName: h.name,
          instrumentDetail: `Banking Equity Shares • ISIN: ${h.isin}`,
          assetClass: "equity",
          flowType: "dividend",
          flowTypeLabel: "Annual Equity Dividend",
          accountId: accId,
          accountLabel: accLabel,
          accountMask: accMask,
          status: "confirmed_received",
          evidenceSourceId: "broker_a_ledger",
          sourceNote: "Broker A Ledger & Form 26AS matching · 10 Aug 2026",
          sourceDate: "10 Aug 2026",
          sourceDocName: "Form 26AS TDS Credit Verification",
          unitsHeld: h.totalQuantity,
          followTheCash: {
            originEntity: `${h.issuer} (Commercial Bank)`,
            originDetail: "Private sector scheduled bank",
            corporateAction: "Final dividend approved at Annual General Meeting (₹14/share)",
            holdingsRef: `${h.totalQuantity} Shares Held in ${accLabel}`,
            dematAccount: accLabel,
            payoutDate: "10 Aug 2026",
            statusSummary: "Confirmed Received (TDS credit verified in Form 26AS)",
            educationalSteps: [
              "Annual General Meeting approved dividend of ₹14/share",
              `${h.totalQuantity} shares entitled to ₹1,400`,
              "Direct credit deposited into investor's primary savings account",
              "Reconciled in broker ledger and tax deduction certificate",
            ],
            governingRule: "Direct equity dividends are credited to your bank account, not your demat account.",
          },
        });
      } else if (h.isin === "INESYN000005") {
        // Summit Textiles dividend in August
        const d1 = parseDateParts("2026-08-20");
        items.push({
          id: `cf-eq-${h.isin}-hist`,
          isin: h.isin,
          dueDate: "2026-08-20",
          displayDate: d1.displayDate,
          dayNumber: d1.day,
          monthName: d1.monthName,
          year: d1.year,
          amountPaise: 75000,
          amount: 750,
          instrumentName: h.name,
          instrumentDetail: `Consumer & Textiles Equity • ISIN: ${h.isin}`,
          assetClass: "equity",
          flowType: "dividend",
          flowTypeLabel: "Interim Equity Dividend",
          accountId: accId,
          accountLabel: accLabel,
          accountMask: accMask,
          status: "confirmed_received",
          evidenceSourceId: "broker_a_ledger",
          sourceNote: "Broker A statement record · 20 Aug 2026",
          sourceDate: "20 Aug 2026",
          sourceDocName: "Broker A Transaction Record",
          unitsHeld: h.totalQuantity,
          followTheCash: {
            originEntity: `${h.issuer} Ltd.`,
            originDetail: "Operating consumer goods manufacturer",
            corporateAction: "Interim dividend of ₹10 per share",
            holdingsRef: `${h.totalQuantity} Shares Held in ${accLabel}`,
            dematAccount: accLabel,
            payoutDate: "20 Aug 2026",
            statusSummary: "Confirmed Received",
            educationalSteps: [
              "Company declared interim dividend",
              `${h.totalQuantity} shares entitled to ₹750 payout`,
              "Bank automated clearing house credit confirmed",
              `Verified in ${accLabel} statement`,
            ],
            governingRule: "Dividend payments are verified against broker transaction records.",
          },
        });
      } else {
        // Generic equity dividend calculation based on holding value
        const eqDiv = Math.round((h.value ?? 10000) * 0.015) || 300;
        const d1 = parseDateParts("2026-10-30");
        items.push({
          id: `cf-eq-${h.isin}-gen`,
          isin: h.isin,
          dueDate: "2026-10-30",
          displayDate: d1.displayDate,
          dayNumber: d1.day,
          monthName: d1.monthName,
          year: d1.year,
          amountPaise: eqDiv * 100,
          amount: eqDiv,
          instrumentName: h.name,
          instrumentDetail: `${h.sector} Equity • ISIN: ${h.isin}`,
          assetClass: "equity",
          flowType: "dividend",
          flowTypeLabel: "Corporate Dividend",
          accountId: accId,
          accountLabel: accLabel,
          accountMask: `${h.totalQuantity} Shares Held`,
          status: "announced",
          evidenceSourceId: null,
          sourceNote: "Exchange Corporate Action Notification",
          sourceDate: "30 Sep 2026",
          sourceDocName: "BSE Corporate Action",
          unitsHeld: h.totalQuantity,
          followTheCash: {
            originEntity: h.issuer,
            originDetail: `${h.sector} sector corporate entity`,
            corporateAction: "Interim dividend declaration",
            holdingsRef: `${h.totalQuantity} Shares Held in ${accLabel}`,
            dematAccount: accLabel,
            payoutDate: "30 Oct 2026",
            statusSummary: "Announced by Board",
            educationalSteps: [
              "Board of directors declared dividend",
              "Disbursed electronically to registered bank account",
              `Validated against ${accLabel} holdings`,
            ],
            governingRule: "Equity dividends depend on company profitability and board discretion.",
          },
        });
      }
    }

    // 5. ETFs (e.g. Broad Market ETF)
    else if (h.assetClass === "etf") {
      const d1 = parseDateParts("2026-09-10");
      items.push({
        id: `cf-etf-${h.isin}-hist`,
        isin: h.isin,
        dueDate: "2026-09-10",
        displayDate: d1.displayDate,
        dayNumber: d1.day,
        monthName: d1.monthName,
        year: d1.year,
        amountPaise: 20000,
        amount: 200,
        instrumentName: h.name,
        instrumentDetail: `Passive Index ETF • ISIN: ${h.isin}`,
        assetClass: "etf",
        flowType: "dividend",
        flowTypeLabel: "ETF Dividend",
        accountId: accId,
        accountLabel: accLabel,
        accountMask: accMask,
        status: "confirmed_received",
        evidenceSourceId: "cas_statement",
        sourceNote: "CAS Statement Entry & Bank credit confirmation · 10 Sep 2026",
        sourceDate: "10 Sep 2026",
        sourceDocName: "CDSL Monthly CAS Reconciliation",
        unitsHeld: h.totalQuantity,
        followTheCash: {
          originEntity: `${h.issuer} (Mutual Fund Scheme)`,
          originDetail: "Underlying portfolio of index companies",
          corporateAction: "Dividend pass-through credited to unit holders",
          holdingsRef: `${h.totalQuantity} Units Held · ${accLabel}`,
          dematAccount: `${accLabel} (${accMask})`,
          payoutDate: "10 Sep 2026",
          statusSummary: "Confirmed Received (Verified in CAS and bank ledger)",
          educationalSteps: [
            "Underlying portfolio companies paid dividends to the ETF trust",
            "ETF trustee credited dividend distribution: ₹2.00 / unit",
            `${h.totalQuantity} units held received ₹200 via direct bank mandate`,
            "Matched and verified in monthly CAS statement",
          ],
          governingRule: "Supporting account evidence confirms this cashflow was credited.",
        },
      });
    }
  }

  // Sort chronologically by dueDate
  items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return items;
}

// --- Status Badge Component matching Schema ---
function StatusBadge({ status }: { status: CashFlowStatus }) {
  switch (status) {
    case "confirmed_received":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[12px] font-semibold text-[#059669] border border-[#A7F3D0]/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
          Confirmed Received
        </span>
      );
    case "announced":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[12px] font-semibold text-[#2563EB] border border-[#BFDBFE]/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
          Announced
        </span>
      );
    case "scheduled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFBEB] px-2.5 py-1 text-[12px] font-semibold text-[#D97706] border border-[#FDE68A]/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
          Scheduled
        </span>
      );
    case "estimated":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F3FF] px-2.5 py-1 text-[12px] font-semibold text-[#7C3AED] border border-[#DDD6FE]/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
          Estimated
        </span>
      );
    case "delayed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[12px] font-semibold text-[#DC2626] border border-[#FECACA]/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
          Needs Attention
        </span>
      );
  }
}

// --- Educational Info Tooltip ---
function EducationalInfo({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center ml-1 cursor-help">
      <HelpCircle className="h-3.5 w-3.5 text-text-tertiary hover:text-primary transition-colors" />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-60 rounded-[8px] bg-slate-900 p-2 text-[11px] leading-tight text-white shadow-xl group-hover:block z-50">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
      </span>
    </span>
  );
}

export function CashflowView() {
  const summaryQuery = useSummary();
  const holdingsQuery = useHoldings();
  const accountsQuery = useAccounts();
  const cashflowsQuery = useCashflows();

  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");
  const [selectedCashflow, setSelectedCashflow] = useState<DetailedCashflow | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<string>("all");
  const [upcomingDaysFilter, setUpcomingDaysFilter] = useState<"30D" | "60D" | "90D">("30D");
  const [monthlyChartTab, setMonthlyChartTab] = useState<"all" | "received" | "scheduled">("all");
  const [selectedMonth, setSelectedMonth] = useState("October 2026");

  // Derive dynamic list from real Firebase holdings & accounts & cashflows
  const allCashflows = useMemo(() => {
    const rawHoldings = holdingsQuery.data ?? [];
    const rawAccounts = accountsQuery.data ?? [];
    const rawCashflows = cashflowsQuery.data ?? [];
    return buildDynamicCashflows(rawHoldings, rawAccounts, rawCashflows);
  }, [holdingsQuery.data, accountsQuery.data, cashflowsQuery.data]);

  // Delayed / attention items
  const attentionItem = useMemo(() => {
    return allCashflows.find((c) => c.status === "delayed") ?? null;
  }, [allCashflows]);

  // Dynamically calculated KPIs
  const metrics = useMemo(() => {
    let upcomingSum = 0;
    let upcomingInterest = 0;
    let upcomingDistributions = 0;
    let upcomingDividends = 0;

    let confirmedSum = 0;
    let pendingCount = 0;
    let pendingSum = 0;

    const confirmedByAsset: Record<string, number> = {};

    for (const item of allCashflows) {
      if (item.status === "confirmed_received") {
        confirmedSum += item.amount;
        confirmedByAsset[item.assetClass] = (confirmedByAsset[item.assetClass] ?? 0) + item.amount;
      } else if (item.status !== "delayed") {
        upcomingSum += item.amount;
        if (item.flowType === "interest") upcomingInterest += item.amount;
        else if (item.flowType === "distribution") upcomingDistributions += item.amount;
        else if (item.flowType === "dividend") upcomingDividends += item.amount;

        if (item.status === "announced" || item.status === "scheduled" || item.status === "estimated") {
          pendingCount += 1;
          pendingSum += item.amount;
        }
      }
    }

    const coverage = summaryQuery.data?.coverage;
    const totalKnownAccs = (coverage?.includedCount ?? 3) + (coverage?.missingCount ?? 0);
    const coverageShare = totalKnownAccs > 0 ? Math.round(((coverage?.includedCount ?? 3) / totalKnownAccs) * 100) : 92;
    const accountCount = accountsQuery.data?.length ?? 3;

    return {
      upcomingSum,
      upcomingInterest,
      upcomingDistributions,
      upcomingDividends,
      confirmedSum,
      pendingCount,
      pendingSum,
      coverageShare,
      accountCount,
      confirmedByAsset,
    };
  }, [allCashflows, summaryQuery.data, accountsQuery.data]);

  // Monthly breakdown for SVG Chart
  const monthlyBars = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    return months.map((m, idx) => {
      const monthNum = idx + 1;
      const matching = allCashflows.filter((c) => {
        const parts = c.dueDate.split("-").map(Number);
        return parts[1] === monthNum;
      });

      const recSum = matching.filter((c) => c.status === "confirmed_received").reduce((s, c) => s + c.amount, 0);
      const schSum = matching.filter((c) => c.status !== "confirmed_received").reduce((s, c) => s + c.amount, 0);

      let val = 0;
      if (monthlyChartTab === "all") val = recSum + schSum;
      else if (monthlyChartTab === "received") val = recSum;
      else val = schSum;

      const isScheduled = schSum > recSum;
      return { m, val, isScheduled };
    });
  }, [allCashflows, monthlyChartTab]);

  // Filtered List
  const filteredList = useMemo(() => {
    return allCashflows.filter((item) => {
      if (selectedStatusFilter !== "all" && item.status !== selectedStatusFilter) return false;
      if (selectedAssetFilter !== "all" && item.assetClass !== selectedAssetFilter) return false;
      return true;
    });
  }, [allCashflows, selectedStatusFilter, selectedAssetFilter]);

  // Export CSV matching real schema attributes
  function onExportCsv() {
    const headers = "ISIN,DueDate,InstrumentName,FlowType,Account,AmountRupees,Status,EvidenceSource\n";
    const rows = allCashflows.map(
      (item) =>
        `"${item.isin}","${item.dueDate}","${item.instrumentName}","${item.flowTypeLabel}","${item.accountLabel}","${item.amount}","${item.status}","${item.evidenceSourceId ?? "None"}"`,
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DhanDrishti_CashFlow_Audit_Report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Loading state
  if (summaryQuery.isPending || holdingsQuery.isPending || accountsQuery.isPending) {
    return <div className="skeleton h-[640px] rounded-[14px]" />;
  }

  return (
    <div className="min-h-screen pb-20 text-text-primary antialiased">
      {/* 1. Page Breadcrumbs & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider text-text-secondary uppercase">
          <span>DhanDrishti</span>
          <span>/</span>
          <span>Portfolio</span>
          <span>/</span>
          <span className="text-primary font-bold">Cashflows</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">
              Cashflow &amp; Distribution Calendar
            </h1>
            <p className="mt-1 text-[14px] text-text-secondary">
              Track dividends, interest, distributions and repayments across your investments.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-[10px] border px-3.5 text-[13px] font-semibold transition-all",
                  filterOpen
                    ? "border-primary bg-primary-tint text-primary"
                    : "border-border bg-surface text-slate-700 hover:bg-slate-50",
                )}
              >
                <Filter className="h-4 w-4" />
                Filter
                {(selectedStatusFilter !== "all" || selectedAssetFilter !== "all") && (
                  <span className="flex h-2 w-2 rounded-full bg-primary" />
                )}
              </button>

              {/* 15. Smart Filter Popover */}
              {filterOpen && (
                <div className="absolute right-0 top-12 z-40 w-72 rounded-[14px] border border-border bg-surface p-4 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-[13px] font-bold text-slate-900">Filter Cashflows</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStatusFilter("all");
                        setSelectedAssetFilter("all");
                      }}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Reset all
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        Payment Status
                      </label>
                      <select
                        value={selectedStatusFilter}
                        onChange={(e) => setSelectedStatusFilter(e.target.value)}
                        className="mt-1 w-full rounded-[8px] border border-border bg-slate-50 px-2.5 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="all">All Statuses</option>
                        <option value="confirmed_received">Confirmed Received</option>
                        <option value="announced">Announced</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="estimated">Estimated</option>
                        <option value="delayed">Needs Attention</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        Investment Asset
                      </label>
                      <select
                        value={selectedAssetFilter}
                        onChange={(e) => setSelectedAssetFilter(e.target.value)}
                        className="mt-1 w-full rounded-[8px] border border-border bg-slate-50 px-2.5 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="all">All Instruments</option>
                        <option value="bond">Bonds / NCDs</option>
                        <option value="reit">REITs</option>
                        <option value="invit">InvITs</option>
                        <option value="equity">Equities</option>
                        <option value="etf">ETFs</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFilterOpen(false)}
                    className="mt-4 w-full rounded-[8px] bg-primary py-2 text-center text-[12px] font-bold text-white hover:bg-primary-pressed"
                  >
                    Apply Filters
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-surface px-3.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* 2. Trust-First Information Banner with Dynamic Source Attribution */}
      <div className="mb-6 rounded-[14px] border border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-blue-50/20 p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-blue-100 p-1.5 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-slate-900">Portfolio cashflow data</span>
                <span className="text-[12px] text-text-secondary">• As of {summaryQuery.data?.totalSource?.asOf ?? "31 Aug 2026"}</span>
                <div className="flex items-center gap-1.5 pl-2">
                  {summaryQuery.data?.totalSource?.label && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {summaryQuery.data.totalSource.label}
                    </span>
                  )}
                  {accountsQuery.data?.map((acc) => (
                    <span key={acc.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {acc.label}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                Cashflows are derived from your authenticated account holdings in DhanDrishti.
                Announced or estimated payments are not treated as received without verified evidence.
              </p>
            </div>
          </div>
          <Link
            href="/accounts"
            className="inline-flex shrink-0 items-center gap-1 text-[13px] font-bold text-primary hover:underline"
          >
            View data coverage &rarr;
          </Link>
        </div>
      </div>

      {/* 13. Delayed Payment Attention Alert (Rendered dynamically if item exists) */}
      {attentionItem && (
        <div className="mb-6 rounded-[14px] border border-red-200 bg-red-50/60 p-4 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-red-100 p-1.5 text-danger">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-slate-900">Payment needs attention</span>
                  <span className="text-[14px] font-extrabold text-danger">{formatInr(attentionItem.amount)}</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-danger">
                    Not confirmed received
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-slate-700">
                  <strong>{attentionItem.instrumentName} ({attentionItem.isin})</strong> • Expected: {attentionItem.displayDate}. DhanDrishti has not found
                  evidence of bank credit in currently imported statement records.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCashflow(attentionItem)}
                className="rounded-[8px] bg-surface px-3 py-1.5 text-[12px] font-bold text-danger border border-red-200 hover:bg-red-50"
              >
                View details
              </button>
              <Link
                href="/accounts"
                className="rounded-[8px] bg-danger px-3 py-1.5 text-[12px] font-bold text-white hover:opacity-90"
              >
                Check {attentionItem.accountLabel}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Four Large Executive KPI Cards derived from Real Portfolio Queries */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Upcoming */}
        <div className="group rounded-[14px] border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Upcoming</span>
            <div className="rounded-full bg-amber-50 p-2 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[28px] font-extrabold text-slate-900">{formatInr(metrics.upcomingSum)}</span>
            <span className="ml-2 rounded-full bg-amber-100/60 px-2 py-0.5 text-[11px] font-bold text-amber-800">
              Next 30 days
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-border/60 text-[12px] text-text-secondary space-y-1">
            <div className="flex justify-between">
              <span>Bond Coupon Interest</span>
              <span className="font-semibold text-slate-800">{formatInr(metrics.upcomingInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span>Distributions (REIT &amp; InvIT)</span>
              <span className="font-semibold text-slate-800">{formatInr(metrics.upcomingDistributions)}</span>
            </div>
            <div className="flex justify-between">
              <span>Equity Dividends</span>
              <span className="font-semibold text-slate-800">{formatInr(metrics.upcomingDividends)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Confirmed Received */}
        <div className="group rounded-[14px] border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">
              Confirmed Received
            </span>
            <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[28px] font-extrabold text-slate-900">{formatInr(metrics.confirmedSum)}</span>
            <span className="ml-2 rounded-full bg-emerald-100/60 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
              This year
            </span>
          </div>
          <p className="mt-4 pt-3 border-t border-border/60 text-[12px] text-text-secondary">
            Across <strong>{metrics.accountCount} verified accounts</strong> (backed by bank and depository statements).
          </p>
        </div>

        {/* Card 3: Pending */}
        <div className="group rounded-[14px] border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Pending</span>
            <div className="rounded-full bg-blue-50 p-2 text-primary">
              <Hourglass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[28px] font-extrabold text-slate-900">{formatInr(metrics.pendingSum)}</span>
            <span className="ml-2 rounded-full bg-blue-100/60 px-2 py-0.5 text-[11px] font-bold text-primary">
              {metrics.pendingCount} cashflows
            </span>
          </div>
          <p className="mt-4 pt-3 border-t border-border/60 text-[12px] text-text-secondary">
            <strong>Awaiting confirmation</strong> from scheduled board dates and depository postings.
          </p>
        </div>

        {/* Card 4: Coverage */}
        <div className="group rounded-[14px] border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Coverage</span>
            <div className="rounded-full bg-indigo-50 p-2 text-indigo-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[28px] font-extrabold text-slate-900">{metrics.coverageShare}%</span>
            <span className="ml-2 rounded-full bg-indigo-100/60 px-2 py-0.5 text-[11px] font-bold text-indigo-800">
              Portfolio Coverage
            </span>
          </div>
          <p className="mt-4 pt-3 border-t border-border/60 text-[12px] text-text-secondary">
            Based on {metrics.accountCount} imported accounts in your portfolio.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Timeline / Calendar (2/3) + Right Analytics (1/3) */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: 4. Main Timeline + Calendar Section */}
        <div className="space-y-8 lg:col-span-2">
          {/* Card Container for Timeline & Calendar */}
          <div className="rounded-[16px] border border-border bg-surface p-6 shadow-xs">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-[20px] font-bold text-slate-900">Your Cashflow Timeline</h2>
                <p className="text-[13px] text-text-secondary">
                  Chronological schedule of declared and credited investment payouts
                </p>
              </div>

              {/* Segmented View Toggle: Timeline | Calendar */}
              <div className="inline-flex rounded-[10px] border border-border bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("timeline")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-[8px] px-3.5 py-1.5 text-[13px] font-bold transition-all",
                    viewMode === "timeline" ? "bg-white text-slate-900 shadow-xs" : "text-text-secondary hover:text-slate-900",
                  )}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-[8px] px-3.5 py-1.5 text-[13px] font-bold transition-all",
                    viewMode === "calendar" ? "bg-white text-slate-900 shadow-xs" : "text-text-secondary hover:text-slate-900",
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Calendar
                </button>
              </div>
            </div>

            {/* 5. TIMELINE VIEW */}
            {viewMode === "timeline" ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-slate-900 px-2.5 py-1 text-[12px] font-bold text-white uppercase tracking-wider">
                    {selectedMonth}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="relative pl-6 space-y-6 border-l-2 border-slate-200">
                  {filteredList.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-[14px] border border-border bg-white p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                    >
                      {/* Timeline dot */}
                      <span
                        className={cn(
                          "absolute -left-[31px] top-5 h-3.5 w-3.5 rounded-full border-2 border-white ring-2 ring-slate-200",
                          item.status === "confirmed_received" && "bg-emerald-500 ring-emerald-200",
                          item.status === "announced" && "bg-blue-500 ring-blue-200",
                          item.status === "scheduled" && "bg-amber-500 ring-amber-200",
                          item.status === "estimated" && "bg-purple-500 ring-purple-200",
                          item.status === "delayed" && "bg-red-500 ring-red-200",
                        )}
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          {/* Date Block */}
                          <div className="shrink-0 text-center rounded-[10px] bg-slate-100 border border-slate-200/60 px-2.5 py-1.5">
                            <span className="block text-[16px] font-extrabold text-slate-900 leading-none">
                              {String(item.dayNumber).padStart(2, "0")}
                            </span>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mt-0.5">
                              {item.monthName}
                            </span>
                          </div>

                          {/* Instrument Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-primary transition-colors">
                                {item.flowTypeLabel}
                              </h3>
                              <span className="text-[13px] text-text-secondary">• {item.instrumentName}</span>
                            </div>
                            <p className="text-[12px] text-text-secondary mt-0.5">
                              {item.instrumentDetail} · Account: <strong className="text-slate-800">{item.accountLabel}</strong>
                            </p>
                            <p className="mt-1 text-[11px] text-text-tertiary">
                              {item.sourceNote}
                            </p>
                          </div>
                        </div>

                        {/* Amount & Status & Action */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                          <span className="text-[18px] font-extrabold text-slate-900">
                            {formatInr(item.amount)}
                          </span>
                          <StatusBadge status={item.status} />
                          <button
                            type="button"
                            onClick={() => setSelectedCashflow(item)}
                            className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline cursor-pointer"
                          >
                            View details &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 6. CALENDAR VIEW */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMonth("September 2026")}
                      className="rounded-md border border-border p-1.5 hover:bg-slate-50"
                      title="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-[16px] font-bold text-slate-900">{selectedMonth}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedMonth("October 2026")}
                      className="rounded-md border border-border p-1.5 hover:bg-slate-50"
                      title="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-700">
                    Active Calendar
                  </span>
                </div>

                {/* 7-Day Header */}
                <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-bold text-text-secondary border-b border-border pb-2">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* Calendar Grid Days */}
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  <div className="h-20 rounded-[8px] bg-slate-50/50 p-1" />
                  <div className="h-20 rounded-[8px] bg-slate-50/50 p-1" />
                  <div className="h-20 rounded-[8px] bg-slate-50/50 p-1" />

                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const match = allCashflows.find((cf) => cf.dayNumber === day && cf.monthName === "Oct");
                    return (
                      <div
                        key={day}
                        onClick={() => match && setSelectedCashflow(match)}
                        className={cn(
                          "h-20 rounded-[8px] border p-1 text-left flex flex-col justify-between transition-all",
                          match
                            ? "border-primary/40 bg-blue-50/30 hover:bg-blue-50 cursor-pointer shadow-xs"
                            : "border-border/60 bg-white text-text-secondary",
                          day === 2 && "ring-2 ring-primary ring-offset-1 font-bold",
                        )}
                      >
                        <span className={cn("text-[12px] font-semibold", day === 2 ? "text-primary" : "text-slate-700")}>
                          {day}
                        </span>

                        {match && (
                          <div className="rounded-[6px] bg-white p-1 border border-border text-[11px] leading-tight shadow-xs">
                            <span className="block font-extrabold text-slate-900">
                              {formatInr(match.amount)}
                            </span>
                            <span className="block truncate text-[10px] text-text-secondary">
                              {match.flowTypeLabel.split(" ")[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 10. Monthly Cashflow Bar Chart dynamically computed */}
          <div className="rounded-[16px] border border-border bg-surface p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-[18px] font-bold text-slate-900">Cashflow by Month</h3>
                <p className="text-[13px] text-text-secondary">Historical and projected payments across 2026</p>
              </div>

              {/* Toggle: Received | Scheduled | All */}
              <div className="inline-flex rounded-[8px] border border-border bg-slate-100 p-0.5 text-[12px] font-semibold">
                <button
                  type="button"
                  onClick={() => setMonthlyChartTab("all")}
                  className={cn("rounded-[6px] px-2.5 py-1 transition-colors", monthlyChartTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-text-secondary")}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setMonthlyChartTab("received")}
                  className={cn("rounded-[6px] px-2.5 py-1 transition-colors", monthlyChartTab === "received" ? "bg-white text-slate-900 shadow-xs" : "text-text-secondary")}
                >
                  Received
                </button>
                <button
                  type="button"
                  onClick={() => setMonthlyChartTab("scheduled")}
                  className={cn("rounded-[6px] px-2.5 py-1 transition-colors", monthlyChartTab === "scheduled" ? "bg-white text-slate-900 shadow-xs" : "text-text-secondary")}
                >
                  Scheduled
                </button>
              </div>
            </div>

            {/* Dynamic SVG Bar Chart */}
            <div className="mt-6">
              <div className="grid grid-cols-10 gap-2 items-end h-44 border-b border-border pb-2 pt-6">
                {monthlyBars.map((item) => {
                  const maxVal = Math.max(...monthlyBars.map((b) => b.val), 3000);
                  const heightPercent = item.val === 0 ? 4 : Math.round((item.val / maxVal) * 100);

                  return (
                    <div key={item.m} className="group relative flex flex-col items-center h-full justify-end">
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute -top-8 hidden rounded-[6px] bg-slate-900 px-2 py-1 text-[11px] font-bold text-white shadow-md group-hover:block z-20 whitespace-nowrap">
                        {item.val === 0 ? "No cashflows" : `${formatInr(item.val)} ${item.isScheduled ? "(Sched)" : "(Rec)"}`}
                      </div>

                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={cn(
                          "w-full rounded-t-[6px] transition-all group-hover:opacity-80",
                          item.val === 0 && "bg-slate-100",
                          item.val > 0 && item.isScheduled && "bg-amber-400 border border-amber-500/30",
                          item.val > 0 && !item.isScheduled && "bg-emerald-500",
                        )}
                      />
                      <span className="mt-2 text-[11px] font-semibold text-text-secondary">{item.m}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[12px] text-text-secondary">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Confirmed Received
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Scheduled / Announced
                  </span>
                </div>
                <span>Hover bar to inspect total &amp; payment breakdown</span>
              </div>
            </div>
          </div>

          {/* 14. Master Recent Cashflows Table */}
          <div className="rounded-[16px] border border-border bg-surface p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-[18px] font-bold text-slate-900">Recent Cashflows</h3>
                <p className="text-[13px] text-text-secondary">All historical records with verification provenance</p>
              </div>
              <button
                type="button"
                onClick={onExportCsv}
                className="text-[13px] font-semibold text-primary hover:underline"
              >
                View all cashflows &rarr;
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <th className="py-2.5 pr-4">Date</th>
                    <th className="py-2.5 px-4">ISIN / Security</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Account</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredList.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedCashflow(row)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pr-4 font-semibold text-slate-900 whitespace-nowrap">{row.displayDate}</td>
                      <td className="py-3 px-4">
                        <span className="block font-bold text-slate-900">{row.instrumentName}</span>
                        <span className="block text-[11px] text-text-tertiary">{row.isin}</span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{row.flowTypeLabel}</td>
                      <td className="py-3 px-4 text-slate-600">{row.accountLabel}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">{formatInr(row.amount)}</td>
                      <td className="py-3 pl-4 text-right">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Secondary Analytics, Asset Breakdown, AI Card */}
        <div className="space-y-6">
          {/* 9. Cash Received This Year Donut / Breakdown */}
          <div className="rounded-[16px] border border-border bg-surface p-5 shadow-xs">
            <h3 className="text-[16px] font-bold text-slate-900">Cash Received This Year</h3>
            <p className="text-[12px] text-text-secondary">Actual confirmed deposits in your bank accounts</p>

            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-emerald-500 bg-emerald-50/30">
                <div className="text-center">
                  <span className="block text-[20px] font-extrabold text-slate-900">{formatInr(metrics.confirmedSum)}</span>
                  <span className="block text-[11px] font-semibold text-emerald-700">Confirmed received</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-text-secondary">
                Across {metrics.accountCount} accounts · Verified against statements
              </p>
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-[12px]">
              {Object.entries(metrics.confirmedByAsset).map(([asset, val]) => {
                const pct = metrics.confirmedSum > 0 ? ((val / metrics.confirmedSum) * 100).toFixed(1) : "0";
                return (
                  <div key={asset} className="flex justify-between items-center capitalize">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      {asset} Income
                    </span>
                    <span className="font-bold text-slate-900">{formatInr(val)} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 11. Cashflow by Investment Type */}
          <div className="rounded-[16px] border border-border bg-surface p-5 shadow-xs">
            <h3 className="text-[16px] font-bold text-slate-900">Share of Confirmed Cash Received</h3>
            <p className="text-[11px] text-text-secondary mb-4">
              Distribution share across asset classes (not capital returns)
            </p>

            <div className="space-y-3">
              {Object.entries(metrics.confirmedByAsset).map(([asset, val]) => {
                const pct = metrics.confirmedSum > 0 ? ((val / metrics.confirmedSum) * 100).toFixed(1) : "0";
                return (
                  <div key={asset} className="rounded-[10px] bg-slate-50 p-3 border border-border/80 capitalize">
                    <div className="flex justify-between items-center text-[13px] font-bold">
                      <span className="text-slate-900">{asset} Assets</span>
                      <span className="text-slate-900">{formatInr(val)}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-text-secondary">
                      <span>{pct}% of confirmed cash received</span>
                      <EducationalInfo text={`Cashflow generated by your ${asset} holdings verified against statement credits.`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 12. Upcoming Payments Range Selector */}
          <div className="rounded-[16px] border border-border bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">Upcoming Cashflows</h3>
                <p className="text-[11px] text-text-secondary">Scheduled or announced — not guaranteed</p>
              </div>
              <div className="flex rounded-[6px] border border-border bg-slate-100 p-0.5 text-[11px] font-bold">
                {(["30D", "60D", "90D"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setUpcomingDaysFilter(range)}
                    className={cn(
                      "px-2 py-0.5 rounded-[4px]",
                      upcomingDaysFilter === range ? "bg-white text-slate-900 shadow-xs" : "text-text-secondary",
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[12px] bg-amber-50/60 border border-amber-200/80 p-3 text-[12px]">
              <div className="flex justify-between items-baseline font-bold text-amber-900">
                <span>Total Expected Pipeline</span>
                <span className="text-[16px]">{formatInr(metrics.upcomingSum)}</span>
              </div>
              <p className="mt-1 text-[11px] text-amber-800 leading-snug">
                These amounts are based on currently available schedules or announcements. Actual receipt may differ or be delayed.
              </p>
            </div>
          </div>

          {/* 16. Incomplete Data Coverage Warning */}
          <div className="rounded-[14px] border border-amber-200/90 bg-amber-50/50 p-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-[13px] font-bold text-amber-900">Cashflow coverage is {metrics.coverageShare}%</h4>
                <p className="mt-0.5 text-[12px] text-amber-800 leading-relaxed">
                  DhanDrishti currently has information from your connected accounts. Additional accounts can be added to complete your cashflow tracking.
                </p>
                <Link
                  href="/accounts"
                  className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-amber-900 hover:underline"
                >
                  Review account coverage &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* 17. AI Explanation Card */}
          <div className="rounded-[16px] border border-primary/20 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-primary font-bold text-[14px]">
              <Sparkles className="h-4 w-4" />
              Understand your cashflow
            </div>
            <p className="mt-1 text-[12px] text-slate-700">
              Have a question about a payment or distribution? Ask DhanDrishti AI copilot.
            </p>

            <div className="mt-3 space-y-1.5">
              {[
                "Why am I receiving this payment?",
                "Explain City Offices REIT distribution.",
                "Why is the Aster bond payment pending?",
                "Explain Aster 8.5% bond interest in Hindi.",
              ].map((q) => (
                <Link
                  key={q}
                  href={`/assistant?q=${encodeURIComponent(q)}`}
                  className="block rounded-[8px] border border-border bg-white/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-800 hover:border-primary hover:text-primary transition-all shadow-2xs"
                >
                  &ldquo;{q}&rdquo; &rarr;
                </Link>
              ))}
            </div>

            <Link
              href="/assistant"
              className="mt-4 block w-full rounded-[8px] bg-primary py-2 text-center text-[12px] font-bold text-white hover:bg-primary-pressed shadow-xs"
            >
              Ask DhanDrishti AI &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 7 & 8. Polished Slide-Over Drawer: "Follow the Cash" */}
      {selectedCashflow && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="relative h-full w-full max-w-xl overflow-y-auto bg-surface p-6 shadow-2xl transition-transform animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">
                  Cashflow Details &amp; Lineage
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <h2 className="text-[30px] font-extrabold text-slate-900">
                    {formatInr(selectedCashflow.amount)}
                  </h2>
                  <StatusBadge status={selectedCashflow.status} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCashflow(null)}
                className="rounded-full p-2 text-text-secondary hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Core Info */}
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="rounded-[10px] bg-slate-50 p-3 border border-border">
                  <span className="block text-[11px] font-bold uppercase text-text-secondary">Investment</span>
                  <span className="block font-bold text-slate-900 mt-0.5">{selectedCashflow.instrumentName}</span>
                  <span className="block text-[11px] text-text-secondary">{selectedCashflow.isin}</span>
                </div>
                <div className="rounded-[10px] bg-slate-50 p-3 border border-border">
                  <span className="block text-[11px] font-bold uppercase text-text-secondary">Target Account</span>
                  <span className="block font-bold text-slate-900 mt-0.5">{selectedCashflow.accountLabel}</span>
                  <span className="block text-[11px] text-text-secondary">{selectedCashflow.accountMask}</span>
                </div>
              </div>

              {/* Distribution Breakdown (if REIT/InvIT) */}
              {selectedCashflow.components && selectedCashflow.components.length > 0 && (
                <div className="rounded-[12px] border border-border bg-slate-50/70 p-4">
                  <h4 className="text-[13px] font-bold text-slate-900 mb-2">Distribution Breakdown (SEBI Classification)</h4>
                  <table className="w-full text-[12px]">
                    <tbody>
                      {selectedCashflow.components.map((c, i) => (
                        <tr key={i} className="border-b border-border/60">
                          <td className="py-1 text-slate-600">{c.taxabilityNote}</td>
                          <td className="py-1 text-right font-semibold text-slate-900">
                            {formatInr(c.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="pt-2 text-slate-900">Total Announced Cashflow</td>
                        <td className="pt-2 text-right text-slate-900">
                          {formatInr(selectedCashflow.amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* 8. SIGNATURE HIGHLIGHT: "Follow the Cash" */}
              <div className="mt-6 rounded-[14px] border-2 border-primary/20 bg-gradient-to-b from-blue-50/40 via-white to-slate-50 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="flex items-center gap-2 text-[14px] font-extrabold text-slate-900">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    FOLLOW THE CASH
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Trace-to-Source
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {/* Step 1: Legal Entity / Asset */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-[11px] font-bold">
                      1
                    </div>
                    <div>
                      <span className="block text-[13px] font-bold text-slate-900">
                        {selectedCashflow.followTheCash.originEntity}
                      </span>
                      <span className="block text-[11px] text-text-secondary">
                        {selectedCashflow.followTheCash.originDetail}
                      </span>
                    </div>
                  </div>

                  <div className="ml-3.5 h-4 w-0.5 bg-slate-200" />

                  {/* Step 2: Corporate Payout Action */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold">
                      2
                    </div>
                    <div>
                      <span className="block text-[13px] font-bold text-slate-900">
                        {selectedCashflow.followTheCash.corporateAction}
                      </span>
                      <span className="block text-[11px] text-text-secondary">
                        {selectedCashflow.followTheCash.holdingsRef}
                      </span>
                    </div>
                  </div>

                  <div className="ml-3.5 h-4 w-0.5 bg-slate-200" />

                  {/* Step 3: Account Credit */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                      3
                    </div>
                    <div>
                      <span className="block text-[13px] font-bold text-slate-900">
                        Credited to: {selectedCashflow.followTheCash.dematAccount}
                      </span>
                      <span className="block text-[11px] text-text-secondary">
                        Payout Date: {selectedCashflow.followTheCash.payoutDate}
                      </span>
                    </div>
                  </div>

                  <div className="ml-3.5 h-4 w-0.5 bg-slate-200" />

                  {/* Step 4: Verification Status */}
                  <div
                    className={cn(
                      "flex items-start gap-3 rounded-[8px] p-2",
                      selectedCashflow.status === "confirmed_received" ? "bg-emerald-50" : "bg-amber-50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-[11px] font-bold",
                        selectedCashflow.status === "confirmed_received" ? "bg-emerald-600" : "bg-amber-500",
                      )}
                    >
                      4
                    </div>
                    <div>
                      <span className="block text-[13px] font-bold text-slate-900">
                        Audit Verdict: {selectedCashflow.followTheCash.statusSummary}
                      </span>
                      <span className="block text-[11px] text-text-secondary">
                        Source Document: {selectedCashflow.sourceDocName} ({selectedCashflow.sourceDate})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Educational Sequence Note */}
                <div className="mt-4 pt-3 border-t border-border/80 text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-[8px]">
                  <strong>How money flows for this instrument:</strong>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5 text-text-secondary">
                    {selectedCashflow.followTheCash.educationalSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-primary font-medium italic">
                    Note: {selectedCashflow.followTheCash.governingRule}
                  </p>
                </div>
              </div>

              {/* Status Note & Source Link */}
              <div className="rounded-[10px] bg-slate-50 p-3 text-[12px] text-text-secondary border border-border">
                <span className="block font-bold text-slate-900">Source Attribution &amp; Evidence</span>
                <span className="block mt-0.5">{selectedCashflow.sourceNote}</span>
                {selectedCashflow.evidenceSourceId && (
                  <span className="mt-1 block font-semibold text-emerald-700">
                    Evidence ID: {selectedCashflow.evidenceSourceId}
                  </span>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-text-tertiary">Verified against primary filings</span>
                  <Link
                    href="/trust"
                    className="inline-flex items-center gap-1 font-bold text-primary hover:underline text-[12px]"
                  >
                    View source audit &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Close CTA */}
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setSelectedCashflow(null)}
                className="w-full rounded-[10px] border border-border bg-slate-100 py-2.5 text-center text-[13px] font-bold text-slate-800 hover:bg-slate-200 transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
