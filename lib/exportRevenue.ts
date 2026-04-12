import type { SubscriptionEvent, RenewalEvent } from "@/hooks/useContractEvents";
import type { OnChainPlan } from "@/hooks/usePlans";

export type GroupBy = "day" | "week" | "month";

export interface RevenueGroup {
  label: string;    // display label: "Apr 12", "Week 15", "Apr 2026"
  key: string;      // sort key: "2026-04-12", "2026-W15", "2026-04"
  revenue: bigint;
  txCount: number;
  subscribers: string[];
}

// Keep old name as alias for exports
export type MonthlyRevenue = RevenueGroup;

function usdcFloat(amount: bigint): number {
  return Number(amount) / 1_000_000;
}

function usdcStr(amount: bigint): string {
  return "$" + usdcFloat(amount).toFixed(2);
}

function shortAddr(addr: string): string {
  return addr.slice(0, 8) + "..." + addr.slice(-6);
}

function blockTsToDate(ts: number): Date {
  return new Date(ts * 1000);
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function groupKey(date: Date, groupBy: GroupBy): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  if (groupBy === "day")   return `${y}-${m}-${d}`;
  if (groupBy === "week")  return `${y}-W${String(getISOWeek(date)).padStart(2, "0")}`;
  return `${y}-${m}`;
}

