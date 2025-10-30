def detect_discrepancies(invoice_data: dict, po_data: dict):
    """
    Compare invoice and PO parsed data and return a dictionary of mismatches.
    """
    mismatches = {}
    common_fields = set(invoice_data.keys()) & set(po_data.keys())

    for field in common_fields:
        inv_val = str(invoice_data[field]).strip().lower()
        po_val = str(po_data[field]).strip().lower()
        if inv_val != po_val:
            mismatches[field] = {"invoice": invoice_data[field], "po": po_data[field]}

    return mismatches
