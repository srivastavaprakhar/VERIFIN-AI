def detect_discrepancies(invoice_data: dict, po_data: dict) -> dict:
    """
    Compares parsed invoice and purchase order data dictionaries and
    returns a dictionary of mismatched fields.
    """

    mismatches = {}

    # Match PO references
    if invoice_data.get("purchase_order_reference") != po_data.get("purchase_order_id"):
        mismatches["po_number"] = {
            "invoice": invoice_data.get("purchase_order_reference"),
            "po": po_data.get("purchase_order_id")
        }

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
