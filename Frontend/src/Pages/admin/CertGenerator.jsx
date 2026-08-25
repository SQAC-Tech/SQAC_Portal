import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import QRCode from "qrcode";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Navbar from "../../components/common/layout/Navbar";
import { API_BASE_URL, clearSession } from "../../api/session";

// The QR code on a printed certificate is permanent, so the verification URL
// baked into it must be too. window.location.origin would freeze whatever host
// the admin happened to generate from — including a preview deployment — so the
// production origin is configured explicitly and only falls back for local dev.
const PORTAL_URL = (
  import.meta.env.VITE_PORTAL_URL || window.location.origin
).replace(/\/$/, "");

// Certificates are mailed in small chunks: Vercel rejects any function request
// body over 4.5 MB, and base64 inflates a PNG by a third. We cap on both count
// and accumulated size so one unusually large template can't blow the limit.
const MAX_ITEMS_PER_CHUNK = 3;
const MAX_CHUNK_BYTES = 3 * 1024 * 1024;

const CSV_ALIASES = {
  name: ["name", "fullname", "full_name", "full name"],
  email: ["email", "mail", "email address", "email_address"],
  teamCode: ["teamcode", "team_code", "team code", "team"],
};

// CSV headers in the wild are inconsistent ("Team Code", "team_code", "TEAM").
// Normalise once here rather than making every organiser rename their columns.
function readRow(row) {
  const lookup = {};
  for (const key of Object.keys(row)) {
    lookup[key.trim().toLowerCase()] = row[key];
  }
  const pick = (field) => {
    for (const alias of CSV_ALIASES[field]) {
      const v = lookup[alias];
      if (v != null && String(v).trim()) return String(v).trim();
    }
    return "";
  };
  return { name: pick("name"), email: pick("email"), teamCode: pick("teamCode") };
}

