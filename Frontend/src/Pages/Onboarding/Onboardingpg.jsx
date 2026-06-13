import { useState, useEffect, useRef } from "react";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const steps = ["Basic", "Academic", "Social", "Address"];

/* ---------------- STEPS ---------------- */

function StepOne({ formData, setFormData }) {
  return (
    <div className="space-y-5">
      <FormInput icon="badge" label="Full Name" placeholder="Full Name*" value={formData.name}
        onChange={(val) => setFormData({ ...formData, name: val })} />

      <FormInput icon="id_card" label="Register Number" placeholder="Register Number*" value={formData.regno}
        onChange={(val) => setFormData({ ...formData, regno: val })} />

      <FormInput icon="mail" label="SRM Email" placeholder="xx1234@srmist.edu.in*" type="email" value={formData.email}
        onChange={(val) => setFormData({ ...formData, email: val })} />

      <FormInput icon="call" label="Phone" placeholder="Phone Number*" value={formData.phone}
        onChange={(val) => setFormData({ ...formData, phone: val })} />

      <FormInput icon="key" label="Password" placeholder="Password*" type="password" value={formData.password}
        onChange={(val) => setFormData({ ...formData, password: val })} />
    </div>
  );
}

const ROLE_OPTIONS = [
  { label: "Select Role", value: "" },
  { label: "Member", value: "member" },
  { label: "Associate Lead", value: "associate_lead" },
  { label: "Domain Lead", value: "domain_lead" },
  { label: "Corporate Lead", value: "corp_lead" },
  { label: "Project Lead", value: "project_lead" },
  { label: "Technical Lead", value: "technical_lead" },
  { label: "Joint Secretary", value: "joint_secretary" },
  { label: "Secretary", value: "secretary" },
];

// The 6 team domains used by domain_lead / associate_lead
const TEAM_DOMAINS = [
  { label: "Select Domain", value: "" },
  { label: "AI / ML", value: "AI/ML" },
  { label: "Web Development", value: "Web Development" },
  { label: "App Development", value: "App Development" },
  { label: "Events", value: "Events" },
  { label: "Media", value: "Media" },
  { label: "Sponsorships", value: "Sponsorships" },
];

// Derive coreDomain from a team domain
const DOMAIN_TO_CORE = {
  "AI/ML": "Technical",
  "Web Development": "Technical",
  "App Development": "Technical",
  "Events": "Corporate",
  "Media": "Corporate",
  "Sponsorships": "Corporate",
};

// Roles that manage everything — no domain picker needed
const BROAD_ROLES = ["secretary", "joint_secretary", "project_lead"];
// Roles with a single auto-set coreDomain, no subDomain
const AUTO_CORE_ROLES = { technical_lead: "Technical", corp_lead: "Corporate" };

