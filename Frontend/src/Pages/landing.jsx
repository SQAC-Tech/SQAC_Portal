import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/LogoSQAC-Cntu4jgR.png";
import Seo from "../components/common/Seo";

const ORG_JSON_LD = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Software Quality Assurance Community",
    alternateName: "SQAC",
    url: "https://portal.sqac.space/",
    logo: "https://portal.sqac.space/pwa-512x512.png",
    description:
        "The SQAC Portal is the Software Quality Assurance Community's member hub for projects, meetings, attendance, minutes of meeting and certificates.",
};

const LETTERS = [
    { char: "S", word: "SOFTWARE", grad: ["#f183ff", "#a855f7"] },
    { char: "Q", word: "QUALITY", grad: ["#ff6c95", "#e11d74"] },
    { char: "A", word: "ASSURANCE", grad: ["#81ecff", "#06b6d4"] },
    { char: "C", word: "COMMUNITY", grad: ["#f183ff", "#ff6c95"] },
];                      

const FEATURES = [  
    { icon: "⚡", title: "Role-Based Access", num: "01", desc: "Members, domain leads, admins each with tailored dashboards and permissions that mirror your club's real hierarchy." },
    { icon: "💬", title: "Realtime Chat", num: "02", desc: "Group channels and private threads powered by Socket.IO decisions made instantly, zero third-party apps." },
    { icon: "🗂️", title: "Tasks & Projects", num: "03", desc: "Assign, track and ship deliverables across domains. Admin-powered workflows, member-visible progress." },
    { icon: "🏅", title: "Certificates", num: "04", desc: "Generate and distribute achievement certificates in one click, backed by Firebase and email delivery." },
    { icon: "📢", title: "Notice Board", num: "05", desc: "Push announcements with realtime socket notifications every member notified the moment it's posted." },
    { icon: "📊", title: "Attendance & Meetings", num: "06", desc: "Schedule meetings, track attendance, save minutes all tied to each member's profile automatically." },
];


function useInView(ref, threshold = 0.15) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setVisible(true); },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return visible;
}

