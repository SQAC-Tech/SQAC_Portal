import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const RESET_STEPS = {
  email: "email",
  otp: "otp",
  password: "password",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState(RESET_STEPS.email);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const sceneRef = useRef(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const dotFieldRef = useRef({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef(null);
  const currentOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) {
      return undefined;
    }

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

      currentOffsetRef.current.x +=
        (targetX - currentOffsetRef.current.x) * 0.08;
      currentOffsetRef.current.y +=
        (targetY - currentOffsetRef.current.y) * 0.08;
      dotFieldRef.current.x +=
        (pointerRef.current.x - dotFieldRef.current.x) * 0.12;
      dotFieldRef.current.y +=
        (pointerRef.current.y - dotFieldRef.current.y) * 0.12;

      scene.style.setProperty("--pointer-x", `${pointerRef.current.x * 100}%`);
      scene.style.setProperty("--pointer-y", `${pointerRef.current.y * 100}%`);
      scene.style.setProperty(
        "--dot-cluster-x",
        `${dotFieldRef.current.x * 100}%`,
      );
      scene.style.setProperty(
        "--dot-cluster-y",
        `${dotFieldRef.current.y * 100}%`,
      );
      scene.style.setProperty(
        "--parallax-x",
        `${currentOffsetRef.current.x}px`,
      );
      scene.style.setProperty(
        "--parallax-y",
        `${currentOffsetRef.current.y}px`,
      );
      scene.style.setProperty(
        "--parallax-x-soft",
        `${currentOffsetRef.current.x * 0.45}px`,
      );
      scene.style.setProperty(
        "--parallax-y-soft",
        `${currentOffsetRef.current.y * 0.45}px`,
      );

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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

  const openResetFlow = () => {
    setResetEmail(email);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResetMessage("");
    setResetError("");
    setResetStep(RESET_STEPS.email);
    setIsResetOpen(true);
  };

  const closeResetFlow = () => {
    setIsResetOpen(false);
    setResetMessage("");
    setResetError("");
    setResetStep(RESET_STEPS.email);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setIsSubmittingReset(false);
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    setResetError("");
    setResetMessage("");
    setIsSubmittingReset(true);

    try {
      const response = await fetch(`${API_BASE_URL}/otp/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResetError(data.message || "Unable to send OTP.");
        return;
      }

      setResetMessage(data.message || "OTP sent to your email.");
      setResetStep(RESET_STEPS.otp);
    } catch (requestError) {
      setResetError("Network error. Please try again.");
      console.error("OTP request error:", requestError);
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setResetError("");
    setResetMessage("");
    setIsSubmittingReset(true);

    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResetError(data.message || "Unable to verify OTP.");
        return;
      }

      setResetMessage(data.message || "OTP verified.");
      setResetStep(RESET_STEPS.password);
    } catch (verifyError) {
      setResetError("Network error. Please try again.");
      console.error("OTP verification error:", verifyError);
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setResetError("");
    setResetMessage("");

    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setIsSubmittingReset(true);

    try {
      const response = await fetch(`${API_BASE_URL}/password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResetError(data.message || "Unable to reset password.");
        return;
      }

      setResetMessage(data.message || "Password reset successful.");
      setPassword("");
      setEmail(resetEmail.trim().toLowerCase());
      window.setTimeout(() => {
        closeResetFlow();
      }, 1200);
    } catch (resetRequestError) {
      setResetError("Network error. Please try again.");
      console.error("Password reset error:", resetRequestError);
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href =
          data.user?.role === "admin" ? "/admin/members" : "/";
      } else {
        setError(data.message || data.error || "Login failed");
      }
    } catch (loginError) {
      setError("Network error. Please try again.");
      console.error("Login error:", loginError);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen flex flex-col">
      <main
        ref={sceneRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="interactive-login-scene flex-grow flex items-center justify-center relative overflow-hidden px-6"
      >
        <div className="interactive-dot-field absolute inset-0 z-0"></div>
        <div className="interactive-spotlight absolute inset-0 z-0"></div>
        <div className="absolute inset-0 bg-grid z-0"></div>
        <div className="interactive-glow-primary absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] z-0"></div>
        <div className="interactive-glow-secondary absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] z-0"></div>

        <div className="relative z-10 w-full max-w-[480px]">
          <div className="mb-10 text-center">
            <div className="inline-block p-1 rounded-2xl bg-surface-container-lowest recessed-void mb-6">
              <div className="px-8 py-4 bg-surface-variant/40 backdrop-blur-[20px] rounded-xl border border-white/5">
                <span className="text-3xl font-black bg-gradient-to-r from-[#f183ff] to-[#ff6c95] bg-clip-text text-transparent tracking-tighter font-headline">
                  Login
                </span>
              </div>
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-2">
              Initialize Session
            </h1>
            <p className="text-on-surface-variant font-label tracking-wide text-sm">
              Welcome back to your Creative Space
            </p>
          </div>

          <div className="prismatic-edge interactive-glass-card bg-surface-variant/60 backdrop-blur-[24px] rounded-3xl p-10 shadow-[0_30px_60px_-15px_rgba(241,131,255,0.06)]">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <p className="text-error text-sm text-center font-bold bg-error/10 p-2 rounded-md">
                  {error}
                </p>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                  Access Identity
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl group-focus-within:text-primary transition-colors">
                    fingerprint
                  </span>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/15 rounded-xl py-4 pl-12 pr-4 font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/50"
                    placeholder="Email address"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1 gap-4">
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
                    Security Cipher
                  </label>
                  <button
                    type="button"
                    onClick={openResetFlow}
                    className="text-xs font-label text-primary hover:text-secondary transition-colors"
                  >
                    Reset Password
                  </button>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl group-focus-within:text-primary transition-colors">
                    key
                  </span>
                  <input
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/15 rounded-xl py-4 pl-12 pr-4 font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/50"
                    placeholder="........"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary-fixed font-headline font-bold py-5 rounded-full shadow-[0_10px_20px_-5px_rgba(241,131,255,0.4)] active:scale-95 transition-all duration-300 group overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Enter Portal
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4 text-center">
              <div className="h-px flex-grow bg-outline-variant/20"></div>
              <span className="text-xs font-label text-outline uppercase tracking-widest">
                External Auth
              </span>
              <div className="h-px flex-grow bg-outline-variant/20"></div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                to="/onboarding"
                className="flex-1 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-xl">
                  person_add
                </span>
                <span className="font-label text-sm">Sign Up</span>
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center px-4">
            <p className="text-xs text-outline/60 leading-relaxed">
              By entering the portal, you acknowledge the technical monitoring
              of all SQAC metrics within the system environment.
            </p>
          </div>
        </div>

        {isResetOpen && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07050d]/70 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface-variant/85 backdrop-blur-[24px] p-8 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.45)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-headline text-2xl font-bold text-on-surface">
                    Reset Password
                  </h2>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {resetStep === RESET_STEPS.email &&
                      "Request a one-time code for your account email."}
                    {resetStep === RESET_STEPS.otp &&
                      "Enter the OTP sent to your email address."}
                    {resetStep === RESET_STEPS.password &&
                      "Set a new password for your account."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeResetFlow}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="mt-6 flex gap-2">
                {Object.values(RESET_STEPS).map((step, index) => {
                  const isActive = resetStep === step;
                  const isCompleted =
                    Object.values(RESET_STEPS).indexOf(resetStep) > index;

                  return (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        isActive || isCompleted
                          ? "bg-primary"
                          : "bg-white/10"
                      }`}
                    ></div>
                  );
                })}
              </div>

              {resetError && (
                <p className="mt-6 text-sm text-center font-bold bg-error/10 text-error p-2 rounded-md">
                  {resetError}
                </p>
              )}

              {resetMessage && (
                <p className="mt-6 text-sm text-center font-bold bg-primary/10 text-primary p-2 rounded-md">
                  {resetMessage}
                </p>
              )}

              {resetStep === RESET_STEPS.email && (
                <form className="mt-6 space-y-5" onSubmit={requestOtp}>
                  <div className="space-y-2">
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/15 rounded-xl py-4 px-4 font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/50"
                      placeholder="Email address"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary-fixed font-headline font-bold py-4 rounded-full disabled:opacity-60"
                  >
                    {isSubmittingReset ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              )}

              {resetStep === RESET_STEPS.otp && (
                <form className="mt-6 space-y-5" onSubmit={verifyOtp}>
                  <div className="space-y-2">
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/15 rounded-xl py-4 px-4 font-body tracking-[0.35em] text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/50"
                      placeholder="123456"
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setResetStep(RESET_STEPS.email);
                        setResetMessage("");
                        setResetError("");
                      }}
                      className="flex-1 border border-outline-variant/20 text-on-surface py-4 rounded-full"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReset}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary text-on-primary-fixed font-headline font-bold py-4 rounded-full disabled:opacity-60"
                    >
                      {isSubmittingReset ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                </form>
              )}

              {resetStep === RESET_STEPS.password && (
                <form className="mt-6 space-y-5" onSubmit={resetPassword}>
                  <div className="space-y-2">
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/15 rounded-xl py-4 px-4 font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/50"
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/15 rounded-xl py-4 px-4 font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/50"
                      placeholder="Re-enter password"
                      minLength={8}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary-fixed font-headline font-bold py-4 rounded-full disabled:opacity-60"
                  >
                    {isSubmittingReset ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-12 px-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 bg-[#0f0d16] font-manrope text-sm tracking-wide z-10">
        <div className="text-slate-500">(c) 2026 SQAC Portal.</div>
        <nav className="flex gap-8">
          <Link
            to="#"
            className="text-slate-500 hover:text-[#ff6c95] transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link
            to="#"
            className="text-slate-500 hover:text-[#ff6c95] transition-colors duration-200"
          >
            Terms of Service
          </Link>
          <Link
            to="#"
            className="text-[#f183ff] underline decoration-2 underline-offset-4"
          >
            System Status
          </Link>
        </nav>
      </footer>
    </div>
  );
}