function StepTwo({ formData, setFormData }) {
  const role = formData.role;

  const handleRoleChange = (val) => {
    const next = { ...formData, role: val, coreDomain: "", subDomain: "" };
    if (AUTO_CORE_ROLES[val])      next.coreDomain = AUTO_CORE_ROLES[val];
    if (BROAD_ROLES.includes(val)) next.coreDomain = "All";
    setFormData(next);
  };

  const handleTeamDomainChange = (val) => {
    setFormData({ ...formData, subDomain: val, coreDomain: DOMAIN_TO_CORE[val] || "" });
  };

  const isAutoDomain     = !!AUTO_CORE_ROLES[role];
  const isBroadRole      = BROAD_ROLES.includes(role);
  const needsSubDomain   = role === "member" && formData.coreDomain;

  const technicalSubDomains = [
    { label: "Select Sub Domain", value: "" },
    { label: "AI / ML",           value: "AI/ML" },
    { label: "Web Development",   value: "Web Development" },
    { label: "App Development",   value: "App Development" },
  ];

  const corporateSubDomains = [
    { label: "Select Sub Domain", value: "" },
    { label: "Events",       value: "Events" },
    { label: "Media",        value: "Media" },
    { label: "Sponsorships", value: "Sponsorships" },
  ];

  return (
    <div className="space-y-5">

      {/* Role always first */}
      <FormSelect
        icon="badge"
        label="Role"
        value={role}
        options={ROLE_OPTIONS}
        onChange={handleRoleChange}
      />

      {/* Secretary / Joint Sec / Project Lead — no domain picker, show scope pill */}
      {isBroadRole && role && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-primary/20 bg-primary/5 text-sm text-white/80">
          <span className="material-symbols-outlined text-primary shrink-0">public</span>
          {role === "project_lead"
            ? "You oversee projects across all domains."
            : "You manage all domains across the organisation."}
        </div>
      )}

      {/* Technical Lead / Corp Lead — auto-set coreDomain, show scope pill */}
      {isAutoDomain && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-primary/20 bg-primary/5 text-sm text-white/80">
          <span className="material-symbols-outlined text-primary shrink-0">auto_awesome</span>
          You manage the entire&nbsp;
          <span className="text-white font-bold">{formData.coreDomain}</span>
          &nbsp;domain.
        </div>
      )}

      {/* Domain Lead — pick which specific domain they lead */}
      {role === "domain_lead" && (
        <FormSelect
          icon="hub"
          label="Domain You Lead"
          value={formData.subDomain}
          options={TEAM_DOMAINS}
          onChange={handleTeamDomainChange}
        />
      )}

      {/* Associate Lead — pick their specific sub-domain */}
      {role === "associate_lead" && (
        <FormSelect
          icon="hub"
          label="Your Sub Domain"
          value={formData.subDomain}
          options={TEAM_DOMAINS}
          onChange={handleTeamDomainChange}
        />
      )}

      {/* Member — pick Core Domain first, then Sub Domain */}
      {role === "member" && (
        <FormSelect
          icon="category"
          label="Core Domain"
          value={formData.coreDomain}
          options={[
            { label: "Select Core Domain", value: "" },
            { label: "Technical",          value: "Technical" },
            { label: "Corporate",          value: "Corporate" },
          ]}
          onChange={(val) => setFormData({ ...formData, coreDomain: val, subDomain: "" })}
        />
      )}

      {needsSubDomain && (
        <FormSelect
          icon="hub"
          label="Sub Domain"
          value={formData.subDomain}
          options={formData.coreDomain === "Corporate" ? corporateSubDomains : technicalSubDomains}
          onChange={(val) => setFormData({ ...formData, subDomain: val })}
        />
      )}

    </div>
  );
}

function StepThree({ formData, setFormData }) {
  return (
    <div className="space-y-5">
      <FormInput icon="link" label="LinkedIn" placeholder="LinkedIn*" value={formData.linkedin}
        onChange={(val) => setFormData({ ...formData, linkedin: val })} />

      <FormInput icon="photo_camera" label="Instagram" placeholder="Instagram" value={formData.instagram}
        onChange={(val) => setFormData({ ...formData, instagram: val })} />

      <FormInput icon="code" label="GitHub" placeholder="GitHub*" value={formData.github}
        onChange={(val) => setFormData({ ...formData, github: val })} />

      <FormTextArea icon="edit_note" label="Bio" placeholder="Short Bio" rows={4}
        value={formData.bio}
        onChange={(val) => setFormData({ ...formData, bio: val })} />
    </div>
  );
}

function StepFour({ formData, setFormData }) {
  return (
    <FormTextArea icon="location_on" label="Address" placeholder="Address*" rows={3}
      value={formData.address}
      onChange={(val) => setFormData({ ...formData, address: val })} />
  );
}

