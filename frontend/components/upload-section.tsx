"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { DocumentPair } from "@/lib/types"
import { uploadInvoice, uploadPO } from "@/lib/api"
import { toExtractedData } from "@/lib/mappers"

interface UploadSectionProps {
  onFilesUploaded: (pairs: DocumentPair[]) => void
}

export function UploadSection({ onFilesUploaded }: UploadSectionProps) {
  const [dragActiveInvoice, setDragActiveInvoice] = useState(false)
  const [dragActivePO, setDragActivePO] = useState(false)
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([])
  const [poFiles, setPoFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const invoiceInputRef = useRef<HTMLInputElement>(null)
  const poInputRef = useRef<HTMLInputElement>(null)

  const handleDragInvoice = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActiveInvoice(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDragPO = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActivePO(e.type === "dragenter" || e.type === "dragover")
  }

  const validateAndAddFiles = (files: FileList, type: "invoice" | "po") => {
    const newFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type === "application/pdf" && file.size <= 10 * 1024 * 1024) {
        newFiles.push(file)
      }
    }
    if (type === "invoice") {
      setInvoiceFiles((prev) => [...prev, ...newFiles])
    } else {
      setPoFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleDropInvoice = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActiveInvoice(false)
    validateAndAddFiles(e.dataTransfer.files, "invoice")
  }

  const handleDropPO = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActivePO(false)
    validateAndAddFiles(e.dataTransfer.files, "po")
  }

  const handleFileInputInvoice = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddFiles(e.target.files, "invoice")
    }
  }

  const handleFileInputPO = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddFiles(e.target.files, "po")
    }
  }

  const removeFile = (index: number, type: "invoice" | "po") => {
    if (type === "invoice") {
      setInvoiceFiles((prev) => prev.filter((_, i) => i !== index))
    } else {
      setPoFiles((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleParseDocuments = async () => {
    setIsProcessing(true)
    try {
      const pairs: DocumentPair[] = []
      const maxLength = Math.max(invoiceFiles.length, poFiles.length)

      for (let i = 0; i < maxLength; i++) {
        const invoiceFile = invoiceFiles[i] || null
        const poFile = poFiles[i] || null

        if (!invoiceFile && !poFile) continue

        let invoiceData = null
        let poData = null

        if (invoiceFile) {
          try {
            const resp = await uploadInvoice(invoiceFile)
            const parsed = resp?.parsed_data ?? null
            if (parsed) {
              invoiceData = toExtractedData(parsed, invoiceFile.name)
            }
          } catch (e) {
            // ignore per-file failure; leave invoiceData as null
          }
        }

        if (poFile) {
          try {
            const resp = await uploadPO(poFile)
            const parsed = resp?.parsed_data ?? null
            if (parsed) {
              poData = toExtractedData(parsed, poFile.name)
            }
          } catch (e) {
            // ignore per-file failure; leave poData as null
          }
        }

        const pair: DocumentPair = {
          id: `pair-${Date.now()}-${i}`,
          invoiceFile: invoiceFile as File,
          poFile,
          invoiceData,
          poData,
          mismatches: [],
          status: "extracted",
          uploadedAt: new Date(),
          lastUpdated: new Date(),
        }

        pairs.push(pair)
      }

      onFilesUploaded(pairs)
      setInvoiceFiles([])
      setPoFiles([])
    } finally {
      setIsProcessing(false)
    }
  }

  const UploadArea = ({
    title,
    description,
    files,
    dragActive,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onSelectClick,
    onFileInput,
    onRemove,
    inputRef,
  }: {
    title: string
    description: string
    files: File[]
    dragActive: boolean
    onDragEnter: (e: React.DragEvent) => void
    onDragLeave: (e: React.DragEvent) => void
    onDragOver: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
    onSelectClick: () => void
    onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemove: (index: number) => void
    inputRef: React.RefObject<HTMLInputElement>
  }) => (
    <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`text-center py-10 transition-all rounded-lg ${dragActive ? "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" : ""}`}
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-lg border border-blue-400/30 dark:border-blue-500/30">
            <Upload className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300 mb-5">{description}</p>

        <Button
          onClick={onSelectClick}
          variant="outline"
          className="mb-3 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Select Files
        </Button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={onFileInput}
          className="hidden"
          aria-label="Upload PDF files"
        />

        <p className="text-xs text-slate-500 dark:text-slate-400">PDF files only, max 10MB each</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-5 space-y-2">
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Selected Files ({files.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <File className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-900 dark:text-slate-100 truncate">{file.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                    ({(file.size / 1024 / 1024).toFixed(2)}MB)
                  </span>
                </div>
                <button
                  onClick={() => onRemove(index)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Upload */}
        <UploadArea
          title="Upload Invoices"
          description="Drag and drop your invoice PDFs here, or click to select"
          files={invoiceFiles}
          dragActive={dragActiveInvoice}
          onDragEnter={handleDragInvoice}
          onDragLeave={handleDragInvoice}
          onDragOver={handleDragInvoice}
          onDrop={handleDropInvoice}
          onSelectClick={() => invoiceInputRef.current?.click()}
          onFileInput={handleFileInputInvoice}
          onRemove={(index) => removeFile(index, "invoice")}
          inputRef={invoiceInputRef}
        />

        {/* Purchase Order Upload */}
        <UploadArea
          title="Upload Purchase Orders"
          description="Drag and drop your purchase order PDFs here, or click to select"
          files={poFiles}
          dragActive={dragActivePO}
          onDragEnter={handleDragPO}
          onDragLeave={handleDragPO}
          onDragOver={handleDragPO}
          onDrop={handleDropPO}
          onSelectClick={() => poInputRef.current?.click()}
          onFileInput={handleFileInputPO}
          onRemove={(index) => removeFile(index, "po")}
          inputRef={poInputRef}
        />
      </div>

      {/* Parse Button - Only show if files are uploaded */}
      {(invoiceFiles.length > 0 || poFiles.length > 0) && (
        <Button
          onClick={handleParseDocuments}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-6 text-lg font-semibold"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Parsing Documents...
            </>
          ) : (
            `Parse & Extract Data (${invoiceFiles.length + poFiles.length} files)`
          )}
        </Button>
      )}
    </div>
  )
}
