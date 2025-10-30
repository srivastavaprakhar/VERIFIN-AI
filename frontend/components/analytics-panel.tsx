"use client"

import { TrendingUp, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { DocumentPair } from "@/lib/types"

interface AnalyticsPanelProps {
  documentPairs: DocumentPair[]
}

export function AnalyticsPanel({ documentPairs }: AnalyticsPanelProps) {
  const totalDocuments = documentPairs.length
  const totalMismatches = documentPairs.reduce((sum, pair) => sum + pair.mismatches.length, 0)
  const matchedPairs = documentPairs.filter((pair) => pair.mismatches.length === 0).length
  const mismatchedPairs = totalDocuments - matchedPairs

  const stats = [
    {
      label: "Documents Processed",
      value: totalDocuments,
      icon: FileText,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Mismatches",
      value: totalMismatches,
      icon: AlertCircle,
      color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
    {
      label: "Matched Pairs",
      value: matchedPairs,
      icon: CheckCircle2,
      color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
      label: "Mismatched Pairs",
      value: mismatchedPairs,
      icon: AlertCircle,
      color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Analytics</h3>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        )
      })}

      <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Last Updated</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