function groupLabel(date: Date, groupBy: GroupBy): string {
  if (groupBy === "day")
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (groupBy === "week") {
    const week = getISOWeek(date);
    return `Week ${week}`;
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// Advance a date by one period unit
function advancePeriod(date: Date, groupBy: GroupBy): Date {
  const d = new Date(date);
  if (groupBy === "day")   { d.setDate(d.getDate() + 1); return d; }
  if (groupBy === "week")  { d.setDate(d.getDate() + 7); return d; }
  d.setMonth(d.getMonth() + 1); return d;
}

// Group subscription + renewal events by day / week / month
// Fills all periods from first event up to today with empty slots if no data
export function buildRevenueGroups(
  subEvents: SubscriptionEvent[],
  renewalEvents: RenewalEvent[],
  myPlanIds?: Set<number>,
  groupBy: GroupBy = "month"
): RevenueGroup[] {
  const map = new Map<string, RevenueGroup>();

  function addEvent(ts: number, amount: bigint, user: string, planId: number) {
    if (myPlanIds && !myPlanIds.has(planId)) return;
    const date = blockTsToDate(ts);
    const key = groupKey(date, groupBy);
    if (!map.has(key)) {
      map.set(key, { label: groupLabel(date, groupBy), key, revenue: 0n, txCount: 0, subscribers: [] });
    }
    const entry = map.get(key)!;
    entry.revenue += amount;
    entry.txCount += 1;
    if (!entry.subscribers.includes(user)) entry.subscribers.push(user);
  }

  for (const e of subEvents) addEvent(e.periodEnd - 2592000, e.amount, e.user, e.planId);
  for (const e of renewalEvents) addEvent(e.newPeriodEnd - 2592000, e.amount, e.user, e.planId);

  if (map.size === 0) return [];

  // Fill gaps: from earliest period to today
  const today = new Date();
  const todayKey = groupKey(today, groupBy);
  const sortedKeys = Array.from(map.keys()).sort();
  const firstKey = sortedKeys[0];

  // Find the starting date for the first key
  let cursor = new Date(
    groupBy === "week"
      ? (() => {
          // parse "2026-W15" → Monday of that week
          const [yr, wk] = firstKey.replace("W", "").split("-").map(Number);
          const d = new Date(yr, 0, 1 + (wk - 1) * 7);
          d.setDate(d.getDate() - (d.getDay() || 7) + 1);
          return d;
        })()
      : firstKey.replace(/-(\d{2})$/, (_, d) => `-${d}`) // handles YYYY-MM or YYYY-MM-DD
  );

  while (groupKey(cursor, groupBy) <= todayKey) {
    const key = groupKey(cursor, groupBy);
    if (!map.has(key)) {
      map.set(key, { label: groupLabel(cursor, groupBy), key, revenue: 0n, txCount: 0, subscribers: [] });
    }
    cursor = advancePeriod(cursor, groupBy);
  }

  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

// Legacy alias — used by exportExcel / exportPdf
export function buildMonthlyRevenue(
  subEvents: SubscriptionEvent[],
  renewalEvents: RenewalEvent[],
  _merchantAddress?: string,
  myPlanIds?: Set<number>
): RevenueGroup[] {
  return buildRevenueGroups(subEvents, renewalEvents, myPlanIds, "month");
}

// ── Export Excel ──────────────────────────────────────────────────────────────
export async function exportExcel(
  subEvents: SubscriptionEvent[],
  renewalEvents: RenewalEvent[],
  plans: OnChainPlan[],
  merchantAddress: string,
  myPlanIds: Set<number>,
  totalRevenue: bigint,
  withdrawable: bigint,
  activeSubs: number
) {
  const XLSX = await import("xlsx");

  const monthly = buildMonthlyRevenue(subEvents, renewalEvents, merchantAddress, myPlanIds);

  // ── Sheet 1: Monthly Summary ─────────────────────────────────────────────
  const summaryData = [
    ["StarkPay Revenue Report"],
    ["Merchant", merchantAddress],
    ["Generated", new Date().toLocaleString("en-US")],
    [],
    ["SUMMARY"],
    ["Total Revenue", usdcStr(totalRevenue)],
    ["Withdrawable Balance", usdcStr(withdrawable)],
    ["Active Subscribers", String(activeSubs)],
    [],
    ["MONTHLY BREAKDOWN"],
    ["Month", "Revenue (USDC)", "Transactions", "Unique Wallets", "Subscribers"],
    ...monthly.map(m => [
      m.label,
      usdcFloat(m.revenue),
      m.txCount,
      m.subscribers.length,
      m.subscribers.map(shortAddr).join(", "),
    ]),
    [],
    ["TOTAL", usdcFloat(totalRevenue), subEvents.length + renewalEvents.length, ""],
  ];

  // ── Sheet 2: All Transactions ────────────────────────────────────────────
  const getPlanName = (id: number) => plans.find(p => p.id === id)?.name || `Plan #${id}`;

  const txRows: any[] = [
    ["Date", "Type", "Wallet", "Plan", "Amount (USDC)", "Tx Hash"],
  ];

  const allTx = [
    ...subEvents.filter(e => myPlanIds.has(e.planId)).map(e => ({
      ts: e.periodEnd - 2592000,
      type: "Subscribe",
      user: e.user,
      planId: e.planId,
      amount: e.amount,
      txHash: e.txHash,
    })),
    ...renewalEvents.filter(e => myPlanIds.has(e.planId)).map(e => ({
      ts: e.newPeriodEnd - 2592000,
      type: "Renewal",
      user: e.user,
      planId: e.planId,
      amount: e.amount,
      txHash: e.txHash,
    })),
  ].sort((a, b) => b.ts - a.ts);

  for (const tx of allTx) {
    txRows.push([
      new Date(tx.ts * 1000).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      tx.type,
      tx.user,
      getPlanName(tx.planId),
      usdcFloat(tx.amount),
      tx.txHash,
    ]);
  }

  // ── Sheet 3: Subscriber List ─────────────────────────────────────────────
  const subMap = new Map<string, { plans: Set<number>; total: bigint; lastTs: number }>();
  for (const e of [...subEvents, ...renewalEvents]) {
    if (!myPlanIds.has(e.planId)) continue;
    const key = e.user;
    if (!subMap.has(key)) subMap.set(key, { plans: new Set(), total: 0n, lastTs: 0 });
    const s = subMap.get(key)!;
    s.plans.add(e.planId);
    s.total += e.amount;
    const ts = "periodEnd" in e ? e.periodEnd - 2592000 : (e as any).newPeriodEnd - 2592000;
    if (ts > s.lastTs) s.lastTs = ts;
  }

  const subListRows: any[] = [["Wallet", "Plans", "Total Paid (USDC)", "Last Activity"]];
  for (const [wallet, data] of subMap.entries()) {
    subListRows.push([
      wallet,
      Array.from(data.plans).map(id => getPlanName(id)).join(", "),
      usdcFloat(data.total),
      new Date(data.lastTs * 1000).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    ]);
  }

  // ── Build workbook ───────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1["!cols"] = [{ wch: 20 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Monthly Summary");

  const ws2 = XLSX.utils.aoa_to_sheet(txRows);
  ws2["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 68 }, { wch: 14 }, { wch: 16 }, { wch: 68 }];
  XLSX.utils.book_append_sheet(wb, ws2, "All Transactions");

  const ws3 = XLSX.utils.aoa_to_sheet(subListRows);
  ws3["!cols"] = [{ wch: 68 }, { wch: 20 }, { wch: 18 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Subscriber List");

  const fileName = `starkpay-revenue-${merchantAddress.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ── Export PDF ────────────────────────────────────────────────────────────────
export async function exportPdf(
  subEvents: SubscriptionEvent[],
  renewalEvents: RenewalEvent[],
  plans: OnChainPlan[],
  merchantAddress: string,
  myPlanIds: Set<number>,
  totalRevenue: bigint,
  withdrawable: bigint,
  activeSubs: number
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const monthly = buildMonthlyRevenue(subEvents, renewalEvents, merchantAddress, myPlanIds);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const purple = [124, 58, 237] as [number, number, number];
  const dark   = [10, 6, 28]   as [number, number, number];
  const white  = [255, 255, 255] as [number, number, number];
  const gray   = [130, 120, 160] as [number, number, number];

  // ── Header bar ──────────────────────────────────────────────────────────
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 38, "F");
  doc.setFillColor(...purple);
  doc.rect(0, 0, 6, 38, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...white);
  doc.text("StarkPay", 14, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text("Revenue Report", 14, 24);
  doc.text(`Merchant: ${merchantAddress}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString("en-US")}`, 14, 36);

  // ── KPI boxes ───────────────────────────────────────────────────────────
  const kpis = [
    { label: "Total Revenue",   value: usdcStr(totalRevenue) },
    { label: "Withdrawable",    value: usdcStr(withdrawable) },
    { label: "Active Subs",     value: String(activeSubs) },
    { label: "Total Tx",        value: String(subEvents.filter(e => myPlanIds.has(e.planId)).length + renewalEvents.filter(e => myPlanIds.has(e.planId)).length) },
  ];

  const boxW = 44, boxH = 20, startX = 14, startY = 44, gap = 3;
  kpis.forEach((kpi, i) => {
    const x = startX + i * (boxW + gap);
    doc.setFillColor(20, 14, 48);
    doc.roundedRect(x, startY, boxW, boxH, 3, 3, "F");
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.setFont("helvetica", "normal");
    doc.text(kpi.label.toUpperCase(), x + 4, startY + 6);
    doc.setFontSize(13);
    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    doc.text(kpi.value, x + 4, startY + 15);
  });

  // ── Monthly Summary Table ───────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text("Monthly Revenue Breakdown", 14, 74);

  autoTable(doc, {
    startY: 78,
    head: [["Month", "Revenue (USDC)", "Transactions", "Unique Wallets"]],
    body: monthly.map(m => [
      m.label,
      usdcStr(m.revenue),
      String(m.txCount),
      String(m.subscribers.length),
    ]),
    foot: [["Total", usdcStr(totalRevenue), String(subEvents.length + renewalEvents.length), ""]],
    styles: {
      fillColor: [14, 10, 35],
      textColor: white,
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: { fillColor: purple, fontStyle: "bold", fontSize: 8 },
    footStyles: { fillColor: [20, 14, 48], fontStyle: "bold", textColor: white },
    alternateRowStyles: { fillColor: [18, 13, 42] },
    tableLineColor: [40, 30, 70],
    tableLineWidth: 0.1,
  });

  // ── Subscriber List Table ───────────────────────────────────────────────
  const getPlanName = (id: number) => plans.find(p => p.id === id)?.name || `Plan #${id}`;
  const subMap = new Map<string, { plans: Set<number>; total: bigint }>();
  for (const e of [...subEvents, ...renewalEvents]) {
    if (!myPlanIds.has(e.planId)) continue;
    if (!subMap.has(e.user)) subMap.set(e.user, { plans: new Set(), total: 0n });
    const s = subMap.get(e.user)!;
    s.plans.add(e.planId);
    s.total += e.amount;
  }

  const afterMonthly = (doc as any).lastAutoTable?.finalY ?? 120;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text("Subscriber Summary", 14, afterMonthly + 10);

  autoTable(doc, {
    startY: afterMonthly + 14,
    head: [["Wallet", "Plan(s)", "Total Paid"]],
    body: Array.from(subMap.entries()).map(([wallet, data]) => [
      shortAddr(wallet),
      Array.from(data.plans).map(id => getPlanName(id)).join(", "),
      usdcStr(data.total),
    ]),
    styles: {
      fillColor: [14, 10, 35],
      textColor: white,
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: { fillColor: purple, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [18, 13, 42] },
    tableLineColor: [40, 30, 70],
    tableLineWidth: 0.1,
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 80 }, 2: { cellWidth: 30 } },
  });

  // ── Footer ──────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setTextColor(...gray);
  doc.text("Generated by StarkPay · On-chain subscription protocol on Starknet", 14, pageH - 8);

  const fileName = `starkpay-revenue-${merchantAddress.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
