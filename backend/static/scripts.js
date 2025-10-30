const form = document.getElementById('uploadForm');
const resultText = document.getElementById('resultText');
const loading = document.getElementById('loading');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  loading.style.display = 'block';
  resultText.textContent = '';

  const invoiceFile = document.getElementById('invoiceFile').files[0];
  const poFile = document.getElementById('poFile').files[0];

  if (!invoiceFile || !poFile) {
    alert("Please upload both files!");
    return;
  }

  try {
    // Upload invoice
    const invoiceForm = new FormData();
    invoiceForm.append('file', invoiceFile);
    await fetch('/upload-invoice', { method: 'POST', body: invoiceForm });

    // Upload PO
    const poForm = new FormData();
    poForm.append('file', poFile);
    await fetch('/upload-po', { method: 'POST', body: poForm });

    // Run discrepancy detection
    const res = await fetch('/detect-discrepancy?request=Find mismatched totals and suppliers');
    const data = await res.json();

    loading.style.display = 'none';
    resultText.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    loading.style.display = 'none';
    resultText.textContent = 'Error: ' + err.message;
  }
});
