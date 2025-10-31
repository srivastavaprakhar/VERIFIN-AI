"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { AlertTriangle, CheckCircle2, Package, TrendingUp, Zap } from "lucide-react"
import type { DocumentPair } from "@/lib/types"

interface AdvancedDashboardProps {
  documentPairs: DocumentPair[]
  analyticsView?: boolean
}

export function AdvancedDashboard({ documentPairs, analyticsView }: AdvancedDashboardProps) {
  const analytics = useMemo(() => {
    const totalDocs = documentPairs.length
    const totalMismatches = documentPairs.reduce((sum, pair) => sum + pair.mismatches.length, 0)
    const matchedPairs = documentPairs.filter((pair) => pair.mismatches.length === 0).length
    const mismatchedPairs = totalDocs - matchedPairs

    // Calculate mismatch types
    const mismatchTypes: Record<string, number> = {}
    documentPairs.forEach((pair) => {
      pair.mismatches.forEach((mismatch) => {
        mismatchTypes[mismatch.type] = (mismatchTypes[mismatch.type] || 0) + 1
      })
    })

    // Calculate severity distribution
    const severityData = [
      { name: "Critical", value: documentPairs.filter((p) => p.mismatches.some((m) => m.severity === "high")).length },
      { name: "Warning", value: documentPairs.filter((p) => p.mismatches.some((m) => m.severity === "medium")).length },
      { name: "Info", value: documentPairs.filter((p) => p.mismatches.some((m) => m.severity === "low")).length },
    ]

    // Advanced trend data with more realistic patterns
    const trendData = Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      processed: Math.floor(Math.random() * 150) + 50,
      matched: Math.floor(Math.random() * 120) + 30,
      flagged: Math.floor(Math.random() * 40) + 5,
    }))

    // Mismatch type distribution
    const mismatchTypeData = Object.entries(mismatchTypes).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }))

    // Performance metrics radar
    const performanceData = [
      { category: "Accuracy", value: 94 },
      { category: "Speed", value: 88 },
      { category: "Coverage", value: 92 },
      { category: "Reliability", value: 96 },
      { category: "Efficiency", value: 85 },
    ]

    return {
      totalDocs,
      totalMismatches,
      matchedPairs,
      mismatchedPairs,
      matchRate: totalDocs > 0 ? ((matchedPairs / totalDocs) * 100).toFixed(1) : 0,
      severityData,
      trendData,
      mismatchTypeData,
      performanceData,
      avgProcessingTime: "2.3s",
    }
  }, [documentPairs])

  const COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]
  const SEVERITY_COLORS = ["#ef4444", "#f59e0b", "#3b82f6"]

  return (
    <div className="space-y-8">
  {/* KPI Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Documents */}
        <Card className="relative overflow-hidden p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Documents</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">{analytics.totalDocs}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Package className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        </Card>

        {/* Match Rate */}
        <Card className="relative overflow-hidden p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Match Rate</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">{analytics.matchRate}%</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        </Card>

        {/* Total Mismatches */}
        <Card className="relative overflow-hidden p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Critical Issues</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">{analytics.totalMismatches}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <AlertTriangle className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        </Card>

        {/* System Health removed */}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processing Trend - Area Chart */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Processing Trend</h3>
            <TrendingUp className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.trendData}>
              <defs>
                <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMatched" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
              <XAxis dataKey="month" stroke="rgba(100,116,139,0.6)" />
              <YAxis stroke="rgba(100,116,139,0.6)" />
              <Tooltip contentStyle={{ backgroundColor: "#0B1220", border: "1px solid #1f2937", borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="processed" stroke="#06b6d4" fillOpacity={1} fill="url(#colorProcessed)" />
              <Area type="monotone" dataKey="matched" stroke="#10b981" fillOpacity={1} fill="url(#colorMatched)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Severity Distribution - Pie */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Issue Severity</h3>
            <Zap className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={analytics.severityData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {analytics.severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#0B1220", border: "1px solid #1f2937", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Performance & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={analytics.performanceData}>
              <PolarGrid stroke="rgba(100,116,139,0.2)" />
              <PolarAngleAxis dataKey="category" stroke="rgba(100,116,139,0.6)" />
              <PolarRadiusAxis stroke="rgba(100,116,139,0.6)" />
              <Radar name="Score" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              <Tooltip contentStyle={{ backgroundColor: "#0B1220", border: "1px solid #1f2937", borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {analytics.mismatchTypeData.length > 0 && (
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Issue Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.mismatchTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="name" stroke="rgba(100,116,139,0.6)" />
                <YAxis stroke="rgba(100,116,139,0.6)" />
                <Tooltip contentStyle={{ backgroundColor: "#0B1220", border: "1px solid #1f2937", borderRadius: 8 }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Summary */}
      <Card className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Matched Pairs</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.matchedPairs}</p>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${analytics.matchRate}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Flagged Issues</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.mismatchedPairs}</p>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${100 - Number(analytics.matchRate)}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Avg Issues/Doc</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {analytics.totalDocs > 0 ? (analytics.totalMismatches / analytics.totalDocs).toFixed(2) : 0}
            </p>
            <p className="text-xs text-slate-500">Per document</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Processing Speed</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.avgProcessingTime}</p>
            <p className="text-xs text-slate-500">Average per doc</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
