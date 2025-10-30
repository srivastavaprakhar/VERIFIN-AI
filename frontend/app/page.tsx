"use client"

import { useState } from "react"
import { UploadSection } from "@/components/upload-section"
import { ValidationDashboard } from "@/components/validation-dashboard"
import { EmailIntegrationDemo } from "@/components/email-integration-demo"
import { AdvancedDashboard } from "@/components/advanced-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, BarChart3 } from "lucide-react"
import type { DocumentPair } from "@/lib/types"
import { getDiscrepancySummary } from "@/lib/api"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [documentPairs, setDocumentPairs] = useState<DocumentPair[]>([])
  const [selectedPair, setSelectedPair] = useState<DocumentPair | null>(null)
  const [activeTab, setActiveTab] = useState("verify")
  const [summary, setSummary] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  const handleFilesUploaded = (pairs: DocumentPair[]) => {
    setDocumentPairs((prev) => [...prev, ...pairs])
  }

  const handlePairVerified = (updatedPair: DocumentPair) => {
    setDocumentPairs((prev) => prev.map((p) => (p.id === updatedPair.id ? updatedPair : p)))
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/90 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-slate-900 dark:bg-white flex items-center justify-center">
                <span className="text-white dark:text-slate-900 text-sm font-bold">V</span>
              </div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">VeriFin AI</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={async () => {
                  try {
                    setLoadingSummary(true)
                    const text = await getDiscrepancySummary()
                    setSummary(text)
                  } catch (e) {
                    setSummary("Failed to fetch summary. Make sure backend is running and both files are uploaded.")
                  } finally {
                    setLoadingSummary(false)
                  }
                }}
                className="px-3 py-2 text-sm rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                {loadingSummary ? "Checking..." : "Check Discrepancy Summary"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-1 rounded-lg shadow-xl">
            <TabsTrigger
              value="verify"
              className="flex items-center gap-2 text-slate-300 data-[state=active]:text-cyan-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 text-slate-300 data-[state=active]:text-cyan-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
          </TabsList>

          {/* Verify Tab */}
          <TabsContent value="verify" className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              {/* Upload Section */}
              <div>
                <UploadSection onFilesUploaded={handleFilesUploaded} />
              </div>
            </div>

            {summary && (
              <div className="mt-2 p-4 border border-slate-800 rounded-md bg-slate-900 text-slate-100 whitespace-pre-wrap">
                {summary}
              </div>
            )}

            {/* Validation Dashboard */}
            {documentPairs.length > 0 && (
              <div className="mt-8">
                <ValidationDashboard
                  documentPairs={documentPairs}
                  onPairSelected={setSelectedPair}
                  onPairVerified={handlePairVerified}
                />
              </div>
            )}

            {/* Email Integration Demo */}
            <div className="mt-8">
              <EmailIntegrationDemo />
            </div>
          </TabsContent>

          {/* Dashboard Tab - All analytics moved here */}
          <TabsContent value="dashboard" className="space-y-8">
            <AdvancedDashboard documentPairs={documentPairs} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
