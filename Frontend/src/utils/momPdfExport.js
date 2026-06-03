/**
 * momPdfExport.js
 * Generates a themed SQAC MOM PDF using jsPDF.
 * Color palette matches the app: deep dark background + purple/pink accents.
 */

import jsPDF from "jspdf";

// Theme colors (RGB) - SQAC Dark Theme
const C = {
  bg: [15, 13, 22],          // #0f0d16
  surface: [27, 24, 35],     // #1b1823
  surfaceHigh: [33, 30, 42], // #211e2a
  primary: [241, 131, 255],  // #f183ff
  secondary: [255, 108, 149],// #ff6c95
  tertiary: [129, 236, 255], // #81ecff
  text: [245, 238, 252],     // #f5eefc
  textMuted: [174, 169, 182],// #aea9b6
  outline: [120, 115, 127],  // #78737f
  white: [255, 255, 255],
};

/** Convert a Date (or date-string) to a readable string */
function fmtDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return String(val);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** Draw a filled rectangle (helper) */
function rect(doc, x, y, w, h, color) {
  doc.setFillColor(...color);
  doc.rect(x, y, w, h, "F");
}

/** Draw a horizontal rule */
function hRule(doc, x, y, w, color = C.outline, thickness = 0.4) {
  doc.setDrawColor(...color);
  doc.setLineWidth(thickness);
  doc.line(x, y, x + w, y);
}

/** Write wrapped text and return final Y position */
function wrappedText(doc, text, x, y, maxW, lineHeight = 5.5) {
  const lines = doc.splitTextToSize(String(text || ""), maxW);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

/** Draw a section header bar */
function sectionHeader(doc, label, x, y, w) {
  // Gradient-ish effect with two layered rects
  rect(doc, x, y, w, 8, C.surfaceHigh);
  doc.setFillColor(...C.primary);
  doc.rect(x, y, 3, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.primary);
  doc.text(label.toUpperCase(), x + 7, y + 5.5);
  return y + 11;
}

/** Draw a pill badge */
function badge(doc, label, x, y) {
  const tw = doc.getStringUnitWidth(label) * 7 + 6;
  rect(doc, x, y - 4, tw, 6, C.surface);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.tertiary);
  doc.text(label, x + 3, y);
  return x + tw + 3;
}

/**
 * Main export function.
 * @param {object} mom  - MOM data object from state
 * @param {string} logoBase64 - base64 data URL of the SQAC logo image
 */
