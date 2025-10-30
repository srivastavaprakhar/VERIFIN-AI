export async function uploadInvoice(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/upload-invoice", {
    method: "POST",
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload invoice failed: ${res.status}`)
  return res.json()
}

export async function uploadPO(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/upload-po", {
    method: "POST",
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload PO failed: ${res.status}`)
  return res.json()
}

export async function getDiscrepancySummary(): Promise<string> {
  const res = await fetch("/api/detect-discrepancy")
  if (!res.ok) throw new Error(`Detect discrepancy failed: ${res.status}`)
  return res.text()
}

export async function runDiscrepancySql(request: string) {
  const params = new URLSearchParams({ request })
  const res = await fetch(`/api/run-discrepancy-sql?${params.toString()}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error(`Run discrepancy SQL failed: ${res.status}`)
  return res.json() as Promise<{ summary: string }>
}


