import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { exportMOMtoPDF, loadLogoBase64 } from "../../utils/momPdfExport";

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
  attendees: [],          // array of user objects
  discussedPoints: [""],
  decisions: [""],
  actionItems: [],        // { task, assignee, dueDate }
  nextMeetDate: "",
  nextMeetAgenda: "",
  aiGenerated: false,
  rawPrompt: "",
};

/* ─── small reusable pieces ─────────────────────────────────── */
const Label = ({ children }) => (
  <label className="block text-xs font-semibold uppercase tracking-widest text-[#aea9b6] mb-1.5">
    {children}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full bg-[#1b1823] border border-[#494651] rounded-lg px-3 py-2.5 text-sm text-[#f5eefc] placeholder-[#494651]
      focus:outline-none focus:border-[#f183ff] focus:ring-1 focus:ring-[#f183ff]/30 transition-all ${props.className || ""}`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={`w-full bg-[#1b1823] border border-[#494651] rounded-lg px-3 py-2.5 text-sm text-[#f5eefc] placeholder-[#494651]
      focus:outline-none focus:border-[#f183ff] focus:ring-1 focus:ring-[#f183ff]/30 transition-all resize-none ${props.className || ""}`}
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full bg-[#1b1823] border border-[#494651] rounded-lg px-3 py-2.5 text-sm text-[#f5eefc]
      focus:outline-none focus:border-[#f183ff] transition-all"
  >
    {children}
  </select>
);

const Pill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/20 text-xs text-[#f183ff]">
    {label}
    <button onClick={onRemove} className="text-[#f183ff]/60 hover:text-[#ff6c95] transition-colors">×</button>
  </span>
);

/* ─── Main Component ─────────────────────────────────────────── */
export default function MOMGenerator() {
  const [mom, setMom] = useState(defaultMOM);
  const [meetings, setMeetings] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("form"); // "form" | "ai"

  const token = () => localStorage.getItem("token");
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  /* ── Load meetings & members ─────────────────────────────────── */
  useEffect(() => {
    fetchMeetings();
    fetchMembers("all");
  }, []);

  useEffect(() => {
    fetchMembers(mom.teamScope);
    // Clear attendees that no longer match scope
    setMom((prev) => ({ ...prev, attendees: [] }));
  }, [mom.teamScope]);

  // Filter members by search query
  useEffect(() => {
    if (!memberSearch.trim()) {
      setFilteredMembers(allMembers);
    } else {
      const q = memberSearch.toLowerCase();
      setFilteredMembers(
        allMembers.filter(
          (m) =>
            m.name?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q) ||
            m.coreDomain?.toLowerCase().includes(q)
        )
      );
    }
  }, [memberSearch, allMembers]);

  const fetchMeetings = async () => {
    try {
      const { data } = await axios.get(`${API}/meet/getmeet`, {
        headers: headers(),
        withCredentials: true
      });
      setMeetings(Array.isArray(data) ? data : []);
    } catch {
      setMeetings([]);
    }
  };

  const fetchMembers = async (scope) => {
    try {
      const { data } = await axios.get(`${API}/api/mom/members/approved`, {
        headers: headers(),
        withCredentials: true,
        params: { scope: scope || "all" },
      });
      setAllMembers(Array.isArray(data) ? data : []);
      setFilteredMembers(Array.isArray(data) ? data : []);
    } catch {
      setAllMembers([]);
      setFilteredMembers([]);
    }
  };

  /* ── Field helpers ───────────────────────────────────────────── */
  const set = (field) => (e) => setMom((prev) => ({ ...prev, [field]: e.target.value }));

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

  /* ── Meeting selector: auto-fill date/time ───────────────────── */
  const handleMeetingSelect = (e) => {
    const id = e.target.value;
    setMom((prev) => ({ ...prev, meetingRef: id }));
    if (id) {
      const meet = meetings.find((m) => m._id === id);
      if (meet) {
        const dateStr = meet.startDate
          ? new Date(meet.startDate).toISOString().slice(0, 10)
          : prev.date;
        const timeStr = meet.startTime
          ? new Date(meet.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
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
      }
    }
  };

  /* ── Attendee management ─────────────────────────────────────── */
  const isSelected = (member) => mom.attendees.some((a) => a.userId === member._id);

  const toggleAttendee = (member) => {
    setMom((prev) => {
      if (prev.attendees.some((a) => a.userId === member._id)) {
        return { ...prev, attendees: prev.attendees.filter((a) => a.userId !== member._id) };
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
          },
        ],
      };
    });
  };

  /* ── Action items ────────────────────────────────────────────── */
  const addActionItem = () =>
    setMom((prev) => ({
      ...prev,
      actionItems: [...prev.actionItems, { task: "", assignee: "", dueDate: "" }],
    }));

  const setActionItem = (idx, field, val) =>
    setMom((prev) => {
      const items = prev.actionItems.map((it, i) =>
        i === idx ? { ...it, [field]: val } : it
      );
      return { ...prev, actionItems: items };
    });

  const removeActionItem = (idx) =>
    setMom((prev) => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== idx),
    }));

  /* ── AI Generation ───────────────────────────────────────────── */
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() || aiPrompt.length < 10) return;
    setAiLoading(true);
    setAiError("");
    try {
      const { data } = await axios.post(
        `${API}/api/mom/ai-generate`,
        { prompt: aiPrompt },
        { headers: headers(), withCredentials: true }
      );
      const d = data.data || {};
      setMom((prev) => ({
        ...prev,
        title: d.title || prev.title,
        description: d.description || prev.description,
        discussedPoints: d.discussedPoints?.length ? d.discussedPoints : prev.discussedPoints,
        decisions: d.decisions?.length ? d.decisions : prev.decisions,
        actionItems: d.actionItems?.length
          ? d.actionItems.map((a) => ({ task: a.task || "", assignee: a.assignee || "", dueDate: a.dueDate || "" }))
          : prev.actionItems,
        nextMeetDate: d.nextMeetDate ? d.nextMeetDate.slice(0, 10) : prev.nextMeetDate,
        nextMeetAgenda: d.nextMeetAgenda || prev.nextMeetAgenda,
        aiGenerated: true,
        rawPrompt: aiPrompt,
      }));
      setActiveTab("form");
    } catch (err) {
      setAiError(err.response?.data?.message || "AI generation failed. Check your Groq API key.");
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Save MOM ────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!mom.title || !mom.date) {
      setSaveError("Title and date are required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      // Fix MongoDB CastError by changing empty date strings to null
      const payload = {
        ...mom,
        nextMeetDate: mom.nextMeetDate || null,
        actionItems: mom.actionItems.map((a) => ({
          ...a,
          dueDate: a.dueDate || null,
        })),
      };

      await axios.post(`${API}/api/mom/create`, payload, {
        headers: headers(),
        withCredentials: true
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  /* ── PDF Export ──────────────────────────────────────────────── */
  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      const logo = await loadLogoBase64();
      await exportMOMtoPDF(mom, logo);
    } catch (e) {
      console.error("PDF export error:", e);
    } finally {
      setPdfLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0f0d16] text-[#f5eefc] font-sans">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-[#0f0d16]/90 backdrop-blur-md border-b border-[#494651]/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f183ff] to-[#ff6c95] flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#f5eefc] leading-tight">MOM Generator</h1>
            <p className="text-xs text-[#aea9b6]">Minutes of Meeting</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mom.aiGenerated && (
            <span className="px-2.5 py-1 rounded-full bg-[#81ecff]/10 border border-[#81ecff]/20 text-xs text-[#81ecff]">
              ✨ AI-assisted
            </span>
          )}
          <button
            onClick={handleExportPDF}
            disabled={pdfLoading || !mom.title}
            className="px-4 py-2 rounded-lg border border-[#494651] text-sm text-[#aea9b6] hover:border-[#f183ff]/40 hover:text-[#f183ff]
              disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {pdfLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-[#f183ff] border-t-transparent rounded-full animate-spin" />
            ) : "📄"}
            Export PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-white text-sm font-semibold
              hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? "Saving…" : "Save MOM"}
          </button>
        </div>
      </div>

      {/* Status messages */}
      {saveSuccess && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-[#81ecff]/10 border border-[#81ecff]/30 text-sm text-[#81ecff]">
          ✓ MOM saved successfully!
        </div>
      )}
      {saveError && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-[#ff6e84]/10 border border-[#ff6e84]/30 text-sm text-[#ff6e84]">
          ✗ {saveError}
        </div>
      )}

      {/* Mobile tab switcher */}
      <div className="flex gap-1 mx-6 mt-4 p-1 rounded-xl bg-[#1b1823] xl:hidden">
        {["form", "ai"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t
                ? "bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-white"
                : "text-[#aea9b6]"
              }`}
          >
            {t === "form" ? "📝 Form" : "✨ AI Assistant"}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex flex-col xl:flex-row gap-0 xl:gap-0 h-[calc(100vh-73px)]">
        {/* ── LEFT: MOM Form ──────────────────────────────────────── */}
        <div
          className={`flex-1 overflow-y-auto p-6 xl:border-r border-[#494651]/40 space-y-6
            ${activeTab !== "form" ? "hidden xl:block" : ""}`}
        >

          {/* Core info */}
          <Section title="Meeting Info" icon="📋">
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={mom.title}
                  onChange={set("title")}
                  placeholder="e.g. Weekly Tech Sync — Week 22"
                />
              </div>

              <div>
                <Label>Link to Scheduled Meeting</Label>
                <Select value={mom.meetingRef} onChange={handleMeetingSelect}>
                  <option value="">— None (standalone MOM) —</option>
                  {meetings.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}{m.startDate ? ` · ${new Date(m.startDate).toLocaleDateString("en-IN")}` : ""}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date *</Label>
                  <Input type="date" value={mom.date} onChange={set("date")} />
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    value={mom.startTime}
                    onChange={set("startTime")}
                    placeholder="e.g. 10:30 AM"
                  />
                </div>
              </div>

              <div>
                <Label>Duration</Label>
                <Input
                  value={mom.duration}
                  onChange={set("duration")}
                  placeholder="e.g. 1h 30m"
                />
              </div>

              <div>
                <Label>Description / Overview</Label>
                <Textarea
                  rows={3}
                  value={mom.description}
                  onChange={set("description")}
                  placeholder="Brief summary of the meeting…"
                />
              </div>
            </div>
          </Section>

          {/* Attendees */}
          <Section title="Attendees" icon="👥">
            <div className="space-y-3">
              <div>
                <Label>Team Scope</Label>
                <Select value={mom.teamScope} onChange={set("teamScope")}>
                  {SCOPES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
                <p className="text-xs text-[#aea9b6] mt-1.5">
                  Scope filters which members appear below. Changing scope clears current selection.
                </p>
              </div>

              {/* Selected chips */}
              {mom.attendees.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-[#1b1823] rounded-lg border border-[#494651]/60">
                  {mom.attendees.map((a) => (
                    <Pill
                      key={a.userId}
                      label={a.name}
                      onRemove={() => toggleAttendee({ _id: a.userId })}
                    />
                  ))}
                </div>
              )}

              {/* Member picker */}
              <div>
                <Input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members by name or email…"
                />
                <div className="mt-2 max-h-52 overflow-y-auto space-y-1 rounded-lg border border-[#494651]/40 bg-[#14121c] p-1">
                  {filteredMembers.length === 0 ? (
                    <p className="text-xs text-[#aea9b6] text-center py-6">No members found for this scope</p>
                  ) : (
                    filteredMembers.map((m) => (
                      <button
                        key={m._id}
                        onClick={() => toggleAttendee(m)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm
                          ${isSelected(m)
                            ? "bg-[#f183ff]/10 border border-[#f183ff]/30"
                            : "hover:bg-[#1b1823]"
                          }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f183ff] to-[#ff6c95] flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {m.name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#f5eefc] truncate">{m.name}</div>
                          <div className="text-xs text-[#aea9b6] truncate">{m.role} · {m.coreDomain}</div>
                        </div>
                        {isSelected(m) && (
                          <span className="text-[#f183ff] text-lg shrink-0">✓</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* Discussion Points */}
          <Section title="Discussed Points" icon="💬">
            <div className="space-y-2">
              {mom.discussedPoints.map((pt, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="mt-3 text-xs font-bold text-[#f183ff] w-5 shrink-0">{i + 1}.</span>
                  <Textarea
                    rows={2}
                    value={pt}
                    onChange={(e) => setArr("discussedPoints", i, e.target.value)}
                    placeholder={`Discussion point ${i + 1}…`}
                  />
                  <button
                    onClick={() => removeArr("discussedPoints", i)}
                    className="mt-2.5 text-[#494651] hover:text-[#ff6e84] transition-colors text-lg shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArr("discussedPoints")}
                className="flex items-center gap-2 text-sm text-[#f183ff] hover:text-[#ff6c95] transition-colors mt-1"
              >
                + Add point
              </button>
            </div>
          </Section>

          {/* Decisions */}
          <Section title="Key Decisions" icon="⚡">
            <div className="space-y-2">
              {mom.decisions.map((d, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="mt-3 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#ff6c95] inline-block mt-1" />
                  </span>
                  <Input
                    value={d}
                    onChange={(e) => setArr("decisions", i, e.target.value)}
                    placeholder={`Decision ${i + 1}…`}
                  />
                  <button
                    onClick={() => removeArr("decisions", i)}
                    className="text-[#494651] hover:text-[#ff6e84] transition-colors text-lg shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArr("decisions")}
                className="flex items-center gap-2 text-sm text-[#f183ff] hover:text-[#ff6c95] transition-colors mt-1"
              >
                + Add decision
              </button>
            </div>
          </Section>

          {/* Action Items */}
          <Section title="Action Items" icon="✅">
            <div className="space-y-3">
              {mom.actionItems.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-[#1b1823] border border-[#494651]/60 space-y-2"
                >
                  <div className="flex gap-2">
                    <Input
                      value={item.task}
                      onChange={(e) => setActionItem(i, "task", e.target.value)}
                      placeholder="Task description…"
                      className="flex-1"
                    />
                    <button
                      onClick={() => removeActionItem(i)}
                      className="text-[#494651] hover:text-[#ff6e84] transition-colors text-xl shrink-0"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Assignee</Label>
                      <Select
                        value={item.assignee}
                        onChange={(e) => setActionItem(i, "assignee", e.target.value)}
                      >
                        <option value="">— Unassigned —</option>
                        {mom.attendees.map((a) => (
                          <option key={a.userId} value={a.name}>{a.name}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={item.dueDate}
                        onChange={(e) => setActionItem(i, "dueDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addActionItem}
                className="flex items-center gap-2 text-sm text-[#f183ff] hover:text-[#ff6c95] transition-colors"
              >
                + Add action item
              </button>
            </div>
          </Section>

          {/* Next Meeting */}
          <Section title="Next Meeting" icon="📅">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Scheduled Date</Label>
                <Input
                  type="date"
                  value={mom.nextMeetDate}
                  onChange={set("nextMeetDate")}
                />
              </div>
              <div className="col-span-2">
                <Label>Agenda / Topics for Next Meet</Label>
                <Textarea
                  rows={2}
                  value={mom.nextMeetAgenda}
                  onChange={set("nextMeetAgenda")}
                  placeholder="What should the next meeting cover…"
                />
              </div>
            </div>
          </Section>

          {/* Bottom padding */}
          <div className="h-8" />
        </div>

        {/* ── RIGHT: AI Chatbox ────────────────────────────────────── */}
        <div
          className={`w-full xl:w-[420px] shrink-0 flex flex-col bg-[#0f0d16] border-t xl:border-t-0 border-[#494651]/40
            ${activeTab !== "ai" ? "hidden xl:flex" : "flex"}`}
        >
          {/* AI Panel header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#494651]/40">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#81ecff] to-[#f183ff] flex items-center justify-center text-[10px] font-bold text-black">
                AI
              </div>
              <h2 className="font-bold text-sm text-[#f5eefc]">AI MOM Assistant</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#81ecff]/10 border border-[#81ecff]/20 text-[10px] text-[#81ecff]">
                LLaMA 3.3-70B
              </span>
            </div>
            <p className="text-xs text-[#aea9b6]">
              Describe your meeting in natural language and let AI fill the MOM form for you.
            </p>
          </div>

          {/* Chat examples */}
          <div className="px-5 pt-4 space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-[#78737f] mb-2">Try something like…</p>
            {[
              "We had a tech team meeting today. Discussed the new backend API, decided to use Node.js, Raghav will finish auth by Friday.",
              "Corporate meeting: talked about upcoming hackathon sponsorships, Priya to contact 3 companies, next meet next Monday.",
              "Full team sync. Reviewed project progress, two bugs fixed, planning feature release in 2 weeks.",
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => setAiPrompt(ex)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-[#1b1823] border border-[#494651]/60 text-xs text-[#aea9b6]
                  hover:border-[#f183ff]/30 hover:text-[#f5eefc] transition-all"
              >
                "{ex.slice(0, 75)}…"
              </button>
            ))}
          </div>

          {/* Prompt area */}
          <div className="flex-1 flex flex-col px-5 pt-4 pb-5 gap-3">
            <div className="flex-1 flex flex-col min-h-0">
              <Label>Your Meeting Description</Label>
              <Textarea
                rows={8}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. We had a weekly web dev team meeting on June 4th. Chirag presented the new socket integration, we decided to merge it after testing. Agrim will write unit tests by June 8th. Next meeting on June 11th, agenda: deployment pipeline…"
                className="flex-1 min-h-[160px] resize-none"
              />
            </div>

            {aiError && (
              <div className="p-3 mt-2 rounded-lg bg-[#ff6e84]/10 border border-[#ff6e84]/30 text-xs text-[#ff6e84]">
                ✗ {aiError}
              </div>
            )}

            <button
              onClick={handleAIGenerate}
              disabled={aiLoading || aiPrompt.trim().length < 10}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#81ecff] via-[#f183ff] to-[#ff6c95]
                text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all flex items-center justify-center gap-2.5 relative overflow-hidden"
            >
              {aiLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating MOM…
                </>
              ) : (
                <>
                  <span className="text-base">✨</span>
                  Generate MOM with AI
                </>
              )}
            </button>


          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Section wrapper ───────────────────────────────────────── */
function Section({ title, icon, children }) {
  return (
    <div className="rounded-xl border border-[#494651]/40 bg-[#1b1823]/50 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#494651]/40 bg-[#1b1823]">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-semibold text-[#f5eefc]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
