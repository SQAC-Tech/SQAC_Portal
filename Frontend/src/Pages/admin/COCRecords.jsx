import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AppShell from "../../components/common/layout/AppShell";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function COCRecords() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/coc/records`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load records.");
        setRecords(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.fullName?.toLowerCase().includes(q) ||
      r.memberId?.toLowerCase().includes(q)
    );
  });

  // Downloads all PDFs sequentially
  const downloadAll = async () => {
    if (filtered.length === 0) return;
    setDownloadingAll(true);
    let failed = 0;
    for (const rec of filtered) {
      try {
        const res = await fetch(`${API}/api/coc/records/${rec.userId}/pdf`, { credentials: "include" });
        if (!res.ok) { failed++; continue; }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${rec.memberId || rec.fullName}-signed-coc.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        // small gap so browser doesn't block multiple rapid downloads
        await new Promise((r) => setTimeout(r, 400));
      } catch {
        failed++;
      }
    }
    setDownloadingAll(false);
    if (failed > 0) toast.error(`${failed} file(s) failed to download.`);
    else toast.success(`Downloaded ${filtered.length} PDF(s).`);
  };

  // Fetches PDF with auth then opens the blob in a new tab
  const viewPdf = async (userId) => {
    setViewing(userId);
    try {
      const res = await fetch(`${API}/api/coc/records/${userId}/pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load PDF.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      // revoke after a short delay so the new tab has time to load it
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setViewing(null);
    }
  };

  // Fetches the PDF blob and triggers a file download
  const downloadPdf = async (userId, memberId, fullName) => {
    setDownloading(userId);
    try {
      const res = await fetch(`${API}/api/coc/records/${userId}/pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Download failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${memberId || fullName}-signed-coc.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading(null);
    }
  };

  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <AppShell maxWidth="max-w-[1200px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-[#f183ff]">verified_user</span>
            <h1 className="text-2xl font-bold">COC Acceptance Records</h1>
          </div>
          <p className="text-[#aea9b6] text-sm">
            Members who have signed the Code of Conduct —{" "}
            <span className="text-white font-medium">{records.length}</span> total
          </p>
        </div>

        {/* Search + actions */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#aea9b6] text-[18px]">
              search
            </span>
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white placeholder-[#aea9b6]/60 focus:outline-none focus:border-[#f183ff]/40 transition-colors"
              placeholder="Search by name or member ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <span className="text-[#aea9b6] text-sm shrink-0">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
          <div className="ml-auto">
            <button
              onClick={downloadAll}
              disabled={downloadingAll || filtered.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-sm font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                {downloadingAll ? "hourglass_top" : "download_for_offline"}
              </span>
              {downloadingAll ? "Downloading…" : `Download All (${filtered.length})`}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(155deg,rgba(22,20,31,0.96),rgba(12,11,18,0.9))] shadow-[0_30px_80px_rgba(4,6,20,0.42)]">
          {loading ? (
            <div className="p-8 text-center text-[#aea9b6] text-sm animate-pulse">
              Loading records…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-[#aea9b6] text-5xl mb-3 block">
                inbox
              </span>
              <p className="text-[#aea9b6] text-sm">
                {search ? "No matching records." : "No COC acceptances yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[#aea9b6] text-xs uppercase tracking-[0.1em]">
                  <th className="px-5 py-4 text-left font-medium">#</th>
                  <th className="px-5 py-4 text-left font-medium">Name</th>
                  <th className="px-5 py-4 text-left font-medium">Member ID</th>
                  <th className="px-5 py-4 text-left font-medium">Accepted On</th>
                  <th className="px-5 py-4 text-left font-medium">Version</th>
                  <th className="px-5 py-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec, i) => (
                  <tr
                    key={rec._id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[#aea9b6]">{i + 1}</td>
                    <td className="px-5 py-3.5 font-medium text-white">{rec.fullName}</td>
                    <td className="px-5 py-3.5 text-[#aea9b6] font-mono text-xs">
                      {rec.memberId}
                    </td>
                    <td className="px-5 py-3.5 text-[#aea9b6]">{fmt(rec.acceptedAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#f183ff]/10 border border-[#f183ff]/20 text-[#f183ff] text-xs font-mono">
                        {rec.cocVersion}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {/* View in browser */}
                        <button
                          onClick={() => viewPdf(rec.userId)}
                          disabled={viewing === rec.userId}
                          title="View PDF"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#81ecff]/10 border border-[#81ecff]/20 text-[#81ecff] text-xs font-medium hover:bg-[#81ecff]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {viewing === rec.userId ? "hourglass_top" : "open_in_new"}
                          </span>
                          {viewing === rec.userId ? "…" : "View"}
                        </button>

                        {/* Download to disk */}
                        <button
                          onClick={() => downloadPdf(rec.userId, rec.memberId, rec.fullName)}
                          disabled={downloading === rec.userId}
                          title="Download PDF"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {downloading === rec.userId ? "hourglass_top" : "download"}
                          </span>
                          {downloading === rec.userId ? "…" : "Download"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Footer hint */}
        {records.length > 0 && (
          <p className="mt-4 text-xs text-[#aea9b6] text-center">
            Download signed PDFs and upload them to Google Drive manually for archival.
          </p>
        )}
    </AppShell>
  );
}
