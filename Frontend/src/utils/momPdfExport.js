/**
 * momPdfExport.js
 * Requests a MOM PDF from the backend (rendered on the official SQAC letterhead)
 * and triggers a download. PDF generation lives on the backend, which owns the
 * letterhead asset and pdf-lib.
 */

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Generate + download the MOM PDF.
 * @param {object} mom  The MOM data object (same shape used across the app).
 */
export async function exportMOMtoPDF(mom) {
  const res = await fetch(`${API}/api/mom/pdf`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mom),
  });

  if (!res.ok) {
    let msg = "Failed to generate PDF.";
    try {
      const data = await res.json();
      msg = data.message || data.error || msg;
    } catch {
      /* non-JSON error */
    }
    throw new Error(msg);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = String(mom?.title || "meeting").replace(/[^\w-]+/g, "_").slice(0, 60);
  a.href = url;
  a.download = `MOM_${safe}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