export default function CertGenerator() {
  const [templateImage, setTemplateImage] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvIssues, setCsvIssues] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateType, setTemplateType] = useState("participation");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [inputType, setInputType] = useState("csv"); // 'csv' or 'manual'
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualTeamCode, setManualTeamCode] = useState("");
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });

  // Live view of the run: which phase we're in and how far along.
  const [progress, setProgress] = useState(null);

  // Set when a run finishes with undelivered mail. Drives the resend prompt —
  // the whole point is that the admin never has to notice the failure
  // themselves, they're asked about it directly.
  const [sendReport, setSendReport] = useState(null);
  const [isResending, setIsResending] = useState(false);

  // Rendered PNGs from the current run, kept so a resend can reuse them without
  // regenerating. Cleared when a new batch starts.
  const renderedRef = useRef(new Map());

  const showAlert = (message, type = "info") => {
    setAlertModal({ isOpen: true, message, type });
  };

  const [textPosition, setTextPosition] = useState({ x: 400, y: 300 });
  const [qrPosition, setQrPosition] = useState({ x: 50, y: 50 });
  const [credPosition, setCredPosition] = useState({ x: 50, y: 150 });

  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [fontColor, setFontColor] = useState("#000000");

  const [qrSize, setQrSize] = useState(100);
  const [credSize, setCredSize] = useState(14);
  const [qrPreviewUrl, setQrPreviewUrl] = useState("");
  const [showCredential, setShowCredential] = useState(true);
  const [placeMode, setPlaceMode] = useState("text");

  const canvasRef = useRef(null);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    } finally {
      clearSession();
      window.location.href = "/login";
    }
  };

  const centerElement = (type, axis = "x") => {
    if (!templateImage) return;
    if (axis === "x") {
      const centerX = templateImage.width / 2;
      if (type === "text") setTextPosition((prev) => ({ ...prev, x: centerX }));
      if (type === "qr")
        setQrPosition((prev) => ({ ...prev, x: centerX - qrSize / 2 }));
      if (type === "cred") setCredPosition((prev) => ({ ...prev, x: centerX }));
    } else {
      const centerY = templateImage.height / 2;
      if (type === "text") setTextPosition((prev) => ({ ...prev, y: centerY }));
      if (type === "qr")
        setQrPosition((prev) => ({ ...prev, y: centerY - qrSize / 2 }));
      if (type === "cred") setCredPosition((prev) => ({ ...prev, y: centerY }));
    }
  };

  // Handle template upload
  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setTemplateImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Live QR Code Generation for preview
  useEffect(() => {
    const generatePreviewQR = async () => {
      try {
        const url = await QRCode.toDataURL(`${PORTAL_URL}/verify/SAMPLE`, {
          width: qrSize,
          margin: 1,
        });
        setQrPreviewUrl(url);
      } catch (err) {
        console.error("QR Generation Error", err);
      }
    };
    generatePreviewQR();
  }, [qrSize]);

  // Handle CSV upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.map(readRow);

        // Surface bad rows here rather than letting the server reject the whole
        // batch — the admin can fix the CSV before any credential ID is burned.
        const issues = [];
        rows.forEach((r, i) => {
          if (!r.name) issues.push(`Row ${i + 2}: missing name`);
          else if (!r.email) issues.push(`Row ${i + 2}: missing email`);
          else if (!r.teamCode) issues.push(`Row ${i + 2}: missing team code`);
        });

        setCsvData(rows);
        setCsvIssues(issues);
      },
    });
  };

  // Draw canvas for preview
  useEffect(() => {
    if (templateImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = templateImage.width;
      canvas.height = templateImage.height;

      ctx.drawImage(templateImage, 0, 0);

      // Draw sample text
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const displayName =
        inputType === "manual" && manualName ? manualName : "Sample Name";
      ctx.fillText(displayName, textPosition.x, textPosition.y);

      // Draw QR Code
      if (qrPreviewUrl) {
        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.drawImage(qrImg, qrPosition.x, qrPosition.y, qrSize, qrSize);
        };
        qrImg.src = qrPreviewUrl;
      } else {
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(qrPosition.x, qrPosition.y, qrSize, qrSize);
      }

      // Draw Credential ID placeholder — shaped like a real one so the admin can
      // judge whether the space they left is actually wide enough.
      if (showCredential) {
        ctx.fillStyle = fontColor;
        ctx.font = `${credSize}px monospace`;
        ctx.textAlign = "left";
        const sampleTeam =
          (inputType === "manual" ? manualTeamCode : csvData[0]?.teamCode) || "TEAM";
        const yy = String(new Date().getFullYear()).slice(-2);
        ctx.fillText(
          `SQAC-${sampleTeam.toUpperCase()}-${yy}-0001`,
          credPosition.x,
          credPosition.y,
        );
      }
    }
  }, [
    templateImage,
    textPosition,
    qrPosition,
    credPosition,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    fontColor,
    qrSize,
    credSize,
    qrPreviewUrl,
    inputType,
    manualName,
    manualTeamCode,
    csvData,
    showCredential,
  ]);

  /** Render one certificate to a PNG data URL. */
  const renderCertificate = async ({ name, credentialId }) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = templateImage.width;
    canvas.height = templateImage.height;

    ctx.drawImage(templateImage, 0, 0);

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, textPosition.x, textPosition.y);

    if (showCredential) {
      ctx.fillStyle = fontColor;
      ctx.font = `${credSize}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(credentialId, credPosition.x, credPosition.y);
    }

    const qrDataUrl = await QRCode.toDataURL(
      `${PORTAL_URL}/verify/${credentialId}`,
      { width: qrSize, margin: 1 },
    );
    const qrImage = new Image();
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });
    ctx.drawImage(qrImage, qrPosition.x, qrPosition.y, qrSize, qrSize);

    return canvas.toDataURL("image/png");
  };

  /**
   * Post the rendered certificates in size-aware chunks, reporting progress as
   * each one lands. Returns everything that did not make it out.
   */
  const mailCertificates = async (batchId, entries) => {
    const failures = [];
    let sent = 0;

    const chunks = [];
    let current = [];
    let currentBytes = 0;

    for (const entry of entries) {
      const size = entry.imageBase64.length;
      if (
        current.length >= MAX_ITEMS_PER_CHUNK ||
        (current.length > 0 && currentBytes + size > MAX_CHUNK_BYTES)
      ) {
        chunks.push(current);
        current = [];
        currentBytes = 0;
      }
      current.push(entry);
      currentBytes += size;
    }
    if (current.length) chunks.push(current);

    for (const chunk of chunks) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/certificate/send`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batchId, items: chunk }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          // A rejected chunk means none of its recipients were mailed.
          chunk.forEach((c) =>
            failures.push({
              credentialId: c.credentialId,
              name: c.name,
              email: c.email,
              error: data.error || `Request failed (${res.status})`,
            }),
          );
        } else {
          sent += data.sent || 0;
          for (const f of [...(data.failed || []), ...(data.dead || [])]) {
            const match = chunk.find((c) => c.credentialId === f.refId);
            failures.push({
              credentialId: f.refId,
              name: match?.name || "",
              email: f.to,
              error: f.error,
            });
          }
        }
      } catch (err) {
        chunk.forEach((c) =>
          failures.push({
            credentialId: c.credentialId,
            name: c.name,
            email: c.email,
            error: err.message,
          }),
        );
      }

      setProgress((p) => ({
        ...p,
        phase: "mailing",
        done: Math.min((p?.done || 0) + chunk.length, entries.length),
        total: entries.length,
        sent,
        failed: failures.length,
      }));
    }

    return { sent, failures };
  };

  // Generate for all users
  const handleGenerate = async () => {
    const recipients =
      inputType === "manual"
        ? [{ name: manualName.trim(), email: manualEmail.trim(), teamCode: manualTeamCode.trim() }]
        : csvData;

    if (!templateImage) {
      showAlert("Please upload a certificate template first.", "info");
      return;
    }
    if (!templateTitle.trim()) {
      showAlert("Please give the certificate a title.", "info");
      return;
    }
    if (!recipients.length) {
      showAlert("No recipients. Upload a CSV or fill the manual fields.", "info");
      return;
    }
    const bad = recipients.find((r) => !r.name || !r.email || !r.teamCode);
    if (bad) {
      showAlert(
        "Every recipient needs a name, an email and a team code. Check the highlighted rows.",
        "error",
      );
      return;
    }

    setIsGenerating(true);
    setSendReport(null);
    renderedRef.current = new Map();
    setProgress({ phase: "reserving", done: 0, total: recipients.length, sent: 0, failed: 0 });

    try {
      // Phase 1 — reserve credential IDs and write the records. This must come
      // before rendering, because the QR encodes the verification URL and that
      // URL contains the ID the server is about to hand out.
      const res = await fetch(`${API_BASE_URL}/api/certificate/batch`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          type: templateType,
          title: templateTitle.trim(),
          description: templateDescription.trim(),
        }),
      });

      const batch = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = batch.invalid?.length
          ? `\n${batch.invalid.map((i) => `Row ${i.row}: ${i.reason}`).join("\n")}`
          : "";
        throw new Error((batch.error || "Failed to create batch") + detail);
      }

      // Phase 2 — render every certificate in the browser and zip them.
      const zip = new JSZip();
      const entries = [];

      for (let i = 0; i < batch.issued.length; i++) {
        const person = batch.issued[i];
        const dataUrl = await renderCertificate({
          name: person.name,
          credentialId: person.credentialId,
        });

        const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        zip.file(
          `${person.name.replace(/\s+/g, "_")}_${person.credentialId}.png`,
          base64,
          { base64: true },
        );

        const entry = {
          credentialId: person.credentialId,
          name: person.name,
          email: person.email,
          imageBase64: base64,
        };
        entries.push(entry);
        renderedRef.current.set(person.credentialId, entry);

        setProgress({
          phase: "rendering",
          done: i + 1,
          total: batch.issued.length,
          sent: 0,
          failed: 0,
        });
      }

      // Phase 3 — the ZIP. This is the deliverable; it lands before any mail is
      // attempted so a mail failure can never cost the admin the certificates.
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `SQAC_Certificates_${batch.batchId}.zip`);

      // Phase 4 — mail them out.
      setProgress({
        phase: "mailing",
        done: 0,
        total: entries.length,
        sent: 0,
        failed: 0,
      });
      const { sent, failures } = await mailCertificates(batch.batchId, entries);

      setSendReport({
        batchId: batch.batchId,
        total: entries.length,
        sent,
        failures,
      });

      if (failures.length === 0) {
        showAlert(
          `All ${entries.length} certificates generated, downloaded and emailed.`,
          "success",
        );
      }
    } catch (error) {
      console.error(error);
      showAlert("Error generating certificates: " + error.message, "error");
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  /** Re-drive the failed recipients from the last run. */
  const handleResend = async () => {
    if (!sendReport) return;
    setIsResending(true);

    try {
      // Re-post the images we still hold in memory. Going through /send rather
      // than /resend refreshes the server's spooled copy too, so the retry works
      // even if the outbox row had already lost its attachment.
      const entries = sendReport.failures
        .map((f) => renderedRef.current.get(f.credentialId))
        .filter(Boolean);

      let result;
      if (entries.length === sendReport.failures.length && entries.length > 0) {
        result = await mailCertificates(sendReport.batchId, entries);
      } else {
        // Images are gone (page was reloaded) — fall back to the server's spool.
        const res = await fetch(
          `${API_BASE_URL}/api/certificate/batch/${sendReport.batchId}/resend`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credentialIds: sendReport.failures.map((f) => f.credentialId),
            }),
          },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Resend failed");

        result = {
          sent: data.sent || 0,
          failures: [...(data.failed || []), ...(data.dead || [])].map((f) => ({
            credentialId: f.refId,
            email: f.to,
            error: f.error,
          })),
        };
      }

      if (result.failures.length === 0) {
        setSendReport(null);
        showAlert(`All ${result.sent} remaining certificates were sent.`, "success");
      } else {
        setSendReport((prev) => ({
          ...prev,
          sent: prev.sent + result.sent,
          failures: result.failures,
        }));
      }
    } catch (err) {
      showAlert("Resend failed: " + err.message, "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (placeMode === "text") {
      setTextPosition({ x, y });
    } else if (placeMode === "qr") {
      setQrPosition({ x, y });
    } else if (placeMode === "cred") {
      setCredPosition({ x, y });
    }
  };

  const progressLabel = {
    reserving: "Reserving credential IDs…",
    rendering: "Rendering certificates…",
    mailing: "Sending emails…",
  };

  return (
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] font-body flex flex-col">
      <Navbar />
      <AdminSidebar onLogout={handleLogout} />
      <div className="max-w-7xl w-full mx-auto px-5 pb-16 pt-8 md:px-8 lg:pl-28">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f183ff] to-[#ff6c95]">
            Certificate Generator
          </h1>
          <Link
            to="/admin/certificates/logs"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            Certificate Log
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(155deg,rgba(22,20,31,0.96),rgba(12,11,18,0.9))] shadow-[0_30px_80px_rgba(4,6,20,0.42)] p-6 space-y-6">
            <div>
              <label className="block text-sm font-label text-[#aea9b6] mb-2">
                1. Upload Base Template (Image)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleTemplateUpload}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-[#f183ff] hover:file:bg-primary/30"
              />
            </div>

            <div className="bg-[#070910] p-1 rounded-xl flex mb-4">
              <button
                onClick={() => setInputType("csv")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${inputType === "csv" ? "bg-[#f183ff] text-white" : "text-[#aea9b6] hover:text-[#f5eefc]"}`}
              >
                CSV Upload
              </button>
              <button
                onClick={() => setInputType("manual")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${inputType === "manual" ? "bg-[#f183ff] text-white" : "text-[#aea9b6] hover:text-[#f5eefc]"}`}
              >
                Manual Entry
              </button>
            </div>

            {inputType === "csv" ? (
              <div>
                <label className="block text-sm font-label text-[#aea9b6] mb-2">
                  2. Upload CSV (name, email, teamCode)
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-[#f183ff] hover:file:bg-primary/30"
                />
                {csvData.length > 0 && csvIssues.length === 0 && (
                  <p className="text-xs text-green-400 mt-2">
                    Loaded {csvData.length} records
                  </p>
                )}
                {csvIssues.length > 0 && (
                  <div className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 p-2.5">
                    <p className="text-xs font-bold text-amber-300">
                      {csvIssues.length} row(s) need fixing
                    </p>
                    <ul className="mt-1 max-h-24 space-y-0.5 overflow-y-auto text-[11px] text-amber-200/80">
                      {csvIssues.slice(0, 8).map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-2 text-[11px] text-[#78737f]">
                  Credential IDs are assigned by the server from the team code —
                  don&apos;t include an id column.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-label text-[#aea9b6] mb-1">
                  2. Recipient Details
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-[#070910] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full bg-[#070910] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none"
                />
                <input
                  type="text"
                  placeholder="Team Code (e.g. TECH)"
                  value={manualTeamCode}
                  onChange={(e) => setManualTeamCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#070910] border border-white/10 rounded-xl p-3 text-sm uppercase focus:border-[#f183ff] outline-none"
                />
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-sm font-label text-[#aea9b6]">
                3. Certificate Details
              </label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full bg-[#070910] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none"
              >
                <option value="participation">Participation</option>
                <option value="completion">Completion</option>
                <option value="appreciation">Appreciation</option>
                <option value="custom">Custom</option>
              </select>
              <input
                type="text"
                placeholder="Title (e.g. Hackathon Winner)"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                className="w-full bg-[#070910] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none"
              />
              <input
                type="text"
                placeholder="Description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                className="w-full bg-[#070910] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-label text-[#aea9b6]">
                4. Font Styling
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full bg-[#070910] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                </select>
                <input
                  type="number"
                  placeholder="Size"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full bg-[#070910] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFontWeight((prev) =>
                      prev === "bold" ? "normal" : "bold",
                    )
                  }
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${fontWeight === "bold" ? "bg-[#f183ff] text-white" : "bg-[#070910] text-[#aea9b6]"}`}
                >
                  Bold
                </button>
                <button
                  onClick={() =>
                    setFontStyle((prev) =>
                      prev === "italic" ? "normal" : "italic",
                    )
                  }
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${fontStyle === "italic" ? "bg-[#f183ff] text-white" : "bg-[#070910] text-[#aea9b6]"}`}
                >
                  Italic
                </button>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-12 h-10 bg-transparent rounded cursor-pointer border-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-label text-[#aea9b6]">
                5. Placement &amp; Sizing
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPlaceMode("text")}
                  className={`flex items-center gap-2 text-xs p-2 rounded-lg border transition-all ${placeMode === "text" ? "border-[#f183ff] bg-[#f183ff]/10 text-[#f183ff]" : "border-white/5 bg-[#070910]"}`}
                >
                  Name
                </button>
                <button
                  onClick={() => setPlaceMode("qr")}
                  className={`flex items-center gap-2 text-xs p-2 rounded-lg border transition-all ${placeMode === "qr" ? "border-[#f183ff] bg-[#f183ff]/10 text-[#f183ff]" : "border-white/5 bg-[#070910]"}`}
                >
                  QR Code
                </button>
                <button
                  onClick={() => setPlaceMode("cred")}
                  className={`flex items-center gap-2 text-xs p-2 rounded-lg border transition-all ${placeMode === "cred" ? "border-[#f183ff] bg-[#f183ff]/10 text-[#f183ff]" : "border-white/5 bg-[#070910]"}`}
                >
                  Cred ID
                </button>
                <button
                  onClick={() => setShowCredential(!showCredential)}
                  className={`flex items-center gap-2 text-xs p-2 rounded-lg border transition-all ${showCredential ? "border-green-500 bg-green-500/10 text-green-500" : "border-white/5 bg-[#070910]"}`}
                >
                  {showCredential ? "Show ID" : "Hide ID"}
                </button>
              </div>

              {/* Dynamic Sizing Control */}
              <div className="bg-[#070910] p-3 rounded-xl border border-white/5 space-y-3">
                {placeMode === "qr" && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-[#aea9b6]">
                        QR Size
                      </span>
                      <span className="text-[10px] font-bold">{qrSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="400"
                      value={qrSize}
                      onChange={(e) => setQrSize(Number(e.target.value))}
                      className="w-full h-1 accent-[#f183ff]"
                    />
                  </div>
                )}
                {placeMode === "cred" && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-[#aea9b6]">
                        ID Size
                      </span>
                      <span className="text-[10px] font-bold">
                        {credSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="48"
                      value={credSize}
                      onChange={(e) => setCredSize(Number(e.target.value))}
                      className="w-full h-1 accent-[#f183ff]"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => centerElement(placeMode, "x")}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold transition-colors"
                  >
                    Center X
                  </button>
                  <button
                    onClick={() => centerElement(placeMode, "y")}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold transition-colors"
                  >
                    Center Y
                  </button>
                </div>
              </div>
            </div>

            {progress && (
              <div className="rounded-xl border border-[#f183ff]/25 bg-[#f183ff]/5 p-3">
                <div className="flex justify-between text-xs font-semibold text-[#f183ff]">
                  <span>{progressLabel[progress.phase]}</span>
                  <span>
                    {progress.done} / {progress.total}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#f183ff] to-[#ff6c95] transition-[width] duration-300"
                    style={{
                      width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                {progress.phase === "mailing" && (
                  <p className="mt-2 text-[11px] text-white/60">
                    {progress.sent} accepted
                    {progress.failed > 0 && (
                      <span className="text-red-300"> · {progress.failed} failed</span>
                    )}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                !templateImage ||
                !templateTitle.trim() ||
                (inputType === "csv" && (csvData.length === 0 || csvIssues.length > 0)) ||
                (inputType === "manual" && (!manualName || !manualEmail || !manualTeamCode))
              }
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-white font-bold disabled:opacity-50 hover:scale-105 transition-transform disabled:hover:scale-100"
            >
              {isGenerating ? "Working…" : "Generate, Download & Email"}
            </button>
            <p className="text-center text-[11px] text-[#78737f]">
              The ZIP downloads before any email is sent, so a mail failure never
              costs you the certificates.
            </p>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(155deg,rgba(22,20,31,0.96),rgba(12,11,18,0.9))] shadow-[0_30px_80px_rgba(4,6,20,0.42)] p-6 flex flex-col items-center justify-center overflow-auto">
            {!templateImage ? (
              <div className="text-[#78737f] text-center">
                <span className="material-symbols-outlined text-4xl mb-2 block">
                  image
                </span>
                <p>Upload a template to start</p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full h-auto cursor-crosshair border border-white/20 rounded shadow-2xl"
              />
            )}
          </div>
        </div>
      </div>

      {/* Resend prompt — shown automatically whenever a run leaves mail undelivered */}
      {sendReport && sendReport.failures.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0c0f1a] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-lg w-full animate-scale-up">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
              <span className="material-symbols-outlined text-2xl">outbox</span>
            </div>
            <h3 className="text-center text-lg font-bold text-white font-headline">
              {sendReport.failures.length} email
              {sendReport.failures.length === 1 ? "" : "s"} didn&apos;t go out
            </h3>
            <p className="mt-1 text-center text-sm text-white/60">
              {sendReport.sent} of {sendReport.total} were accepted by the mail
              server. The certificates themselves are safe in your ZIP — only the
              delivery failed.
            </p>

            <div className="mt-4 max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-[#070910]">
              {sendReport.failures.map((f) => (
                <div
                  key={f.credentialId}
                  className="border-b border-white/5 px-3 py-2.5 last:border-b-0"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm text-white/90">{f.email}</span>
                    <span className="shrink-0 font-mono text-[10px] text-[#f183ff]">
                      {f.credentialId}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-red-300/80">
                    {f.error}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setSendReport(null)}
                disabled={isResending}
                className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-bold text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Later
              </button>
              <button
                onClick={handleResend}
                disabled={isResending}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#ff6c95] py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isResending ? "Resending…" : "Resend these"}
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#78737f]">
              You can also retry later from the{" "}
              <Link to="/admin/certificates/logs" className="text-[#81ecff] underline">
                Certificate Log
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {/* Generic Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0c0f1a] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-scale-up text-center">
            <div className={`mx-auto w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
              alertModal.type === 'error' ? 'bg-red-500/20 text-red-400' :
              alertModal.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-[#f183ff]/20 text-[#f183ff]'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {alertModal.type === 'error' ? 'error' : alertModal.type === 'success' ? 'check_circle' : 'info'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-headline">
              {alertModal.type === 'error' ? 'Error' : alertModal.type === 'success' ? 'Success' : 'Notice'}
            </h3>
            <p className="text-white/60 text-sm mb-6 whitespace-pre-line">{alertModal.message}</p>
            <button
              onClick={() => setAlertModal({ isOpen: false, message: "", type: "info" })}
              className="w-full py-3 rounded-xl bg-white/5 text-white/90 hover:bg-white/10 transition-all text-sm font-bold"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
