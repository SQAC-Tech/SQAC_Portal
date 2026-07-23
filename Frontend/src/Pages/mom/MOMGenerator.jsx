import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { exportMOMtoPDF } from "../../utils/momPdfExport";
import Navbar from "../../components/common/layout/Navbar";
import { usePermissions } from "../../utils/usePermissions";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const SCOPES = [
  { value: "all", label: "All Members" },
  { value: "technical", label: "Full Technical" },
  { value: "corporate", label: "Full Corporate" },
  { value: "Web Development", label: "Web Development" },
  { value: "AI/ML", label: "AI / ML" },
  { value: "Events", label: "Events" },
  { value: "Media", label: "Media" },
  { value: "Public Relations", label: "Public Relations" },
  { value: "Sponsorships", label: "Sponsorships" },
  { value: "Creatives", label: "Creatives" },
];

const defaultMOM = {
  title: "",
  description: "",
  meetingRef: "",
  date: new Date().toISOString().slice(0, 10),
  startTime: "",
  duration: "",
  teamScope: "all",
  attendees: [],
  discussedPoints: [""],
  decisions: [""],
  actionItems: [],
  nextMeetDate: "",
  nextMeetAgenda: "",
  aiGenerated: false,
  rawPrompt: "",
};

// Returns true only for YYYY-MM-DD strings that parse to a real date
const isValidDateStr = (s) =>
  typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !isNaN(new Date(s).getTime());

/* ── Reusable primitives ─────────────────────────────────────────── */
const Label = ({ children, required }) => (
  <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#aea9b6] mb-1.5">
    {children}
    {required && <span className="text-[#ff6c95] ml-0.5">*</span>}
  </label>
);

const FIELD =
  "w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#f5eefc] placeholder-white/25 focus:outline-none focus:border-[#f183ff]/50 focus:ring-2 focus:ring-[#f183ff]/15 focus:bg-white/[0.05] transition-all disabled:opacity-50";

const Input = ({ className = "", ...props }) => (
  <input {...props} className={`${FIELD} ${className}`} />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea {...props} className={`${FIELD} resize-none ${className}`} />
);

