def detect_discrepancies(invoice_data: dict, po_data: dict) -> dict:
    mismatches = {}

    if invoice_data.get("po_number") != po_data.get("po_number"):
        mismatches["po_number"] = {
            "invoice": invoice_data.get("po_number"),
            "po": po_data.get("po_number")
        }

    if invoice_data.get("vendor") != po_data.get("vendor"):
        mismatches["vendor"] = {
            "invoice": invoice_data.get("vendor"),
            "po": po_data.get("vendor")
        }

    try:
        inv_total = float(invoice_data.get("total_amount", 0))
        po_total = float(po_data.get("total_amount", 0))
    except Exception:
        inv_total = po_total = 0

    if abs(inv_total - po_total) > 0.01:
        mismatches["total_amount"] = {
            "invoice": inv_total,
            "po": po_total
        }

    if invoice_data.get("date") != po_data.get("date"):
        mismatches["date"] = {
            "invoice": invoice_data.get("date"),
            "po": po_data.get("date")
        }

    if not mismatches:
        mismatches["status"] = {"invoice": "✅ No discrepancies found!", "po": ""}

    return mismatches
