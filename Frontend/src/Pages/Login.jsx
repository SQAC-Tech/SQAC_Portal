import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("Login successful");
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Login error:", error);
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
        {/* Ambient Background */}
        <div className="interactive-dot-field absolute inset-0 z-0"></div>
        <div className="interactive-spotlight absolute inset-0 z-0"></div>
        <div className="absolute inset-0 bg-grid z-0"></div>
        <div className="interactive-glow-primary absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] z-0"></div>
        <div className="interactive-glow-secondary absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] z-0"></div>

        {/* Login Container */}
        <div className="relative z-10 w-full max-w-[480px]">
          {/* Branding Header */}
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

          {/* Prismatic Glass Card */}
          <div className="prismatic-edge interactive-glass-card bg-surface-variant/60 backdrop-blur-[24px] rounded-3xl p-10 shadow-[0_30px_60px_-15px_rgba(241,131,255,0.06)]">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <p className="text-error text-sm text-center font-bold bg-error/10 p-2 rounded-md">
                  {error}
                </p>
              )}

              {/* Input: Username */}
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

              {/* Input: Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
                    Security Cipher
                  </label>
                  <Link
                    to="#"
                    className="text-xs font-label text-primary hover:text-secondary transition-colors"
                  >
                    Reset Password
                  </Link>
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
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Action: Submit */}
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

            {/* Footer Context */}
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

          {/* Bottom Disclaimer */}
          <div className="mt-8 text-center px-4">
            <p className="text-xs text-outline/60 leading-relaxed">
              By entering the portal, you acknowledge the technical monitoring
              of all SQAC metrics within the system environment.
            </p>
          </div>
        </div>
      </main>

      {/* Shared Footer Component */}
      <footer className="w-full py-12 px-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 bg-[#0f0d16] font-manrope text-sm tracking-wide z-10">
        <div className="text-slate-500">© 2026 SQAC Portal.</div>
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
