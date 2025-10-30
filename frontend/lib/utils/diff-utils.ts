import type { ExtractedData, Mismatch, LineItem } from "@/lib/types"

export function compareDocuments(invoiceData: ExtractedData, poData: ExtractedData): Mismatch[] {
  const mismatches: Mismatch[] = []

  // Vendor mismatch
  if (invoiceData.vendor.toLowerCase() !== poData.vendor.toLowerCase()) {
    mismatches.push({
      type: "vendor",
      invoiceValue: invoiceData.vendor,
      poValue: poData.vendor,
      severity: "high",
    })
  }

  // Date mismatch (allow 30 days difference)
  const invoiceDate = new Date(invoiceData.date)
  const poDate = new Date(poData.date)
  const daysDiff = Math.abs((invoiceDate.getTime() - poDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff > 30) {
    mismatches.push({
      type: "date",
      invoiceValue: invoiceData.date,
      poValue: poData.date,
      severity: "medium",
    })
  }

  // Compare line items
  const poItemMap = new Map(poData.items.map((item) => [item.name, item]))

  for (const invoiceItem of invoiceData.items) {
    const poItem = poItemMap.get(invoiceItem.name)

    if (!poItem) {
      mismatches.push({
        type: "missing_item",
        itemName: invoiceItem.name,
        invoiceValue: invoiceItem.quantity,
        severity: "high",
      })
      continue
    }

    // Quantity mismatch
    if (invoiceItem.quantity !== poItem.quantity) {
      mismatches.push({
        type: "quantity",
        itemName: invoiceItem.name,
        invoiceValue: invoiceItem.quantity,
        poValue: poItem.quantity,
        severity: "high",
      })
    }

    // Price mismatch (allow 5% variance)
    const priceDiff = Math.abs(invoiceItem.unitPrice - poItem.unitPrice)
    const percentDiff = (priceDiff / poItem.unitPrice) * 100
    if (percentDiff > 5) {
      mismatches.push({
        type: "price",
        itemName: invoiceItem.name,
        invoiceValue: invoiceItem.unitPrice.toFixed(2),
        poValue: poItem.unitPrice.toFixed(2),
        severity: "medium",
      })
    }
  }

  return mismatches
}

export function generateMockExtractedData(fileName: string): ExtractedData {
  const vendors = ["Acme Corp", "TechSupply Inc", "Global Logistics", "Premium Materials"]
  const items = [
    { name: "Server Hardware", basePrice: 1200 },
    { name: "Network Equipment", basePrice: 450 },
    { name: "Software Licenses", basePrice: 300 },
    { name: "Consulting Services", basePrice: 150 },
    { name: "Support Package", basePrice: 500 },
  ]

  const vendor = vendors[Math.floor(Math.random() * vendors.length)]
  const selectedItems = items.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 2)

  const lineItems: LineItem[] = selectedItems.map((item) => ({
    name: item.name,
    quantity: Math.floor(Math.random() * 5) + 1,
    unitPrice: item.basePrice + (Math.random() - 0.5) * 100,
    total: 0,
  }))

  lineItems.forEach((item) => {
    item.total = item.quantity * item.unitPrice
  })

  const total = lineItems.reduce((sum, item) => sum + item.total, 0)

  return {
    vendor,
    documentNumber: `DOC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    items: lineItems,
    total,
  }
}
