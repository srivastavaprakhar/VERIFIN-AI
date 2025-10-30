"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DocumentPair } from "@/lib/types"

interface CSVExportProps {
  documentPairs: DocumentPair[]
}

export function CSVExport({ documentPairs }: CSVExportProps) {
  const generateCSV = () => {
    const headers = [
      "Vendor",
      "Invoice #",
      "PO #",
      "Invoice Date",
      "PO Date",
      "Invoice Total",
      "PO Total",
      "Mismatch Count",
      "Status",
      "Uploaded At",
    ]

    const rows = documentPairs.map((pair) => [
      pair.invoiceData?.vendor || "N/A",
      pair.invoiceData?.documentNumber || "N/A",
      pair.poData?.documentNumber || "N/A",
      pair.invoiceData?.date || "N/A",
      pair.poData?.date || "N/A",
      pair.invoiceData?.total.toFixed(2) || "0",
      pair.poData?.total.toFixed(2) || "0",
      pair.mismatches.length,
      pair.mismatches.length === 0 ? "Matched" : "Mismatched",
      pair.uploadedAt.toISOString(),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell)).join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `verifin-verification-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <Button
      onClick={generateCSV}
      disabled={documentPairs.length === 0}
      variant="outline"
      className="gap-2 bg-transparent text-slate-100 dark:text-slate-100 border-slate-300 dark:border-slate-600 hover:bg-slate-900/50 dark:hover:bg-slate-800/50"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </Button>
  )
}