export async function exportMOMtoPDF(mom, logoBase64) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const PW = 210; // page width
  const PH = 297; // page height
  const ML = 14;  // margin left
  const MR = 14;  // margin right
  const CW = PW - ML - MR; // content width

  let curY = 0;

  // ── HEADER BANNER ─────────────────────────────────────────────────────────
  // Fill entire first page background
  rect(doc, 0, 0, PW, PH, C.bg);
  // top accent stripe
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, PW, 1.5, "F");
  // secondary accent
  doc.setFillColor(...C.secondary);
  doc.rect(0, 1.5, PW, 0.8, "F");

  // SQAC Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", ML, 6, 22, 22);
    } catch (_) { /* skip if image fails */ }
  }

  // Club title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.primary);
  doc.text("SQAC Portal", ML + 26, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.textMuted);
  doc.text("Software Quality Assurance Community", ML + 26, 22);

  // "Minutes of Meeting" label — right side
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.secondary);
  doc.text("MINUTES OF MEETING", PW - MR, 14, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textMuted);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, PW - MR, 20, { align: "right" });

  hRule(doc, 0, 38, PW, C.outline, 0.6);
  curY = 44;

  // ── MEETING TITLE ──────────────────────────────────────────────────────────
  rect(doc, ML, curY, CW, 14, C.surface);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...C.text);
  doc.text(mom.title || "Untitled Meeting", ML + 5, curY + 9.5);
  curY += 17;

  // ── META ROW ──────────────────────────────────────────────────────────────
  const metaItems = [
    { label: "Date", value: fmtDate(mom.date) },
    { label: "Time", value: mom.startTime || "—" },
    { label: "Duration", value: mom.duration || "—" },
    { label: "Scope", value: (mom.teamScope || "All").replace(/^\w/, c => c.toUpperCase()) },
  ];

  const colW = CW / metaItems.length;
  metaItems.forEach((item, i) => {
    const cx = ML + i * colW;
    rect(doc, cx, curY, colW - 1, 14, C.surfaceHigh);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textMuted);
    doc.text(item.label.toUpperCase(), cx + 3, curY + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.text);
    doc.text(item.value, cx + 3, curY + 11);
  });
  curY += 18;

  // ── DESCRIPTION ───────────────────────────────────────────────────────────
  if (mom.description) {
    curY = sectionHeader(doc, "Overview", ML, curY, CW);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textMuted);
    curY = wrappedText(doc, mom.description, ML, curY, CW, 5.5);
    curY += 5;
  }

  // ── ATTENDEES ─────────────────────────────────────────────────────────────
  if (mom.attendees?.length > 0) {
    curY = sectionHeader(doc, `Attendees (${mom.attendees.length})`, ML, curY, CW);
    const aCols = 3;
    const aColW = CW / aCols;
    mom.attendees.forEach((a, i) => {
      const col = i % aCols;
      const row = Math.floor(i / aCols);
      const ax = ML + col * aColW;
      const ay = curY + row * 12;

      rect(doc, ax, ay, aColW - 2, 11, C.surface);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.text);
      doc.text(a.name || "Unknown", ax + 3, ay + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(...C.textMuted);
      doc.text(`${a.role || "member"} · ${a.coreDomain || ""}`, ax + 3, ay + 9);
    });
    const rows = Math.ceil(mom.attendees.length / aCols);
    curY += rows * 12 + 5;
  }

  // ── PAGE BREAK CHECK helper ────────────────────────────────────────────────
  const checkPageBreak = (needed = 30) => {
    if (curY + needed > PH - 20) {
      doc.addPage();
      rect(doc, 0, 0, PW, PH, C.bg);
      curY = 14;
    }
  };

  // ── DISCUSSED POINTS ──────────────────────────────────────────────────────
  if (mom.discussedPoints?.length > 0) {
    checkPageBreak(40);
    curY = sectionHeader(doc, "Discussion Points", ML, curY, CW);
    mom.discussedPoints.forEach((pt, i) => {
      checkPageBreak(14);
      rect(doc, ML, curY, CW, 1, C.surface); // thin divider between items
      doc.setFillColor(...C.primary);
      doc.circle(ML + 2.5, curY + 3, 1, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.text);
      curY = wrappedText(doc, pt, ML + 7, curY + 3.5, CW - 8, 5.5);
      curY += 3;
    });
    curY += 4;
  }

  // ── DECISIONS ─────────────────────────────────────────────────────────────
  if (mom.decisions?.length > 0) {
    checkPageBreak(40);
    curY = sectionHeader(doc, "Key Decisions", ML, curY, CW);
    mom.decisions.forEach((d) => {
      checkPageBreak(14);
      doc.setFillColor(...C.secondary);
      doc.rect(ML, curY, 2.5, 5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.text);
      curY = wrappedText(doc, d, ML + 6, curY + 3.5, CW - 7, 5.5);
      curY += 3;
    });
    curY += 4;
  }

  // ── ACTION ITEMS TABLE ────────────────────────────────────────────────────
  if (mom.actionItems?.length > 0) {
    checkPageBreak(50);
    curY = sectionHeader(doc, "Action Items", ML, curY, CW);

    // Table header
    const tCols = [CW * 0.5, CW * 0.28, CW * 0.22];
    const tHeaders = ["Task", "Assignee", "Due Date"];
    rect(doc, ML, curY, CW, 8, C.surface);
    let tx = ML;
    tHeaders.forEach((h, i) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...C.primary);
      doc.text(h, tx + 3, curY + 5.5);
      tx += tCols[i];
    });
    curY += 8;

    mom.actionItems.forEach((item, idx) => {
      checkPageBreak(12);
      const rowBg = idx % 2 === 0 ? C.bg : C.surfaceHigh;
      rect(doc, ML, curY, CW, 9, rowBg);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.text);

      let tx2 = ML;
      const rowData = [
        item.task || "",
        item.assignee || "—",
        fmtDate(item.dueDate),
      ];
      rowData.forEach((val, i) => {
        const lines = doc.splitTextToSize(val, tCols[i] - 4);
        doc.text(lines[0] || "", tx2 + 3, curY + 5.5);
        tx2 += tCols[i];
      });
      curY += 9;
    });
    curY += 5;
  }

  // ── NEXT MEETING ──────────────────────────────────────────────────────────
  if (mom.nextMeetDate || mom.nextMeetAgenda) {
    checkPageBreak(30);
    curY = sectionHeader(doc, "Next Meeting", ML, curY, CW);
    rect(doc, ML, curY, CW, 18, C.surface);
    doc.setFillColor(...C.tertiary);
    doc.rect(ML, curY, 3, 18, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.tertiary);
    doc.text("Scheduled:", ML + 7, curY + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.text);
    doc.text(fmtDate(mom.nextMeetDate), ML + 30, curY + 6);

    if (mom.nextMeetAgenda) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      doc.text("Agenda:", ML + 7, curY + 13);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.text);
      const aLines = doc.splitTextToSize(mom.nextMeetAgenda, CW - 36);
      doc.text(aLines[0] || "", ML + 25, curY + 13);
    }
    curY += 22;
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    hRule(doc, 0, PH - 14, PW, C.outline, 0.4);
    rect(doc, 0, PH - 13.5, PW, 13.5, C.bg);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textMuted);
    doc.text("SQAC Portal — Confidential | Minutes of Meeting", ML, PH - 6);
    doc.text(`Page ${p} of ${totalPages}`, PW - MR, PH - 6, { align: "right" });
  }

  // ── BACKGROUND fill all pages ─────────────────────────────────────────────
  // Do a final pass to ensure background is set on all pages
  // (jsPDF doesn't fill background by default — we only need to ensure
  //  added pages have their bg rect at the top of each page build)

  const filename = `MOM_${(mom.title || "meeting").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Load the SQAC logo as a base64 data URL for embedding in the PDF.
 * @returns {Promise<string>}
 */
export async function loadLogoBase64() {
  try {
    const resp = await fetch("/sqac-logo.png");
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
