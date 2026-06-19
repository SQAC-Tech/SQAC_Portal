import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export default function AcceptCOC() {
  const navigate = useNavigate();

  const [hasRead, setHasRead] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [sigFile, setSigFile] = useState(null);
  const [sigPreviewUrl, setSigPreviewUrl] = useState(null);
  const [sigBase64, setSigBase64] = useState(null);
  const [sigMime, setSigMime] = useState("image/png");
  const [previewPdf, setPreviewPdf] = useState(null); // base64 of signed PDF
  const [stage, setStage] = useState("view"); // "view" | "preview"
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  // ── Signature file selection ─────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PNG or JPG signatures are accepted.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Signature image must be under 2 MB.");
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 200 || img.height < 50) {
        toast.error("Signature image must be at least 200×50 px.");
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setSigFile(file);
      setSigPreviewUrl(objectUrl);
      setSigMime(file.type);
      setPreviewPdf(null); // reset any previous preview

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        setSigBase64(dataUrl.split(",")[1]);
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      toast.error("Could not read the image file.");
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  // ── Generate preview ─────────────────────────────────────────────────────────
  const handleGeneratePreview = async () => {
    if (!sigBase64) {
      toast.error("Please upload your signature first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/coc/preview`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureBase64: sigBase64, mimeType: sigMime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed.");
      setPreviewPdf(data.previewBase64);
      setStage("preview");
    } catch (err) {
      toast.error(err.message || "Could not generate preview.");
    } finally {
      setLoading(false);
    }
  };

  // ── Confirm & submit ─────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/coc/confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureBase64: sigBase64, mimeType: sigMime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");

      // Update localStorage user flags
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      stored.cocAccepted = true;
      localStorage.setItem("user", JSON.stringify(stored));

      toast.success("COC accepted successfully!");
      navigate("/complete-profile", { replace: true });
    } catch (err) {
      toast.error(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canPreview = hasRead && hasAgreed && !!sigBase64;

  // ── Preview stage ────────────────────────────────────────────────────────────
  if (stage === "preview") {
    const pdfDataUrl = `data:application/pdf;base64,${previewPdf}`;
    return (
      <div className="min-h-screen bg-[#070910] text-[#f5eefc] flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="mb-6 text-center">
            <div className="inline-block px-4 py-1 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/30 text-[#f183ff] text-xs font-bold uppercase tracking-widest mb-3">
              Preview
            </div>
            <h1 className="text-2xl font-bold">Signed COC Preview</h1>
            <p className="text-[#aea9b6] text-sm mt-1">Review your signature placement before confirming.</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#0c0f1a]/70 overflow-hidden mb-6">
            <iframe
              src={pdfDataUrl}
              title="Signed COC Preview"
              className="w-full"
              style={{ height: "70vh", border: "none" }}
            />
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStage("view")}
              className="px-6 py-2.5 rounded-xl border border-white/15 text-[#aea9b6] hover:text-white hover:border-white/30 transition-colors text-sm font-medium"
            >
              ← Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Submitting…" : "Confirm & Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main acceptance stage ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/30 text-[#f183ff] text-xs font-bold uppercase tracking-widest mb-3">
            Step 1 of 2
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#f183ff] to-[#ff6c95] bg-clip-text text-transparent">
            Code of Conduct
          </h1>
          <p className="text-[#aea9b6] text-sm mt-2">
            Please read the Code of Conduct carefully, then sign and submit.
          </p>
        </div>

        {/* PDF Viewer */}
        <div className="rounded-2xl border border-white/8 bg-[#0c0f1a]/70 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f183ff] text-[18px]">description</span>
            <span className="text-sm font-medium">SQAC Code of Conduct</span>
            <a
              href={`${API}/api/coc/document`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs text-[#81ecff] hover:underline"
            >
              Open in new tab ↗
            </a>
          </div>
          <iframe
            src={`${API}/api/coc/document`}
            title="SQAC Code of Conduct"
            className="w-full"
            style={{ height: "60vh", border: "none" }}
          />
        </div>

        {/* Checkboxes */}
        <div className="rounded-2xl border border-white/8 bg-[#0c0f1a]/70 p-6 mb-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={hasRead}
              onChange={(e) => setHasRead(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#f183ff] cursor-pointer"
            />
            <span className="text-sm text-[#aea9b6] group-hover:text-white transition-colors">
              I have <strong className="text-white">read</strong> the SQAC Code of Conduct in full.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#f183ff] cursor-pointer"
            />
            <span className="text-sm text-[#aea9b6] group-hover:text-white transition-colors">
              I <strong className="text-white">agree</strong> to abide by the SQAC Code of Conduct.
            </span>
          </label>
        </div>

        {/* Signature Upload */}
        <div className="rounded-2xl border border-white/8 bg-[#0c0f1a]/70 p-6 mb-6">
          <p className="text-sm font-semibold text-white mb-1">Upload Signature</p>
          <p className="text-xs text-[#aea9b6] mb-4">
            PNG or JPG, max 2 MB, minimum 200×50 px. Plain background recommended.
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 text-sm text-[#aea9b6] hover:border-[#f183ff]/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span>
            {sigFile ? sigFile.name : "Choose File"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileChange}
          />

          {sigPreviewUrl && (
            <div className="mt-4">
              <p className="text-xs text-[#aea9b6] mb-2">Signature Preview</p>
              <div className="inline-block rounded-xl border border-white/10 bg-white/5 p-3">
                <img
                  src={sigPreviewUrl}
                  alt="Signature preview"
                  className="max-h-[80px] max-w-[300px] object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Generate Preview Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGeneratePreview}
            disabled={!canPreview || loading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-black font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {loading ? "Generating…" : "Generate Preview →"}
          </button>
        </div>

        {!canPreview && (
          <p className="text-center text-xs text-[#aea9b6] mt-3">
            Check both boxes and upload your signature to continue.
          </p>
        )}
      </div>
    </div>
  );
}
