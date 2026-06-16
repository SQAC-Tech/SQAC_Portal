import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DEPARTMENTS = ["CTECH", "CINTEL", "ECE", "NWC", "DSBS", "Mechanical", "Other"];

const ROLE_LABELS = {
  secretary:       "Secretary",
  joint_secretary: "Joint Secretary",
  technical_lead:  "Technical Lead",
  project_lead:    "Project Lead",
  corp_lead:       "Corporate Lead",
  domain_lead:     "Domain Lead",
  associate_lead:  "Associate Lead",
  member:          "Member",
};

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#aea9b6] uppercase tracking-[0.1em]">
        {label} {required && <span className="text-[#ff6c95]">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-[#aea9b6]/50 focus:outline-none focus:border-[#f183ff]/50 focus:bg-white/[0.06] transition-colors";

const selectClass =
  "w-full rounded-xl border border-white/10 bg-[#0c0f1a] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f183ff]/50 transition-colors appearance-none cursor-pointer";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const clubRoleLabel = ROLE_LABELS[stored.role] || stored.role || "Member";

  const [form, setForm] = useState({
    name: stored.name || "",
    regNum: stored.regNum || "",
    email: stored.email || "",
    department: "",
    section: "",
    facultyAdvisorName: "",
    facultyAdvisorNo: "",
    residenceType: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = ["department", "section", "facultyAdvisorName", "facultyAdvisorNo", "residenceType"];
    for (const k of required) {
      if (!form[k].trim()) {
        toast.error(`${k.replace(/([A-Z])/g, " $1")} is required.`);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/coc/profile`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");

      // Update localStorage
      const updated = { ...stored, ...data.user };
      localStorage.setItem("user", JSON.stringify(updated));

      toast.success("Profile completed!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1 rounded-full bg-[#81ecff]/10 border border-[#81ecff]/30 text-[#81ecff] text-xs font-bold uppercase tracking-widest mb-3">
            Step 2 of 2
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#81ecff] to-[#f183ff] bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-[#aea9b6] text-sm mt-2">
            A few more details to set up your SQAC member profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Card: Identity (read-only) */}
          <div className="rounded-2xl border border-white/8 bg-[#0c0f1a]/70 p-6 space-y-4">
            <p className="text-xs font-bold text-[#aea9b6] uppercase tracking-widest mb-1">Identity</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input className={inputClass} value={form.name} onChange={set("name")} placeholder="Full Name" />
              </Field>
              <Field label="Registration No." required>
                <input className={inputClass} value={form.regNum} readOnly tabIndex={-1}
                  style={{ opacity: 0.6, cursor: "not-allowed" }} />
              </Field>
            </div>

            <Field label="SRM Email ID" required>
              <input className={inputClass} value={form.email} readOnly tabIndex={-1}
                style={{ opacity: 0.6, cursor: "not-allowed" }} />
            </Field>
          </div>

          {/* Card: Academic */}
          <div className="rounded-2xl border border-white/8 bg-[#0c0f1a]/70 p-6 space-y-4">
            <p className="text-xs font-bold text-[#aea9b6] uppercase tracking-widest mb-1">Academic Details</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Department" required>
                <div className="relative">
                  <select className={selectClass} value={form.department} onChange={set("department")}>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#aea9b6] text-[18px]">expand_more</span>
                </div>
              </Field>
              <Field label="Section" required>
                <input className={inputClass} value={form.section} onChange={set("section")} placeholder="e.g. A, B, C" />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Faculty Advisor Name" required>
                <input className={inputClass} value={form.facultyAdvisorName} onChange={set("facultyAdvisorName")} placeholder="Faculty Advisor Name" />
              </Field>
              <Field label="Faculty Advisor Contact No." required>
                <input className={inputClass} value={form.facultyAdvisorNo} onChange={set("facultyAdvisorNo")} placeholder="Phone or Email" />
              </Field>
            </div>
          </div>

          {/* Card: Club Role */}
          <div className="rounded-2xl border border-white/8 bg-[#0c0f1a]/70 p-6 space-y-4">
            <p className="text-xs font-bold text-[#aea9b6] uppercase tracking-widest mb-1">Club Role</p>

            {/* Role badge — read-only, fetched from onboarding */}
            <Field label="Club Role">
              <div className={`${inputClass} flex items-center gap-2`} style={{ opacity: 0.7, cursor: "not-allowed" }}>
                <span className="material-symbols-outlined text-[#f183ff] text-[16px]">badge</span>
                <span>{clubRoleLabel}</span>
              </div>
            </Field>
          </div>

          {/* Card: Residence */}
          <div className="rounded-2xl border border-white/8 bg-[#0c0f1a]/70 p-6">
            <p className="text-xs font-bold text-[#aea9b6] uppercase tracking-widest mb-4">Residence</p>
            <p className="text-sm text-white mb-3 font-medium">
              Are you a Hosteller or a Dayscholar? <span className="text-[#ff6c95]">*</span>
            </p>
            <div className="flex gap-4">
              {["Hosteller", "Dayscholar"].map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="residenceType"
                    value={opt}
                    checked={form.residenceType === opt}
                    onChange={set("residenceType")}
                    className="w-4 h-4 accent-[#f183ff] cursor-pointer"
                  />
                  <span className="text-sm text-[#aea9b6] group-hover:text-white transition-colors">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 rounded-xl bg-gradient-to-r from-[#81ecff] to-[#f183ff] text-black font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {loading ? "Saving…" : "Save & Continue →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