function ScrollLetterSequence() {
    const wrapperRef = useRef(null);
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const onScroll = () => {
            const wrapTop = wrapper.offsetTop;
            const scrolled = window.scrollY - wrapTop;
            const scrollable = wrapper.offsetHeight - window.innerHeight;

            const progress = Math.min(1, Math.max(0, scrolled / scrollable));

            let p;

            if (progress < 0.2) p = 0;
            else if (progress < 0.4) p = 1;
            else if (progress < 0.6) p = 2;
            else if (progress < 0.8) p = 3;
            else p = 4;

            setPhase(p);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const merged = phase === 4;

    return (
        <div ref={wrapperRef} style={{ height: "500vh" }}>
            <div className="sticky top-0 w-full overflow-hidden bg-background flex flex-col items-center justify-center" style={{ height: "100vh" }}>

                <div className="bg-grid absolute inset-0 pointer-events-none opacity-50" />

                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-700"
                    style={{
                        background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(241,131,255,0.06), transparent 70%)",
                        opacity: merged ? 0.3 : 0.2,
                    }}
                />

                {/* ── SINGLE LETTER PANELS ── */}
                {LETTERS.map((l, i) => {
                    const active = !merged && phase === i;
                    return (
                        <div
                            key={l.char}
                            className="absolute inset-0 flex flex-col items-center justify-center"
                            style={{
                                opacity: active ? 1 : 0,
                                transform: active
                                    ? "translateY(0px) scale(1)"
                                    : phase > i
                                        ? "translateY(-60px) scale(0.9)"
                                        : "translateY(60px) scale(0.9)",
                                transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                                pointerEvents: active ? "auto" : "none",
                            }}
                        >
                            <span
                                className="font-headline font-black select-none"
                                style={{
                                    fontSize: "clamp(160px, 28vw, 290px)",
                                    background: `linear-gradient(160deg, ${l.grad[0]}, ${l.grad[1]})`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    filter: `drop-shadow(0 0 70px ${l.grad[0]}55)`,
                                }}
                            >
                                {l.char}
                            </span>

                            <span className="mt-5 font-label text-sm tracking-[0.3em] text-on-surface-variant">
                                {l.word}
                            </span>
                        </div>
                    );
                })}

                <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{
                        opacity: merged ? 1 : 0,
                        pointerEvents: merged ? "auto" : "none",
                        transition: "opacity 0.6s ease",
                    }}
                >
                    <div className="flex items-end justify-center">
                        {LETTERS.map((l, i) => (
                            <span
                                key={l.char}
                                className="font-headline font-black select-none"
                                style={{
                                    fontSize: "clamp(80px, 17vw, 190px)",
                                    background: `linear-gradient(160deg, ${l.grad[0]}, ${l.grad[1]})`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    filter: `drop-shadow(0 0 40px ${l.grad[0]}55)`,
                                    opacity: merged ? 1 : 0,
                                    transform: merged ? "translateY(0) scale(1)" : "translateY(40px) scale(0.8)",
                                    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms`,
                                }}
                            >
                                {l.char}
                            </span>
                        ))}
                    </div>

                    <p className="mt-7 font-label text-sm tracking-[0.28em] uppercase text-on-surface-variant">
                        One Portal. Every Role. Every Story.
                    </p>

                    <Link
                        to="/login"
                        className="mt-10 px-10 py-4 rounded-full font-headline font-bold text-sm text-on-primary-fixed
                        bg-gradient-to-r from-primary to-secondary"
                    >
                        Enter Portal →
                    </Link>
                </div>

            </div>
        </div>
    );
}

function Hero() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Flip after the initial opacity:0 frame has painted, so the CSS
        // transition always has a "from" state to animate from.
        let raf2;
        const raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => setReady(true));
        });
        return () => {
            cancelAnimationFrame(raf1);
            if (raf2) cancelAnimationFrame(raf2);
        };
    }, []);

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16 overflow-hidden">

            {/* background effects */}
            <div className="bg-grid absolute inset-0 pointer-events-none z-0" />
            <div className="absolute -top-40 -right-20 w-[520px] h-[520px] rounded-full bg-primary/10 blur-[130px]" />
            <div className="absolute -bottom-24 -left-20 w-[440px] h-[440px] rounded-full bg-secondary/10 blur-[110px]" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-5xl w-full">

                {/* tagline */}
                <span
                    className="font-label text-[11px] tracking-[0.26em] uppercase text-primary mb-8"
                    style={{
                        opacity: ready ? 1 : 0,
                        transform: ready ? "none" : "translateY(-8px)",
                        transition: "all 0.6s ease 0.15s"
                    }}
                >
                    SOFTWARE QUALITY ASSURANCE COMMUNITY · CLUB PORTAL
                </span>

                {/* SQAC letters */}
                <div className="flex items-end justify-center gap-3 md:gap-5 mb-10">
                    {LETTERS.map((l, i) => (
                        <div key={l.char} className="flex flex-col items-center gap-2">
                            <span
                                className="font-headline font-black select-none"
                                style={{
                                    fontSize: "clamp(60px, 11vw, 136px)",
                                    lineHeight: 1,
                                    background: `linear-gradient(160deg, ${l.grad[0]}, ${l.grad[1]})`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    filter: "drop-shadow(0 0 28px rgba(241,131,255,0.22))",
                                    opacity: ready ? 1 : 0,
                                    transform: ready ? "translateY(0)" : "translateY(40px)",
                                    transition: `opacity 0.7s ease ${200 + i * 110}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${200 + i * 110}ms`,
                                }}
                            >
                                {l.char}
                            </span>

                            <span
                                className="font-label text-[9px] tracking-[0.2em] uppercase text-on-surface-variant/60"
                                style={{
                                    opacity: ready ? 1 : 0,
                                    transition: `opacity 0.6s ease ${580 + i * 90}ms`
                                }}
                            >
                                {l.word}
                            </span>
                        </div>
                    ))}
                </div>

                {/* description */}
                <p
                    className="font-body text-on-surface-variant text-base md:text-lg leading-relaxed max-w-md mb-10"
                    style={{
                        opacity: ready ? 1 : 0,
                        transform: ready ? "none" : "translateY(18px)",
                        transition: "all 0.75s ease 820ms"
                    }}
                >
                    Your creative club's command center tasks, projects, chat, and certifications, unified in one place.
                </p>

                {/* buttons */}
                <div
                    className="flex gap-4 flex-wrap justify-center"
                    style={{
                        opacity: ready ? 1 : 0,
                        transform: ready ? "none" : "translateY(18px)",
                        transition: "all 0.75s ease 1020ms"
                    }}
                >
                    <Link
                        to="/login"
                        className="px-10 py-4 rounded-full font-headline font-bold text-sm text-on-primary-fixed
                        bg-gradient-to-r from-primary to-secondary
                        shadow-[0_0_36px_rgba(241,131,255,0.3)]
                        hover:shadow-[0_0_56px_rgba(241,131,255,0.52)]
                        hover:scale-[1.03] active:scale-95 transition-all duration-200"
                    >
                        Enter Portal →
                    </Link>
                </div>

                <div
                    className="flex flex-col items-center gap-3 mt-14"
                    style={{
                        opacity: ready ? 0.7 : 0,
                        transition: "opacity 0.7s ease 1280ms"
                    }}
                >
                    <div className="w-px h-12 bg-gradient-to-b from-outline to-transparent animate-pulse" />
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ f, delay }) {
    const ref = useRef(null);
    const inView = useInView(ref);
    return (
        <div
            ref={ref}
            className="group relative bg-surface-container border border-primary/[0.06] p-8 md:p-10 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_60px_rgba(241,131,255,0.35)] hover:-translate-y-1"
            style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(26px)", transitionDelay: `${delay}ms` }}
        >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-lg mb-5">{f.icon}</div>
            <h3 className="font-headline text-lg md:text-xl font-bold text-on-surface mb-2">{f.title}</h3>
            <p className="font-body text-sm md:text-[15px] leading-relaxed text-on-surface-variant">{f.desc}</p>
        </div>
    );
}


export default function LandingPage() {
    return (
        <div className="bg-background text-on-surface overflow-x-clip">
            <Seo
                title=""
                description="The SQAC Portal is the Software Quality Assurance Community's member hub for projects, meetings, attendance, minutes of meeting and certificates — one place for every role."
                path="/"
                jsonLd={ORG_JSON_LD}
            />
            <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12 py-4
                        bg-background/70 backdrop-blur-xl border-b border-white/5">

                {/* LOGO (TOP LEFT) */}
                <Link to="/">
                    <img
                        src={logo}
                        alt="SQAC Logo"
                        className="h-10 w-auto object-contain cursor-pointer transition duration-200 hover:scale-105"
                    />
                </Link>

                {/* RIGHT SIDE BUTTON */}
                <Link
                    to="/login"
                    className="text-sm font-bold text-primary hover:opacity-80 transition"
                >
                    Enter →
                </Link>
            </nav>

            <Hero />
            <ScrollLetterSequence />

            <section className="px-6 md:px-12 py-16 md:py-20 max-w-7xl mx-auto">
                <h2
                    className="font-headline font-bold mb-10 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    style={{ fontSize: "clamp(32px, 5vw, 64px)" }}
                >
                    Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {FEATURES.map((f, i) => (
                        <FeatureCard key={f.num} f={f} delay={i * 75} />
                    ))}
                </div>
            </section>

            <footer className="px-6 py-8 border-t">
                © 2026 Software Quality Assurance Community (SQAC)
            </footer>
        </div>
    );
}