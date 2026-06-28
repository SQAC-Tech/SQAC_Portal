import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { exportMOMtoPDF } from "../../utils/momPdfExport";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const roleOrder = { admin: 0, subadmin: 1, lead: 2, user: 3 };

export default function MOMList() {
  const [moms, setMoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // MOM detail modal
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  // Detect admin context so links stay within admin section
  const isAdminCtx = location.pathname.startsWith("/admin");
  const createPath = isAdminCtx ? "/admin/mom/create" : "/mom/create";

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Decode role from token payload
  const userRole = (() => {
    try {
      return JSON.parse(atob(token.split(".")[1])).role || "user";
    } catch {
      return "user";
    }
  })();
  const isPrivileged = ["admin", "subadmin"].includes(userRole);

  useEffect(() => {
    fetchMOMs();
  }, []);

  const fetchMOMs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/mom/all`, {
        headers,
        withCredentials: true,
      });
      setMoms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch MOMs error:", err);
      setMoms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/mom/${deleteId}`, {
        headers,
        withCredentials: true,
      });
      setMoms((prev) => prev.filter((m) => m._id !== deleteId));
      setDeleteId(null);
      if (selected?._id === deleteId) setSelected(null);
    } catch (err) {
      console.error("Delete MOM error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handlePDF = async (mom) => {
    setPdfLoading(mom._id);
    try {
      await exportMOMtoPDF(mom);
    } catch (e) {
      console.error("PDF error:", e);
    } finally {
      setPdfLoading(null);
    }
  };

  const filtered = moms.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.title?.toLowerCase().includes(q) ||
      m.createdBy?.name?.toLowerCase().includes(q) ||
      m.teamScope?.toLowerCase().includes(q)
    );
  });

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className={isAdminCtx ? "text-[#f5eefc]" : "min-h-screen bg-[#070910] text-[#f5eefc]"}>
      {/* Header */}
      <div className={`sticky z-40 bg-[#070910]/90 backdrop-blur-md border-b border-[#494651]/40 px-6 py-4 ${isAdminCtx ? "top-16" : "top-0"}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg border border-[#494651] flex items-center justify-center text-[#aea9b6] hover:border-[#f183ff]/40 hover:text-[#f183ff] transition-all"
            >
              ←
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#f5eefc]">MOM History</h1>
              <p className="text-xs text-[#aea9b6]">
                {moms.length} record{moms.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(createPath)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            + New MOM
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search MOMs by title, author or scope…"
          className="w-full bg-[#0c0f1a] border border-[#494651] rounded-xl px-4 py-3 text-sm text-[#f5eefc]
            placeholder-[#494651] focus:outline-none focus:border-[#f183ff] focus:ring-1 focus:ring-[#f183ff]/30 transition-all mb-6"
        />

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#f183ff] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl opacity-30">📋</div>
            <p className="text-[#aea9b6]">
              {search
                ? "No MOMs match your search."
                : "No MOMs yet. Create your first one!"}
            </p>
            {!search && (
              <button
                onClick={() => navigate(createPath)}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-white text-sm font-semibold hover:opacity-90 transition-all"
              >
                Create MOM
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((mom) => (
              <div
                key={mom._id}
                className="group relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(155deg,rgba(22,20,31,0.96),rgba(12,11,18,0.9))] shadow-[0_30px_80px_rgba(4,6,20,0.42)]
                  hover:border-[#f183ff]/30 hover:-translate-y-1 transition-all cursor-pointer"
                onClick={() => setSelected(mom)}
              >
                {/* Top accent */}
                <div className="h-1 bg-gradient-to-r from-[#f183ff] to-[#ff6c95]" />

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[#f5eefc] text-sm leading-snug line-clamp-2 flex-1">
                      {mom.title}
                    </h3>
                    {mom.aiGenerated && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#81ecff]/10 border border-[#81ecff]/20 text-[9px] text-[#81ecff]">
                        ✨ AI
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/20 text-[#f183ff]">
                      {fmtDate(mom.date)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#494651]/40 text-[#aea9b6]">
                      {(mom.teamScope || "all").replace(/^\w/, (c) =>
                        c.toUpperCase(),
                      )}
                    </span>
                    {mom.attendees?.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#494651]/40 text-[#aea9b6]">
                        {mom.attendees.length} attendee
                        {mom.attendees.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {mom.description && (
                    <p className="text-xs text-[#aea9b6] line-clamp-2">
                      {mom.description}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="flex gap-3 text-[10px] text-[#78737f]">
                    <span>{mom.discussedPoints?.length || 0} points</span>
                    <span>·</span>
                    <span>{mom.decisions?.length || 0} decisions</span>
                    <span>·</span>
                    <span>{mom.actionItems?.length || 0} actions</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#494651]/40">
                    <span className="text-[10px] text-[#78737f]">
                      by {mom.createdBy?.name || "Unknown"}
                    </span>
                    <div
                      className="flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handlePDF(mom)}
                        disabled={pdfLoading === mom._id}
                        className="p-1.5 rounded text-[#aea9b6] hover:text-[#f183ff] hover:bg-[#f183ff]/10 transition-all text-xs"
                        title="Export PDF"
                      >
                        {pdfLoading === mom._id ? "…" : "📄"}
                      </button>
                      <button
                        onClick={() => navigate(`${createPath}?id=${mom._id}`)}
                        className="p-1.5 rounded text-[#aea9b6] hover:text-[#81ecff] hover:bg-[#81ecff]/10 transition-all text-xs"
                        title="Edit"
                      >
                        ✎
                      </button>
                      {isPrivileged && (
                        <button
                          onClick={() => setDeleteId(mom._id)}
                          className="p-1.5 rounded text-[#aea9b6] hover:text-[#ff6e84] hover:bg-[#ff6e84]/10 transition-all text-xs"
                          title="Delete"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#494651]/60 bg-[#0c0f1a]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header gradient */}
            <div className="h-1.5 bg-gradient-to-r from-[#f183ff] via-[#81ecff] to-[#ff6c95] rounded-t-2xl" />

            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#f5eefc]">
                    {selected.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-[#aea9b6]">
                      {fmtDate(selected.date)}
                    </span>
                    {selected.startTime && (
                      <>
                        <span className="text-[#494651]">·</span>
                        <span className="text-xs text-[#aea9b6]">
                          {selected.startTime}
                        </span>
                      </>
                    )}
                    {selected.duration && (
                      <>
                        <span className="text-[#494651]">·</span>
                        <span className="text-xs text-[#aea9b6]">
                          {selected.duration}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-[#aea9b6] hover:text-[#f5eefc] text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {selected.description && (
                <p className="text-sm text-[#aea9b6] leading-relaxed">
                  {selected.description}
                </p>
              )}

              {selected.attendees?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#f183ff] mb-2">
                    Attendees ({selected.attendees.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.attendees.map((a, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/20 text-xs text-[#f183ff]"
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.discussedPoints?.filter(Boolean).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#81ecff] mb-2">
                    Discussion Points
                  </h4>
                  <ul className="space-y-1.5">
                    {selected.discussedPoints.filter(Boolean).map((pt, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[#f5eefc]">
                        <span className="text-[#f183ff] mt-0.5 shrink-0">
                          •
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.decisions?.filter(Boolean).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#ff6c95] mb-2">
                    Key Decisions
                  </h4>
                  <ul className="space-y-1.5">
                    {selected.decisions.filter(Boolean).map((d, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[#f5eefc]">
                        <span className="w-2 h-2 rounded-full bg-[#ff6c95] mt-1.5 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.actionItems?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#aea9b6] mb-2">
                    Action Items
                  </h4>
                  <div className="rounded-xl overflow-x-auto border border-[#494651]/40">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead className="bg-[#0c0f1a]">
                        <tr>
                          {["Task", "Assignee", "Due Date"].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-[#f183ff]"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.actionItems.map((item, i) => (
                          <tr
                            key={i}
                            className={
                              i % 2 === 0 ? "bg-[#0c0f1a]" : "bg-[#0c0f1a]"
                            }
                          >
                            <td className="px-3 py-2.5 text-[#f5eefc]">
                              {item.task || "—"}
                            </td>
                            <td className="px-3 py-2.5 text-[#aea9b6]">
                              {item.assignee || "—"}
                            </td>
                            <td className="px-3 py-2.5 text-[#aea9b6]">
                              {fmtDate(item.dueDate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(selected.nextMeetDate || selected.nextMeetAgenda) && (
                <div className="p-3 rounded-xl bg-[#0c0f1a] border border-[#81ecff]/20">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#81ecff] mb-2">
                    Next Meeting
                  </h4>
                  {selected.nextMeetDate && (
                    <p className="text-sm text-[#f5eefc]">
                      📅 {fmtDate(selected.nextMeetDate)}
                    </p>
                  )}
                  {selected.nextMeetAgenda && (
                    <p className="text-xs text-[#aea9b6] mt-1">
                      {selected.nextMeetAgenda}
                    </p>
                  )}
                </div>
              )}

              {/* Modal actions */}
              <div className="flex gap-2 pt-2 border-t border-[#494651]/40">
                <button
                  onClick={() => handlePDF(selected)}
                  disabled={pdfLoading === selected._id}
                  className="flex-1 py-2.5 rounded-lg border border-[#494651] text-sm text-[#aea9b6] hover:border-[#f183ff]/40 hover:text-[#f183ff] transition-all"
                >
                  {pdfLoading === selected._id
                    ? "Generating…"
                    : "📄 Export PDF"}
                </button>
                {isPrivileged && (
                  <button
                    onClick={() => {
                      setDeleteId(selected._id);
                      setSelected(null);
                    }}
                    className="px-4 py-2.5 rounded-lg border border-[#ff6e84]/30 text-sm text-[#ff6e84] hover:bg-[#ff6e84]/10 transition-all"
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Dialog ─────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#ff6e84]/40 bg-[#0c0f1a] p-6 space-y-4">
            <div className="text-4xl text-center">⚠️</div>
            <h3 className="text-center font-bold text-[#f5eefc]">
              Delete this MOM?
            </h3>
            <p className="text-sm text-center text-[#aea9b6]">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-lg border border-[#494651] text-sm text-[#aea9b6] hover:border-[#f183ff]/40 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-[#ff6e84] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
