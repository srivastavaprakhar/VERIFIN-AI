"use client"

import { Mail, Send, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function EmailIntegrationDemo() {
  return (
    <Card className="p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50 hover:border-cyan-500/30 transition-colors">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-900/30 rounded-lg border border-cyan-500/20">
            <Mail className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Email Integration (Demo)</h3>
        </div>

        <p className="text-slate-300 mb-6">
          Connect your Gmail account to automatically send verification reports and receive invoice notifications
          directly in your inbox.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-sm text-slate-200">Auto-send verification reports to stakeholders</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-sm text-slate-200">Receive real-time mismatch alerts</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-sm text-slate-200">Schedule daily digest emails with verification summaries</span>
          </div>
        </div>

        <Button className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold">
          <Send className="w-4 h-4" />
          Connect Gmail (Coming Soon)
        </Button>

        <p className="text-xs text-slate-400 mt-4">
          This feature is currently in development. Full Gmail integration will be available in the next release.
        </p>
      </div>
    </Card>
  )
}
