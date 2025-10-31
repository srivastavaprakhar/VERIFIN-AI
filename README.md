# VeriFin AI

A small project for verifying invoices and purchase orders using OCR and discrepancy detection.

This repository contains a Python backend and a Next.js frontend.

## Repository layout

- `backend/` — Python backend (OCR worker, discrepancy engine, DB access)
- `frontend/` — Next.js (React/TypeScript) UI
- `requirements.txt` — Python dependencies for the backend

## Quick start (Windows PowerShell)

Prerequisites
- Python 3.10+ (or your project's required Python version)
- Node.js (v18+) and either npm or pnpm

Backend (development)

1. Create and activate a virtual environment (PowerShell):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies and run the backend:

```powershell
pip install -r ..\requirements.txt
# Run the app (example using uvicorn if the project uses ASGI)
# If your backend uses a different start, use that instead (e.g. python main.py)
uvicorn main:app --reload --port 8000
```

Frontend (development)

1. From the repo root, install and run the Next.js app:

```powershell
cd frontend
# if you use pnpm
pnpm install
pnpm dev
# or with npm
npm install
npm run dev
```

2. Open http://localhost:3000 in your browser (default Next.js port).

Notes about the System Health UI removal
- The `System Health` KPI card has been removed from `frontend/components/advanced-dashboard.tsx` and the analytics value `systemHealth` is no longer defined there.
- After editing the frontend, the `.next/` directory (Next.js build/dev output) may still contain compiled references to the previous UI. Restart the frontend dev server or run a fresh build to regenerate `.next` without the System Health artifacts.

Rebuild / regenerate dev output (recommended)

```powershell
cd frontend
# stop any running dev server, then
pnpm build   # or npm run build
pnpm start   # or npm run start
```

Verification checklist
- Backend starts without errors (see backend logs)