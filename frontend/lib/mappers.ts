import type { ExtractedData, LineItem } from "@/lib/types"

export function toExtractedData(parsed: any, fallbackName: string): ExtractedData {
  const vendor = parsed?.vendor ?? "Unknown Vendor"
  const documentNumber =
    parsed?.invoice_number ??
    parsed?.purchase_order_id ??
    parsed?.purchase_order_reference ??
    fallbackName
  const date = parsed?.invoice_date ?? parsed?.order_date ?? ""
  const totalRaw = parsed?.total_amount ?? parsed?.total_value
  const total = typeof totalRaw === "number" ? totalRaw : Number(totalRaw ?? 0) || 0

  const items: LineItem[] = []

  return { vendor, documentNumber, date, items, total }
}