const Select = ({ children, className = "", ...props }) => (
  <select {...props} className={`${FIELD} ${className}`}>
    {children}
  </select>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(155deg,rgba(22,20,31,0.96),rgba(12,11,18,0.9))] shadow-[0_30px_80px_rgba(4,6,20,0.42)] ${className}`}
  >
    {children}
  </div>
);

// Borderless, non-boxy section header — icon chip + title (no filled bar).
const CardHeader = ({ icon, title, badge }) => (
  <div className="flex items-center justify-between px-4 pt-4 pb-1">
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f183ff]/10 border border-[#f183ff]/20 text-sm">
        {icon}
      </span>
      <span className="text-sm font-semibold text-[#f5eefc]">{title}</span>
    </div>
    {badge && (
      <span className="px-2 py-0.5 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/20 text-[10px] text-[#f183ff] font-semibold">
        {badge}
      </span>
    )}
  </div>
);

/* ── Main Component ──────────────────────────────────────────────── */
export default function MOMGenerator({ embedded = false }) {
  const location = useLocation();
  const isAdminCtx = location.pathname.startsWith("/admin");
  // Embedded = rendered inside an AppShell (which already supplies the navbar +
  // sidebar), so we suppress our own navbar and full-screen chrome.
  const embed = isAdminCtx || embedded;
  const [mom, setMom] = useState(defaultMOM);
  const [meetings, setMeetings] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiApplied, setAiApplied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("form");

  const { isBoardMember } = usePermissions();
  // Board scope is only offered to board members.
  const scopes = isBoardMember
    ? [SCOPES[0], { value: "board", label: "Board Members" }, ...SCOPES.slice(1)]
    : SCOPES;

  const scopeInitialized = useRef(false);

  useEffect(() => {
    fetchMeetings();
    fetchMembers("all");
  }, []);

  // Bug fix: skip the first run so initial mount doesn't wipe attendees
  useEffect(() => {
    if (!scopeInitialized.current) {
      scopeInitialized.current = true;
      return;
    }
    fetchMembers(mom.teamScope);
    setMom((prev) => ({ ...prev, attendees: [] }));
  }, [mom.teamScope]);

  useEffect(() => {
    const q = memberSearch.trim().toLowerCase();
    setFilteredMembers(
      q
        ? allMembers.filter(
            (m) =>
              m.name?.toLowerCase().includes(q) ||
              m.email?.toLowerCase().includes(q) ||
              m.coreDomain?.toLowerCase().includes(q),
          )
        : allMembers,
    );
  }, [memberSearch, allMembers]);

  const fetchMeetings = async () => {
    try {
      const { data } = await axios.get(`${API}/meet/getmeet`, {
        withCredentials: true,
      });
      setMeetings(Array.isArray(data) ? data : []);
    } catch {
      setMeetings([]);
    }
  };

  const fetchMembers = async (scope) => {
    try {
      const { data } = await axios.get(`${API}/api/mom/members/approved`, {
        withCredentials: true,
        params: { scope: scope || "all" },
      });
      const list = Array.isArray(data) ? data : [];
      setAllMembers(list);
      setFilteredMembers(list);
    } catch {
      setAllMembers([]);
      setFilteredMembers([]);
    }
  };

  /* ── Field helpers ───────────────────────────────────────────── */
  const set = (field) => (e) =>
    setMom((prev) => ({ ...prev, [field]: e.target.value }));

  const setArr = (field, idx, val) =>
    setMom((prev) => {
      const arr = [...prev[field]];
      arr[idx] = val;
      return { ...prev, [field]: arr };
    });

  const addArr = (field) =>
    setMom((prev) => ({ ...prev, [field]: [...prev[field], ""] }));

  const removeArr = (field, idx) =>
    setMom((prev) => {
      const arr = prev[field].filter((_, i) => i !== idx);
      return { ...prev, [field]: arr.length ? arr : [""] };
    });

  /* ── Meeting selector ────────────────────────────────────────── */
  const handleMeetingSelect = (e) => {
    const id = e.target.value;
    if (!id) {
      setMom((prev) => ({ ...prev, meetingRef: "" }));
      return;
    }
    const meet = meetings.find((m) => m._id === id);
    if (!meet) return;
    // Bug fix: use mom.date (state snapshot) instead of undefined `prev` out of callback
    const dateStr = meet.startDate
      ? new Date(meet.startDate).toISOString().slice(0, 10)
      : mom.date;
    const timeStr = meet.startTime
      ? new Date(meet.startTime).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";
    setMom((prev) => ({
      ...prev,
      meetingRef: id,
      date: dateStr,
      startTime: timeStr,
      title: prev.title || meet.title || "",
      description: prev.description || meet.description || "",
      teamScope: meet.teamScope || prev.teamScope,
    }));
  };

  /* ── Attendees ───────────────────────────────────────────────── */
  const isSelected = (member) =>
    mom.attendees.some((a) => a.userId === member._id);

  const toggleAttendee = (member) => {
    setMom((prev) => {
      if (prev.attendees.some((a) => a.userId === member._id)) {
        return {
          ...prev,
          attendees: prev.attendees.filter((a) => a.userId !== member._id),
        };
      }
      return {
        ...prev,
        attendees: [
          ...prev.attendees,
          {
            userId: member._id,
            name: member.name,
            role: member.role,
            coreDomain: member.coreDomain,
            subDomain: member.subDomain || "",
            email: member.email,
            external: false,
          },
        ],
      };
    });
  };

  // Remove a specific attendee (handles guests with no userId by matching name)
  const removeAttendee = (att) =>
    setMom((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((a) =>
        att.userId ? a.userId !== att.userId : !(a.external && a.name === att.name),
      ),
    }));

  // Add an unregistered guest attendee from the search text
  const addGuestAttendee = (rawName) => {
    const name = rawName.trim();
    if (!name) return;
    setMom((prev) => {
      const exists = prev.attendees.some(
        (a) => a.name.toLowerCase() === name.toLowerCase(),
      );
      if (exists) return prev;
      return {
        ...prev,
        attendees: [
          ...prev.attendees,
          { userId: null, name, role: "Guest", coreDomain: "", subDomain: "", email: "", external: true },
        ],
      };
    });
    setMemberSearch("");
  };

  /* ── Action items ────────────────────────────────────────────── */
  const addActionItem = () =>
    setMom((prev) => ({
      ...prev,
      actionItems: [
        ...prev.actionItems,
        { task: "", assignee: "", dueDate: "" },
      ],
    }));

  const setActionItem = (idx, field, val) =>
    setMom((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((it, i) =>
        i === idx ? { ...it, [field]: val } : it,
      ),
    }));

  const removeActionItem = (idx) =>
    setMom((prev) => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== idx),
    }));

  /* ── AI Generation ───────────────────────────────────────────── */
  const handleAIGenerate = async () => {
    if (aiPrompt.trim().length < 10) return;
    setAiLoading(true);
    setAiError("");
    setAiApplied(false);
    try {
      const { data } = await axios.post(
        `${API}/api/mom/ai-generate`,
        { prompt: aiPrompt },
        { withCredentials: true },
      );
      const d = data.data || {};
      setMom((prev) => ({
        ...prev,
        title: d.title || prev.title,
        description: d.description || prev.description,
        discussedPoints: d.discussedPoints?.length
          ? d.discussedPoints
          : prev.discussedPoints,
        decisions: d.decisions?.length ? d.decisions : prev.decisions,
        // Bug fix: sanitize AI dueDate — only keep proper YYYY-MM-DD strings
        actionItems: d.actionItems?.length
          ? d.actionItems.map((a) => ({
              task: a.task || "",
              assignee: a.assignee || "",
              dueDate: isValidDateStr(a.dueDate) ? a.dueDate : "",
            }))
          : prev.actionItems,
        nextMeetDate: isValidDateStr(d.nextMeetDate)
          ? d.nextMeetDate
          : prev.nextMeetDate,
        nextMeetAgenda: d.nextMeetAgenda || prev.nextMeetAgenda,
        aiGenerated: true,
        rawPrompt: aiPrompt,
      }));
      setAiApplied(true);
      setActiveTab("form");
    } catch (err) {
      setAiError(
        err.response?.data?.message ||
          "AI generation failed. Please try again.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Save ────────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!mom.title.trim() || !mom.date) {
      setSaveError("Title and date are required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      // Bug fix: strip empty strings from arrays; sanitize dates
      const payload = {
        ...mom,
        discussedPoints: mom.discussedPoints.filter((p) => p.trim()),
        decisions: mom.decisions.filter((d) => d.trim()),
        nextMeetDate: isValidDateStr(mom.nextMeetDate)
          ? mom.nextMeetDate
          : null,
        meetingRef: mom.meetingRef || null,
        actionItems: mom.actionItems
          .filter((a) => a.task.trim())
          .map((a) => ({
            ...a,
            dueDate: isValidDateStr(a.dueDate) ? a.dueDate : null,
          })),
      };

      await axios.post(`${API}/api/mom/create`, payload, {
        withCredentials: true,
      });

      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleNewMOM = () => {
    setMom(defaultMOM);
    setAiPrompt("");
    setAiApplied(false);
    setSaveSuccess(false);
    setSaveError("");
    scopeInitialized.current = false;
    setTimeout(() => {
      scopeInitialized.current = true;
    }, 0);
  };

  /* ── PDF Export ──────────────────────────────────────────────── */
  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      await exportMOMtoPDF(mom);
    } catch (e) {
      console.error("PDF export error:", e);
      setSaveError(e.message || "Failed to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  /* ── Success screen ──────────────────────────────────────────── */
  if (saveSuccess) {
    return (
      <div className={embed ? "text-[#f5eefc] font-sans" : "min-h-screen bg-[#070910] text-[#f5eefc] font-sans pt-16"}>
        {!embed && <Navbar />}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#81ecff] to-[#f183ff] flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-[#f5eefc] mb-2">
              MOM Saved!
            </h2>
            <p className="text-[#aea9b6] text-sm mb-8">
              Minutes of Meeting "
              <span className="text-[#f183ff]">{mom.title}</span>" published.
              {mom.attendees.length > 0 &&
                ` ${mom.attendees.length} attendee${mom.attendees.length > 1 ? "s" : ""} will be notified by email.`}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleNewMOM}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-white font-semibold text-sm hover:opacity-90 transition-all"
              >
                Create Another MOM
              </button>
              <button
                onClick={handleExportPDF}
                disabled={pdfLoading}
                className="px-6 py-2.5 rounded-lg border border-[#272c3a] text-[#aea9b6] text-sm hover:border-[#f183ff]/40 hover:text-[#f183ff] transition-all disabled:opacity-50"
              >
                {pdfLoading ? "Exporting…" : "Export PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className={embed ? "text-[#f5eefc] font-sans" : "min-h-screen bg-[#070910] text-[#f5eefc] font-sans"}>
      {!embed && <Navbar />}
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="sticky top-16 z-50 bg-[#070910]/90 backdrop-blur-2xl border-b border-white/8 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-[15px] font-bold text-[#f5eefc] leading-tight">
              MOM Generator
            </h1>
            <p className="text-[11px] text-[#aea9b6]">Minutes of Meeting</p>
          </div>
          {mom.aiGenerated && (
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-[#81ecff]/10 border border-[#81ecff]/20 text-[10px] text-[#81ecff] font-semibold tracking-wide">
              ✨ AI-assisted
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={pdfLoading || !mom.title.trim()}
            className="px-3.5 py-2 rounded-lg border border-[#272c3a] text-xs text-[#aea9b6]
              hover:border-[#f183ff]/40 hover:text-[#f183ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            {pdfLoading ? <Spinner /> : "📄"} PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-white text-sm font-semibold
              hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {saving && <Spinner white />}
            {saving ? "Saving…" : "Save MOM"}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mx-6 mt-3 p-3 rounded-lg bg-[#ff6e84]/8 border border-[#ff6e84]/25 text-sm text-[#ff6e84] flex items-center gap-2">
          <span>✗</span> {saveError}
        </div>
      )}

      {/* ── Mobile tab switcher ──────────────────────────────────── */}
      <div className="flex mx-6 mt-3 p-1 rounded-xl bg-[#0c0f1a] border border-[#1b1f2b] xl:hidden">
        {[
          { id: "form", label: "📝 Form" },
          { id: "ai", label: "✨ AI Assistant" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.id
                ? "bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-white"
                : "text-[#6b6f7d] hover:text-[#aea9b6]"
            }`}
          >
            {t.label}
            {t.id === "ai" && aiApplied && (
              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#81ecff] align-middle" />
            )}
          </button>
        ))}
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row h-[calc(100vh-73px)]">
        {/* ── LEFT: Form ────────────────────────────────────────── */}
        <div
          className={`flex-1 min-w-0 overflow-y-auto p-5 space-y-4 xl:border-r border-[#1b1f2b] ${activeTab !== "form" ? "hidden xl:block" : ""}`}
        >
          {/* Meeting Info */}
          <Card>
            <CardHeader icon="📋" title="Meeting Info" />
            <div className="p-4 space-y-4">
              <div>
                <Label required>Title</Label>
                <Input
                  value={mom.title}
                  onChange={set("title")}
                  placeholder="e.g. Weekly Tech Sync — Week 22"
                />
              </div>

              <div>
                <Label>Link to Scheduled Meeting</Label>
                <Select value={mom.meetingRef} onChange={handleMeetingSelect}>
                  <option value="">— Standalone MOM (no link) —</option>
                  {meetings.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                      {m.startDate
                        ? ` · ${new Date(m.startDate).toLocaleDateString("en-IN")}`
                        : ""}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Label required>Date</Label>
                  <Input type="date" value={mom.date} onChange={set("date")} />
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    value={mom.startTime}
                    onChange={set("startTime")}
                    placeholder="10:30 AM"
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={mom.duration}
                    onChange={set("duration")}
                    placeholder="1h 30m"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={mom.description}
                  onChange={set("description")}
                  placeholder="Brief summary of what this meeting was about…"
                />
              </div>
            </div>
          </Card>

          {/* Attendees */}
          <Card>
            <CardHeader
              icon="👥"
              title="Attendees"
              badge={
                mom.attendees.length > 0
                  ? `${mom.attendees.length} selected`
                  : null
              }
            />
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Team Scope</Label>
                  <Select value={mom.teamScope} onChange={set("teamScope")}>
                    {scopes.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {mom.attendees.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {mom.attendees.map((a) => (
                    <button
                      key={a.userId || `guest-${a.name}`}
                      onClick={() => removeAttendee(a)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-all group
                        ${a.external
                          ? "bg-[#81ecff]/10 border-[#81ecff]/25 text-[#81ecff] hover:bg-[#ff6c95]/15 hover:border-[#ff6c95]/40"
                          : "bg-[#f183ff]/10 border-[#f183ff]/25 text-[#f183ff] hover:bg-[#ff6c95]/15 hover:border-[#ff6c95]/40"}`}
                    >
                      {a.name}
                      {a.external && (
                        <span className="text-[9px] uppercase tracking-wide opacity-70">guest</span>
                      )}
                      <span className="text-current/50 group-hover:text-[#ff6c95] text-sm leading-none">×</span>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <Input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members by name, email or domain…"
                />
                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#070910]/60 divide-y divide-white/5">
                  {filteredMembers.length === 0 ? (
                    memberSearch.trim() ? (
                      <button
                        type="button"
                        onClick={() => addGuestAttendee(memberSearch)}
                        className="w-full flex items-center gap-3 px-3 py-4 text-left hover:bg-[#f183ff]/8 transition-colors group"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#81ecff]/15 border border-[#81ecff]/30 text-[#81ecff] text-base leading-none">
                          +
                        </span>
                        <span className="text-sm">
                          <span className="text-[#aea9b6]">Not on the portal? </span>
                          <span className="font-semibold text-[#f5eefc]">Add “{memberSearch.trim()}”</span>
                          <span className="text-[#aea9b6]"> as a guest</span>
                        </span>
                      </button>
                    ) : (
                      <p className="text-xs text-[#6b6f7d] text-center py-8">
                        No members for this scope
                      </p>
                    )
                  ) : (
                    filteredMembers.map((m) => {
                      const selected = isSelected(m);
                      return (
                        <button
                          key={m._id}
                          onClick={() => toggleAttendee(m)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-all
                            ${selected ? "bg-[#f183ff]/8" : "hover:bg-[#0c0f1a]"}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                            ${
                              selected
                                ? "bg-gradient-to-br from-[#f183ff] to-[#ff6c95] text-white"
                                : "bg-[#1b1f2b] text-[#aea9b6]"
                            }`}
                          >
                            {selected ? "✓" : m.name?.[0] || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-medium truncate ${selected ? "text-[#f5eefc]" : "text-[#aea9b6]"}`}
                            >
                              {m.name}
                            </div>
                            <div className="text-[11px] text-[#6b6f7d] truncate">
                              {m.role} · {m.coreDomain}
                              {m.subDomain ? ` / ${m.subDomain}` : ""}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Discussed Points */}
          <Card>
            <CardHeader
              icon="💬"
              title="Points Discussed"
              badge={`${mom.discussedPoints.filter((p) => p.trim()).length}`}
            />
            <div className="p-4 space-y-2">
              {mom.discussedPoints.map((pt, i) => (
                <div key={i} className="flex gap-2 items-start group">
                  <span className="mt-3 text-[11px] font-bold text-[#f183ff]/60 w-5 shrink-0 text-right">
                    {i + 1}
                  </span>
                  <Textarea
                    rows={2}
                    value={pt}
                    onChange={(e) =>
                      setArr("discussedPoints", i, e.target.value)
                    }
                    placeholder={`Discussion point ${i + 1}…`}
                  />
                  <button
                    onClick={() => removeArr("discussedPoints", i)}
                    className="mt-2.5 text-[#272c3a] hover:text-[#ff6e84] transition-colors text-lg shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArr("discussedPoints")}
                className="mt-1 flex items-center gap-1.5 text-xs text-[#f183ff]/70 hover:text-[#f183ff] transition-colors"
              >
                <span className="text-base leading-none">+</span> Add point
              </button>
            </div>
          </Card>

          {/* Decisions */}
          <Card>
            <CardHeader
              icon="⚡"
              title="Key Decisions"
              badge={`${mom.decisions.filter((d) => d.trim()).length}`}
            />
            <div className="p-4 space-y-2">
              {mom.decisions.map((d, i) => (
                <div key={i} className="flex gap-2 items-center group">
                  <span className="w-2 h-2 rounded-full bg-[#ff6c95]/50 shrink-0" />
                  <Input
                    value={d}
                    onChange={(e) => setArr("decisions", i, e.target.value)}
                    placeholder={`Decision ${i + 1}…`}
                  />
                  <button
                    onClick={() => removeArr("decisions", i)}
                    className="text-[#272c3a] hover:text-[#ff6e84] transition-colors text-lg shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArr("decisions")}
                className="mt-1 flex items-center gap-1.5 text-xs text-[#f183ff]/70 hover:text-[#f183ff] transition-colors"
              >
                <span className="text-base leading-none">+</span> Add decision
              </button>
            </div>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader
              icon="✅"
              title="Action Items"
              badge={`${mom.actionItems.filter((a) => a.task.trim()).length}`}
            />
            <div className="p-4 space-y-3">
              {mom.actionItems.length === 0 && (
                <p className="text-xs text-[#6b6f7d] text-center py-4">
                  No action items yet
                </p>
              )}
              {mom.actionItems.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white/[0.03] border border-white/8 p-3.5 space-y-2.5 group"
                >
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/20 flex items-center justify-center text-[10px] text-[#f183ff] shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <Input
                      value={item.task}
                      onChange={(e) => setActionItem(i, "task", e.target.value)}
                      placeholder="What needs to be done…"
                      className="flex-1"
                    />
                    <button
                      onClick={() => removeActionItem(i)}
                      className="text-[#272c3a] hover:text-[#ff6e84] transition-colors text-xl shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                    <div>
                      <Label>Assignee</Label>
                      <Select
                        value={item.assignee}
                        onChange={(e) =>
                          setActionItem(i, "assignee", e.target.value)
                        }
                      >
                        <option value="">— Unassigned —</option>
                        {mom.attendees.map((a) => (
                          <option key={a.userId || a.name} value={a.name}>
                            {a.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      {/* Bug fix: if AI gave a non-date string, show it as text with a clear button */}
                      {item.dueDate && !isValidDateStr(item.dueDate) ? (
                        <div className="flex gap-1">
                          <div className="flex-1 bg-[#0c0f1a] border border-[#ff6c95]/30 rounded-lg px-3 py-2.5 text-xs text-[#ff6c95] truncate">
                            {item.dueDate}
                          </div>
                          <button
                            onClick={() => setActionItem(i, "dueDate", "")}
                            className="px-2 rounded-lg border border-[#272c3a] text-[#6b6f7d] hover:text-[#ff6e84] text-sm transition-all"
                            title="Clear and enter a date"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <Input
                          type="date"
                          value={item.dueDate}
                          onChange={(e) =>
                            setActionItem(i, "dueDate", e.target.value)
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addActionItem}
                className="flex items-center gap-1.5 text-xs text-[#f183ff]/70 hover:text-[#f183ff] transition-colors"
              >
                <span className="text-base leading-none">+</span> Add action
                item
              </button>
            </div>
          </Card>

          {/* Next Meeting */}
          <Card>
            <CardHeader icon="📅" title="Next Meeting" />
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Scheduled Date</Label>
                <Input
                  type="date"
                  value={mom.nextMeetDate}
                  onChange={set("nextMeetDate")}
                />
              </div>
              <div className="col-span-2">
                <Label>Agenda for Next Meet</Label>
                <Textarea
                  rows={2}
                  value={mom.nextMeetAgenda}
                  onChange={set("nextMeetAgenda")}
                  placeholder="Topics to cover in the next session…"
                />
              </div>
            </div>
          </Card>

          <div className="h-6" />
        </div>

        {/* ── RIGHT: AI Panel ───────────────────────────────────── */}
        <div
          className={`w-full xl:w-[400px] shrink-0 flex flex-col bg-[#070910] border-t xl:border-t-0 border-[#1b1f2b]
          ${activeTab !== "ai" ? "hidden xl:flex" : "flex"}`}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#1b1f2b]">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#81ecff] to-[#f183ff] flex items-center justify-center text-[10px] font-bold text-black">
                AI
              </div>
              <h2 className="font-bold text-sm text-[#f5eefc]">
                AI MOM Assistant
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#81ecff]/10 border border-[#81ecff]/20 text-[10px] text-[#81ecff]">
                LLaMA 3.3-70B
              </span>
            </div>
            <p className="text-xs text-[#6b6f7d]">
              Describe your meeting in plain language — AI fills in the form.
            </p>
          </div>

          {aiApplied && (
            <div className="mx-5 mt-4 p-3 rounded-lg bg-[#81ecff]/8 border border-[#81ecff]/20 text-xs text-[#81ecff] flex items-center gap-2">
              <span>✓</span> AI content applied to the form. Review and save
              when ready.
            </div>
          )}

          {/* Examples */}
          <div className="px-5 pt-4 space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-[#353b4a] mb-2">
              Try something like…
            </p>
            {[
              "Tech team sync today. Discussed new backend API, decided to use Node.js. Raghav will finish auth by Friday.",
              "Corporate meeting on hackathon sponsorships. Priya to contact 3 companies by next week. Next meet on Monday.",
              "Full team sync. Reviewed project progress, 2 bugs fixed, feature release planned in 2 weeks.",
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => setAiPrompt(ex)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-[#0c0f1a] border border-[#1b1f2b] text-xs text-[#6b6f7d]
                  hover:border-[#f183ff]/25 hover:text-[#aea9b6] transition-all"
              >
                "{ex.slice(0, 72)}…"
              </button>
            ))}
          </div>

          {/* Prompt input */}
          <div className="flex-1 flex flex-col px-5 pt-4 pb-5 gap-3 min-h-0">
            <div className="flex-1 flex flex-col">
              <Label>Meeting Description</Label>
              <Textarea
                className="flex-1 min-h-[140px]"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Weekly web dev sync on June 4th. Chirag presented socket integration, we decided to merge after testing. Agrim will write unit tests by June 8th. Next meet June 11th, agenda: deployment pipeline…"
              />
            </div>

            {aiError && (
              <div className="p-3 rounded-lg bg-[#ff6e84]/8 border border-[#ff6e84]/25 text-xs text-[#ff6e84]">
                ✗ {aiError}
              </div>
            )}

            <button
              onClick={handleAIGenerate}
              disabled={aiLoading || aiPrompt.trim().length < 10}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#81ecff] via-[#f183ff] to-[#ff6c95] text-white font-semibold
                text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <>
                  <Spinner white /> Generating MOM…
                </>
              ) : (
                <>
                  <span>✨</span> Generate MOM with AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner({ white }) {
  return (
    <span
      className={`w-3.5 h-3.5 border-2 rounded-full animate-spin shrink-0 ${
        white
          ? "border-white border-t-transparent"
          : "border-[#f183ff] border-t-transparent"
      }`}
    />
  );
}
