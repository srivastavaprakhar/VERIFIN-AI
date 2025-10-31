"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ComparisonModal } from "@/components/comparison-modal"
import { CSVExport } from "@/components/csv-export"
import type { DocumentPair } from "@/lib/types"
import { compareDocuments } from "@/lib/utils/diff-utils"

interface ValidationDashboardProps {
  documentPairs: DocumentPair[]
  onPairSelected: (pair: DocumentPair | null) => void
  onPairVerified: (pair: DocumentPair) => void
}

export function ValidationDashboard({ documentPairs, onPairSelected, onPairVerified }: ValidationDashboardProps) {
  const [selectedPair, setSelectedPair] = useState<DocumentPair | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleViewDetails = (pair: DocumentPair) => {
    setSelectedPair(pair)
  }

  const handleVerify = (pair: DocumentPair) => {
    if (pair.invoiceData && pair.poData) {
      const mismatches = compareDocuments(pair.invoiceData, pair.poData)
      const updatedPair = {
        ...pair,
        mismatches,
        status: "compared" as const,
        lastUpdated: new Date(),
      }
      onPairVerified(updatedPair)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Validation Dashboard</h2>
          <CSVExport documentPairs={documentPairs} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">Vendor</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">Invoice #</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">PO #</th>
                <th className="text-center py-3 px-4 font-medium text-slate-600 dark:text-slate-300">Mismatches</th>
                <th className="text-center py-3 px-4 font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documentPairs.map((pair) => (
                <tr
                  key={pair.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-900 dark:text-slate-50 font-medium">
                    {pair.invoiceData?.vendor || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-100">
                    {pair.invoiceData?.documentNumber || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-100">
                    {pair.poData?.documentNumber || "No PO"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                        pair.mismatches.length === 0
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200"
                      }`}
                    >
                      {pair.mismatches.length}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {pair.mismatches.length === 0 ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-green-600 dark:text-green-200 text-xs font-medium">Matched</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="text-red-600 dark:text-red-200 text-xs font-medium">Mismatched</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleViewDetails(pair)}
                        size="sm"
                        variant="ghost"
                        className="text-xs text-slate-100 dark:text-slate-100"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPair && (
        <ComparisonModal pair={selectedPair} onClose={() => setSelectedPair(null)} onVerify={handleVerify} />
      )}
    </>
  )
}
