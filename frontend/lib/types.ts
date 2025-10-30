export interface ExtractedData {
  vendor: string
  documentNumber: string
  date: string
  items: LineItem[]
  total: number
}

export interface LineItem {
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export interface DocumentPair {
  id: string
  invoiceFile: File
  poFile: File | null
  invoiceData: ExtractedData | null
  poData: ExtractedData | null
  mismatches: Mismatch[]
  status: "pending" | "extracted" | "compared" | "verified"
  uploadedAt: Date
  lastUpdated: Date
}

export interface Mismatch {
  type: "quantity" | "price" | "vendor" | "date" | "missing_item"
  itemName?: string
  invoiceValue?: string | number
  poValue?: string | number
  severity: "low" | "medium" | "high"
}

export interface AnalyticsData {
  totalDocuments: number
  totalMismatches: number
  matchedPairs: number
  mismatchedPairs: number
  lastUpdateTime: Date
}
