def detect_discrepancies(invoice_data: dict, po_data: dict) -> dict:
    """
    Compares parsed invoice and purchase order data dictionaries and
    returns a dictionary of mismatched fields.
    """

    mismatches = {}

    # Match PO references
    # Match PO / Invoice reference numbers (allow invoice_number as fallback)
    invoice_ref = (
        invoice_data.get("purchase_order_reference")
        or invoice_data.get("invoice_number")
    )
    po_ref = po_data.get("purchase_order_id")

    if invoice_ref and po_ref:
        if str(invoice_ref).strip().lower() != str(po_ref).strip().lower():
            mismatches["reference_number"] = {
                "invoice": invoice_ref,
                "po": po_ref
            }
    else:
        # If one is missing, note it for completeness
        mismatches["reference_number"] = {
            "invoice": invoice_ref or "missing",
            "po": po_ref or "missing"
        }

    # Compare dates (allow small differences)
    from datetime import datetime

    invoice_date = invoice_data.get("invoice_date")
    po_date = po_data.get("order_date")

    def parse_date_safe(d):
        try:
            return datetime.strptime(d, "%Y-%m-%d")
        except Exception:
            try:
                return datetime.strptime(d, "%d-%m-%Y")
            except Exception:
                return None

    d1, d2 = parse_date_safe(invoice_date), parse_date_safe(po_date)
    if d1 and d2:
        diff_days = abs((d1 - d2).days)
        if diff_days > 5:  # allow 5-day difference window
            mismatches["date"] = {"invoice": invoice_date, "po": po_date}

    # Match vendors
    if invoice_data.get("vendor") != po_data.get("vendor"):
        mismatches["vendor"] = {
            "invoice": invoice_data.get("vendor"),
            "po": po_data.get("vendor")
        }

    # Compare totals (invoice: total_amount, PO: total_value)
    try:
        inv_total = float(invoice_data.get("total_amount", 0))
        po_total = float(po_data.get("total_value", 0))
    except Exception:
        inv_total = po_total = 0

    if abs(inv_total - po_total) > 0.01:
        mismatches["total_amount"] = {
            "invoice": inv_total,
            "po": po_total
        }

    # Optional: Compare dates if present
    if invoice_data.get("invoice_date") and po_data.get("order_date"):
        if invoice_data.get("invoice_date") != po_data.get("order_date"):
            mismatches["date"] = {
                "invoice": invoice_data.get("invoice_date"),
                "po": po_data.get("order_date")
            }

    # If nothing mismatched, show success
    if not mismatches:
        mismatches["status"] = {"invoice": "✅ No discrepancies found!", "po": ""}

    return mismatches
