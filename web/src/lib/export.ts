import type { Holding } from "@/types/domain";

export function exportHoldings(rows: Holding[]) {
  const header = ["Name", "ISIN", "Asset class", "Quantity", "Pending", "Value", "Status"];
  const body = rows.map((row) => [
    row.name,
    row.isin,
    row.assetClass,
    String(row.totalQuantity),
    String(row.pendingQuantity),
    row.value === undefined ? "" : String(row.value),
    row.status,
  ]);
  const csv = [header, ...body].map((line) => line.map((cell) => `"${cell.split('"').join('""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "dhandrishti-holdings.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
