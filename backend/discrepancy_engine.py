def detect_discrepancies(invoice_data: dict, po_data: dict) -> list:
    mismatches = []

    if invoice_data.get("po_number") != po_data.get("po_number"):
        mismatches.append("PO number mismatch.")

    if invoice_data.get("vendor") != po_data.get("vendor"):
        mismatches.append("Vendor mismatch.")

    if abs(invoice_data.get("total_amount", 0) - po_data.get("total_amount", 0)) > 0.01:
        mismatches.append(
            f"Amount mismatch: Invoice = {invoice_data.get('total_amount')}, PO = {po_data.get('total_amount')}"
        )

    if invoice_data.get("date") != po_data.get("date"):
        mismatches.append("Date mismatch.")

    return mismatches or ["✅ No discrepancies found!"]