/*MAIN*/

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [flipPhase, setFlipPhase] = useState("idle"); // "idle" | "out" | "in"
  const [flipDir, setFlipDir] = useState(1); // 1 = next (right), -1 = back (left)
  const [submittedRole, setSubmittedRole] = useState(null); // stores role after successful submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingStepRef = useRef(null);
  const cardRef = useRef(null);

  const sceneRef = useRef(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const dotFieldRef = useRef({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef(null);
  const currentOffsetRef = useRef({ x: 0, y: 0 });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    regno: "",
    password: "",
    coreDomain: "",
    subDomain: "",
    role: "",
    linkedin: "",
    instagram: "",
    github: "",
    address: "",
    bio: ""
  });

  /* Card flip: when "out" transition ends, swap content and flip back in */
  const handleCardTransitionEnd = (e) => {
    if (e.propertyName !== "transform") return;

    if (flipPhase === "out") {
      // Card is now edge-on at 90° — swap the content
      setStep(pendingStepRef.current);
      // Instantly jump to the opposite edge (-90°) with no transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlipPhase("in"); // triggers smooth transition from -90° → 0°
        });
      });
    } else if (flipPhase === "in") {
      // Flip complete — back to idle
      setFlipPhase("idle");
    }
  };

  /* Navigate with flip */
  const navigateStep = (direction) => {
    if (flipPhase !== "idle") return;
    const next = direction === "next" ? step + 1 : step - 1;
    if (next < 0 || next >= steps.length) return;

    if (direction === "next") {
      if (step === 0) {
        if (!formData.name.trim()) {
          toast.error("Full Name is required.");
          return;
        }
        if (!formData.regno.trim()) {
          toast.error("Register Number is required.");
          return;
        }
        const srmEmailRegex = /^[a-zA-Z]{2}\d{4}@srmist\.edu\.in$/;
        if (!formData.email.trim() || !srmEmailRegex.test(formData.email.trim())) {
          toast.error("Please enter a valid SRM email (e.g. xx1234@srmist.edu.in).");
          return;
        }
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim().replace(/[\s-]/g, ""))) {
          toast.error("Please enter a valid Phone Number (10 to 15 digits).");
          return;
        }
        if (formData.password.length < 8) {
          toast.error("Password must be at least 8 characters long.");
          return;
        }
      } else if (step === 1) {
        if (!formData.role) {
          toast.error("Please select your role.");
          return;
        }
        const r = formData.role;
        if (r === "domain_lead" || r === "associate_lead") {
          if (!formData.subDomain) {
            toast.error(`Please select the domain for your ${r === "domain_lead" ? "Domain Lead" : "Associate Lead"} role.`);
            return;
          }
        } else if (r === "member") {
          if (!formData.coreDomain) {
            toast.error("Core Domain is required.");
            return;
          }
          if (!formData.subDomain) {
            toast.error("Sub Domain is required.");
            return;
          }
        }
        // secretary, joint_secretary, project_lead, technical_lead, corp_lead
        // — coreDomain is auto-set or not required, no further validation needed
      } else if (step === 2) {
        if (!formData.linkedin.trim() || !formData.linkedin.includes("linkedin.com")) {
          toast.error("A valid LinkedIn profile URL is required.");
          return;
        }
        if (!formData.github.trim() || !formData.github.includes("github.com")) {
          toast.error("A valid GitHub profile URL is required.");
          return;
        }
      }
    }

    pendingStepRef.current = next;
    setFlipDir(direction === "next" ? 1 : -1);
    setFlipPhase("out"); // starts the flip-out transition
  };

  /* Compute the card's rotateY based on phase */
  const getCardTransform = () => {
    if (flipPhase === "out") return `rotateY(${90 * flipDir}deg)`;
    if (flipPhase === "in") return "rotateY(0deg)";
    return "rotateY(0deg)";
  };

  /* Transition timing: smooth ease for out & in, none during the instant jump */
  const getCardTransition = () => {
    if (flipPhase === "out") return "transform 0.3s ease-in";
    if (flipPhase === "in") return "transform 0.3s ease-out";
    return "transform 0.3s ease-out";
  };

  /*background animation*/
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;

    scene.style.setProperty("--pointer-x", "50%");
    scene.style.setProperty("--pointer-y", "50%");
    scene.style.setProperty("--dot-cluster-x", "50%");
    scene.style.setProperty("--dot-cluster-y", "50%");
    scene.style.setProperty("--parallax-x", "0px");
    scene.style.setProperty("--parallax-y", "0px");
    scene.style.setProperty("--parallax-x-soft", "0px");
    scene.style.setProperty("--parallax-y-soft", "0px");

    const animate = () => {
      const targetX = (pointerRef.current.x - 0.5) * 36;
      const targetY = (pointerRef.current.y - 0.5) * 36;

      currentOffsetRef.current.x += (targetX - currentOffsetRef.current.x) * 0.08;
      currentOffsetRef.current.y += (targetY - currentOffsetRef.current.y) * 0.08;
      dotFieldRef.current.x += (pointerRef.current.x - dotFieldRef.current.x) * 0.12;
      dotFieldRef.current.y += (pointerRef.current.y - dotFieldRef.current.y) * 0.12;

      scene.style.setProperty("--pointer-x", `${pointerRef.current.x * 100}%`);
      scene.style.setProperty("--pointer-y", `${pointerRef.current.y * 100}%`);
      scene.style.setProperty("--dot-cluster-x", `${dotFieldRef.current.x * 100}%`);
      scene.style.setProperty("--dot-cluster-y", `${dotFieldRef.current.y * 100}%`);
      scene.style.setProperty("--parallax-x", `${currentOffsetRef.current.x}px`);
      scene.style.setProperty("--parallax-y", `${currentOffsetRef.current.y}px`);
      scene.style.setProperty("--parallax-x-soft", `${currentOffsetRef.current.x * 0.45}px`);
      scene.style.setProperty("--parallax-y-soft", `${currentOffsetRef.current.y * 0.45}px`);

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /* When flipPhase goes to "in", instantly set the card to -90° first (no transition),
     then on next frame enable the transition so it animates to 0° */
  useEffect(() => {
    if (flipPhase === "in" && cardRef.current) {
      // Instantly jump to the opposite side (no transition)
      cardRef.current.style.transition = "none";
      cardRef.current.style.transform = `rotateY(${-90 * flipDir}deg)`;

      // Force reflow so the browser registers the jump
      void cardRef.current.offsetHeight;

      // Now enable the smooth transition to 0°
      cardRef.current.style.transition = "transform 0.3s ease-out";
      cardRef.current.style.transform = "rotateY(0deg)";
    }
  }, [flipPhase, flipDir]);

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    };
  };

  const handlePointerLeave = () => {
    pointerRef.current = { x: 0.5, y: 0.5 };
  };

  const submitForm = async () => {
    if (isSubmitting) return;

    if (!formData.address.trim()) {
      toast.error("Address is required.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      regNum: formData.regno,
      email: formData.email.toLowerCase(),
      phoneNumber: formData.phone,
      password: formData.password,
      coreDomain: formData.coreDomain,
      subDomain: formData.subDomain,
      role: formData.role,
      address: formData.address,
      bio: formData.bio,
      socials: {
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        github: formData.github
      }
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/user/create`,
        payload
      );

      // Show success overlay — do NOT redirect to login since account needs approval first
      setSubmittedRole(formData.role || "member");

    } catch (err) {
      setIsSubmitting(false);
      toast.error(err.response?.data?.error || "Onboarding failed. Please try again.");
      console.error(err);
    }
  };

  const isAnimating = flipPhase !== "idle";

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen flex flex-col">
      <ToastContainer />

      {/* Success Launch Overlay */}
      {submittedRole && (() => {
        const isAdminRole = submittedRole === "secretary" || submittedRole === "joint_secretary";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-[40px] overlay-fade-in">
            <div className="flex flex-col items-center popup-anim px-6 max-w-md text-center">
              <div className="text-7xl sm:text-8xl mb-6 filter drop-shadow-[0_0_40px_rgba(241,131,255,0.8)]">
                ✅
              </div>
              <h2 className="text-3xl sm:text-4xl font-headline font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
                Registration Complete!
              </h2>
              <p className="text-on-surface-variant font-label text-base mt-4 leading-relaxed">
                Your application has been submitted successfully.
              </p>

              {isAdminRole ? (
                <>
                  <p className="text-on-surface font-semibold text-sm mt-2">
                    Admin account requests are reviewed by an existing administrator or the system owner.
                  </p>
                  <p className="text-on-surface-variant text-xs mt-3 leading-relaxed opacity-70">
                    If you are the first Secretary, ask your system admin to approve your account directly in the database, or run the seed script.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-on-surface font-semibold text-sm mt-2">
                    Awaiting approval from the Secretary.
                  </p>
                  <p className="text-on-surface-variant text-xs mt-3 leading-relaxed opacity-70">
                    You will receive an email once your account is approved. You can then log in to the portal.
                  </p>
                </>
              )}

              <a
                href="/login"
                className="mt-8 inline-block bg-gradient-to-r from-primary to-secondary text-black font-bold text-sm px-8 py-3 rounded-full shadow-[0_8px_20px_rgba(241,131,255,0.35)] hover:-translate-y-0.5 transition-all"
              >
                Back to Login
              </a>
            </div>
          </div>
        );
      })()}

      <main
        ref={sceneRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="interactive-login-scene flex-grow flex items-center justify-center relative overflow-hidden px-6 py-12"
      >
        {/*Ambient Background*/}
        <div className="interactive-dot-field absolute inset-0 z-0"></div>
        <div className="interactive-spotlight absolute inset-0 z-0"></div>
        <div className="absolute inset-0 bg-grid z-0"></div>
        <div className="interactive-glow-primary absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] z-0"></div>
        <div className="interactive-glow-secondary absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] z-0"></div>

        {/* Onboarding Container */}
        <div className="relative z-10 w-full max-w-[560px]">

          {/* Branding Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-block p-1 rounded-2xl bg-surface-container-lowest recessed-void mb-4 sm:mb-5">
              <div className="px-6 sm:px-8 py-3 sm:py-4 bg-surface-variant/40 backdrop-blur-[20px] rounded-xl border border-white/5">
                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#f183ff] to-[#ff6c95] bg-clip-text text-transparent tracking-tighter font-headline">
                  Onboarding
                </span>
              </div>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-on-surface mb-2">
              Join the Team
            </h1>
            <p className="text-on-surface-variant font-label tracking-wide text-xs sm:text-sm">
              Step {step + 1} of {steps.length} — {steps[step]}
            </p>
          </div>

          {/* Step Progress Bar */}
          <div className="flex gap-2 mb-8 justify-center">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <div
                  className={`h-1.5 w-12 rounded-full transition-all duration-500 ${i < step
                    ? "bg-gradient-to-r from-primary to-secondary"
                    : i === step
                      ? "bg-gradient-to-r from-primary to-secondary animate-pulse"
                      : "bg-outline-variant/30"
                    }`}
                />
              </div>
            ))}
          </div>

          {/* Prismatic Glass Card with 3D Flip */}
          <div style={{ perspective: "1200px" }}>
            <div
              ref={cardRef}
              onTransitionEnd={handleCardTransitionEnd}
              className="prismatic-edge interactive-glass-card bg-surface-variant/60 backdrop-blur-[24px] rounded-3xl p-6 sm:p-10 shadow-[0_30px_60px_-15px_rgba(241,131,255,0.06)]"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                transform: getCardTransform(),
                transition: getCardTransition(),
              }}
            >

              {step === 0 && <StepOne formData={formData} setFormData={setFormData} />}
              {step === 1 && <StepTwo formData={formData} setFormData={setFormData} />}
              {step === 2 && <StepThree formData={formData} setFormData={setFormData} />}
              {step === 3 && <StepFour formData={formData} setFormData={setFormData} />}

              {/* Navigation */}
              <div className="flex justify-between mt-10 gap-4">
                <button
                  disabled={step === 0 || isAnimating || isSubmitting}
                  onClick={() => navigateStep("back")}
                  className="flex-1 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-30 disabled:hover:scale-100 font-label text-sm"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Back
                </button>

                <button
                  disabled={isAnimating || isSubmitting}
                  onClick={() =>
                    step === steps.length - 1 ? submitForm() : navigateStep("next")
                  }
                  className="flex-[2] bg-gradient-to-r from-primary to-secondary text-on-primary-fixed font-headline font-bold py-4 rounded-full shadow-[0_10px_20px_-5px_rgba(241,131,255,0.4)] active:scale-95 transition-all duration-300 group overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? "Processing..." : (step === steps.length - 1 ? "Launch Profile" : "Continue")}
                    {!isSubmitting && (
                      <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                        {step === steps.length - 1 ? "rocket_launch" : "arrow_forward"}
                      </span>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className="mt-8 text-center px-4">
            <p className="text-xs text-outline/60 leading-relaxed">
              Your information is securely processed within the SQAC system.
              By completing onboarding, you agree to our team policies.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-10 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 bg-[#0f0d16] font-body text-sm tracking-wide z-10">
        <div className="text-slate-500">© {new Date().getFullYear()} SQAC Portal.</div>
        <p className="text-slate-500 italic text-xs">Where Code Meets Quality</p>
      </footer>
    </div>
  );
}

/*INPUTS*/

function FormInput({ icon, label, placeholder, value, onChange, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
        {label}
      </label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl group-focus-within:text-primary transition-colors">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface-container-highest border border-outline-variant/15 rounded-xl py-4 pl-12 pr-4 font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/50"
        />
      </div>
    </div>
  );
}

function FormTextArea({ icon, label, placeholder, rows, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
        {label}
      </label>
      <div className="relative group">
        <span className="absolute left-4 top-4 material-symbols-outlined text-outline text-xl group-focus-within:text-primary transition-colors">
          {icon}
        </span>
        <textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface-container-highest border border-outline-variant/15 rounded-xl py-4 pl-12 pr-4 font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/50 resize-none"
        />
      </div>
    </div>
  );
}

function FormSelect({ icon, label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
        {label}
      </label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl group-focus-within:text-primary transition-colors">
          {icon}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface-container-highest border border-outline-variant/15 rounded-xl py-4 pl-12 pr-4 font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none text-on-surface"
        >
          {options.map((opt, i) => (
            <option key={i} value={opt.value} className="bg-surface-container-highest">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline pointer-events-none">
          expand_more
        </span>
      </div>
    </div>
  );
}
