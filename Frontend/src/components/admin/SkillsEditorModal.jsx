import React, { useState, useEffect } from "react";

const TECH_SKILLS = [
  // Web Dev
  "html", "css", "javascript", "react", "nextjs", "angular", "vue",
  "tailwind", "bootstrap", "api", "graphql", "nodejs", "express",
  "fastapi", "django", "flask", "java", "spring", "authentication",
  "apiDesign", "systemDesign", "sql", "mongodb", "redis",
  // AI/ML
  "cpp", "javaProg", "python", "numpy", "pandas", "scikitlearn",
  "tensorflow", "pytorch", "deepLearning", "nlp", "computerVision",
  "dataAnalysis", "modelEvaluation", "llm", "generativeAi", "rag",
  "langchain", "huggingface", "transformers", "promptEngineering",
  // DevOps
  "github", "docker", "cicd", "linux", "aws", "deployment",
];

const CORP_SKILLS = [
  // Events
  "eventPlanning", "venueManagement", "budgeting", "vendorCoordination", "logistics",
  // Media
  "contentWriting", "socialMediaMgmt", "videoEditing", "photography", "seoMarketing",
  // Public Relations
  "communication", "outreach", "networking", "publicSpeaking", "crisisManagement",
  // Sponsorships
  "pitchDecks", "negotiation", "brandPartnerships", "fundraising", "proposalWriting",
  // Creatives
  "graphicDesign", "uiuxDesign", "motionGraphics", "branding", "illustration",
];

const formatLabel = (camelCase) => {
  const result = camelCase.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const SkillsEditorModal = ({ user, memberProfile, onClose, onSave }) => {
  const isCorporate = user?.coreDomain === "Corporate";
  const [activeTab, setActiveTab] = useState(isCorporate ? "Corporate" : "Web Dev");
  
  const [skills, setSkills] = useState({});
  const [corpSkills, setCorpSkills] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize skills
    const initTech = {};
    TECH_SKILLS.forEach((s) => (initTech[s] = memberProfile?.skills?.[s] || 0));
    setSkills(initTech);

    const initCorp = {};
    CORP_SKILLS.forEach((s) => (initCorp[s] = memberProfile?.corpSkills?.[s] || 0));
    setCorpSkills(initCorp);
  }, [memberProfile]);

  const handleTechChange = (skill, value) => {
    setSkills((prev) => ({ ...prev, [skill]: parseInt(value) }));
  };

  const handleCorpChange = (skill, value) => {
    setCorpSkills((prev) => ({ ...prev, [skill]: parseInt(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    try {
      const payload = {
        email: user.email,
        fullName: user.name,
        coreDomain: user.coreDomain,
        techSubDomain: user.subDomain,
        userId: user._id,
        skills,
        corpSkills,
      };

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_BASE_URL}/api/projects/members/upsert`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Unable to update skills.");
      }

      onSave(data.profile); // Refresh parent data
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderSliders = (skillList, state, handler) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {skillList.map((skill) => (
        <div key={skill} className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold text-white/80">{formatLabel(skill)}</span>
            <span className="text-xs text-primary font-bold">{state[skill] || 0}/5</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={state[skill] || 0}
            onChange={(e) => handler(skill, e.target.value)}
            className="w-full accent-primary"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-[2rem] border border-white/10 bg-[#0d1220]/95 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
              Skill Evaluation
            </p>
            <h3 className="mt-2 text-2xl font-bold text-white font-['Space_Grotesk']">
              Update {user?.coreDomain} Skills
            </h3>
            <p className="mt-1 text-sm text-white/55">
              Rate your proficiency (0 = None, 5 = Expert) to get better project assignments.
            </p>
          </div>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {!isCorporate && (
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
              {["Web Dev", "AI/ML", "DevOps"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-primary text-black"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {isCorporate && (
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
              {["Events", "Media", "Public Relations", "Sponsorships", "Creatives"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-primary text-black"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          <form id="skills-form" onSubmit={handleSubmit}>
            {!isCorporate && activeTab === "Web Dev" && renderSliders(TECH_SKILLS.slice(0, 24), skills, handleTechChange)}
            {!isCorporate && activeTab === "AI/ML" && renderSliders(TECH_SKILLS.slice(24, 44), skills, handleTechChange)}
            {!isCorporate && activeTab === "DevOps" && renderSliders(TECH_SKILLS.slice(44), skills, handleTechChange)}

            {isCorporate && activeTab === "Events" && renderSliders(CORP_SKILLS.slice(0, 5), corpSkills, handleCorpChange)}
            {isCorporate && activeTab === "Media" && renderSliders(CORP_SKILLS.slice(5, 10), corpSkills, handleCorpChange)}
            {isCorporate && activeTab === "Public Relations" && renderSliders(CORP_SKILLS.slice(10, 15), corpSkills, handleCorpChange)}
            {isCorporate && activeTab === "Sponsorships" && renderSliders(CORP_SKILLS.slice(15, 20), corpSkills, handleCorpChange)}
            {isCorporate && activeTab === "Creatives" && renderSliders(CORP_SKILLS.slice(20, 25), corpSkills, handleCorpChange)}
            
            {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-sm">{error}</div>}
          </form>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#0a0f18]">
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/75 transition-all hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="skills-form"
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-3 text-sm font-bold text-black transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Skills"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsEditorModal;
