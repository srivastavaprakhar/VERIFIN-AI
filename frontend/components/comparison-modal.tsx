"use client"

import { X, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { DocumentPair } from "@/lib/types"

interface ComparisonModalProps {
  pair: DocumentPair
  onClose: () => void
  onVerify: (pair: DocumentPair) => void
}

export function ComparisonModal({ pair, onClose, onVerify }: ComparisonModalProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      case "medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    }
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === "high") {
      return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
    }
    return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Document Comparison</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-900 dark:text-slate-100" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Document Headers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Invoice</h3>
              {pair.invoiceData && (
                <div className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
                  <p>
                    <span className="font-medium">Vendor:</span> {pair.invoiceData.vendor}
                  </p>
                  <p>
                    <span className="font-medium">Doc #:</span> {pair.invoiceData.documentNumber}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {pair.invoiceData.date}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> ${pair.invoiceData.total.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Purchase Order</h3>
              {pair.poData ? (
                <div className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
                  <p>
                    <span className="font-medium">Vendor:</span> {pair.poData.vendor}
                  </p>
                  <p>
                    <span className="font-medium">Doc #:</span> {pair.poData.documentNumber}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {pair.poData.date}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> ${pair.poData.total.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No PO provided</p>
              )}
            </div>
          </div>

          {/* Mismatches */}
          {pair.mismatches.length > 0 ? (
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Detected Mismatches ({pair.mismatches.length})
              </h3>
              <div className="space-y-2">
                {pair.mismatches.map((mismatch, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(mismatch.severity)}`}>
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(mismatch.severity)}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                          {mismatch.type.replace("_", " ")}
                          {mismatch.itemName && ` - ${mismatch.itemName}`}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                          Invoice: {mismatch.invoiceValue} | PO: {mismatch.poValue || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                          mismatch.severity === "high"
                            ? "bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-200"
                            : "bg-yellow-200 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-200"
                        }`}
                      >
                        {mismatch.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-green-700 dark:text-green-200 font-medium">All documents match perfectly!</p>
            </div>
          )}

          {/* Line Items Comparison */}
          {pair.invoiceData && pair.poData && (
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Line Items Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-2 px-3 font-medium text-slate-700 dark:text-slate-200">Item</th>
                      <th className="text-center py-2 px-3 font-medium text-slate-700 dark:text-slate-200">
                        Invoice Qty
                      </th>
                      <th className="text-center py-2 px-3 font-medium text-slate-700 dark:text-slate-200">PO Qty</th>
                      <th className="text-center py-2 px-3 font-medium text-slate-700 dark:text-slate-200">
                        Invoice Price
                      </th>
                      <th className="text-center py-2 px-3 font-medium text-slate-700 dark:text-slate-200">PO Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pair.invoiceData.items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 px-3 text-slate-900 dark:text-slate-100">{item.name}</td>
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-200">{item.quantity}</td>
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-200">
                          {pair.poData.items.find((i) => i.name === item.name)?.quantity || "-"}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-200">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-200">
                          ${pair.poData.items.find((i) => i.name === item.name)?.unitPrice.toFixed(2) || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              onClick={() => onVerify(pair)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Verify & Save
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
