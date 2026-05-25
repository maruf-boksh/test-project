import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { isAuthenticated, setAuthUser, validateCredentials } from "@/lib/auth";
import {
  ArrowLeft, ArrowRight, BarChart2, ChefHat,
  Eye, EyeOff, LockKeyhole, Mail, Package,
  Plane, RotateCcw, ShieldCheck,
  ShoppingCart, Truck, UtensilsCrossed, UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ── Brand mark SVG ────────────────────────────────────────────────────────────
function BrandMark({ size = 40, tone = "dark" }: { size?: number; tone?: "dark" | "light" }) {
  const id = tone;
  const bg =
    tone === "dark"
      ? "rgba(255,255,255,0.15)"
      : "linear-gradient(145deg, #0d4f3c, #0a3528)";
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 10, flexShrink: 0,
        background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 40 40" fill="none">
        <defs>
          <radialGradient id={`spark-${id}`}>
            <stop offset="0%"   stopColor="#FCD34D" />
            <stop offset="50%"  stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
        </defs>
        <path d="M10 8 L10 32" className="hz-bar-l"         stroke="#fff" strokeWidth="3.6" strokeLinecap="round" fill="none" />
        <path d="M10 8 L10 32" className="hz-bar-l-shimmer" stroke="rgba(255,255,255,0.75)" strokeWidth="3.6" strokeLinecap="round" fill="none" />
        <path d="M30 8 L30 32" className="hz-bar-r"         stroke="#fff" strokeWidth="3.6" strokeLinecap="round" fill="none" />
        <path d="M30 8 L30 32" className="hz-bar-r-shimmer" stroke="rgba(255,255,255,0.75)" strokeWidth="3.6" strokeLinecap="round" fill="none" />
        <path d="M10 20 L30 20" className="hz-cross"         stroke="#fff" strokeOpacity="0.85" strokeWidth="3.6" strokeLinecap="round" fill="none" />
        <path d="M10 20 L30 20" className="hz-cross-shimmer" stroke="rgba(255,255,255,0.65)" strokeWidth="3.6" strokeLinecap="round" fill="none" />
        <path d="M11 25 L17 21 L23 23 L30 17" className="hz-chart"         stroke="#FBBF24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.9" />
        <path d="M11 25 L17 21 L23 23 L30 17" className="hz-chart-shimmer" stroke="#FDE68A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="30" cy="17" r="2.4" className="hz-spark-ring" fill="none" stroke="#FBBF24" strokeWidth="1.2" />
        <g className="hz-spark">
          <circle cx="30" cy="17" r="2.4" fill={`url(#spark-${id})`} />
          <circle cx="30" cy="17" r="2.4" fill="none" stroke="#FBBF24" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}

function Wordmark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const primary   = tone === "dark" ? "#fff" : "#111827";
  const secondary = tone === "dark" ? "rgba(255,255,255,0.5)" : "#9ca3af";
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ fontFamily: "var(--font-brand)", fontWeight: 900, fontSize: tone === "dark" ? 18 : 16, letterSpacing: "0.14em", color: primary }}>
        HARVEST
      </span>
      <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: tone === "dark" ? 14 : 12, letterSpacing: "0.12em", color: secondary }}>
        Catering
      </span>
    </div>
  );
}

// ── Left hero panel ───────────────────────────────────────────────────────────
const MODULES = [
  { icon: Plane,           label: "Flight Orders"  },
  { icon: UtensilsCrossed, label: "Meal Planning"  },
  { icon: ShieldCheck,     label: "QC & Hygiene"   },
  { icon: ChefHat,         label: "Production"     },
  { icon: Truck,           label: "Dispatch"       },
  { icon: ShoppingCart,    label: "Procurement"    },
  { icon: Package,         label: "Inventory"      },
  { icon: BarChart2,       label: "Reports"        },
] as const;

const STATS = [
  { value: "500+", label: "FLIGHTS / DAY" },
  { value: "24/7", label: "OPERATIONS"   },
  { value: "100%", label: "HACCP"        },
] as const;

function LeftPanel() {
  return (
    <div className="vz-login-hero">
      <div className="vz-login-hero-bg" aria-hidden>
        <div className="vz-login-hero-grid" />
      </div>

      <div className="vz-login-hero-content">
        <div className="vz-login-hero-brand">
          <BrandMark size={48} tone="dark" />
          <Wordmark tone="dark" />
        </div>

        <div className="vz-login-hero-badge">AIRLINES CATERING MANAGEMENT PLATFORM</div>

        <h1 className="vz-login-hero-title">
          Your complete<br />flight kitchen<br />management.
        </h1>

        <p className="vz-login-hero-desc">
          One intelligent platform connecting flight orders, production,
          QC, and dispatch — from gate to galley.
        </p>

        <div className="vz-login-module-grid">
          {MODULES.map(({ icon: Icon, label }) => (
            <div key={label} className="vz-login-module-card">
              <span className="vz-login-module-icon">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <span className="vz-login-module-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="vz-login-metrics">
          {STATS.map(({ value, label }) => (
            <div key={label} className="vz-login-metric">
              <span className="vz-login-metric-value">{value}</span>
              <span className="vz-login-metric-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="vz-login-security-badge">
          <ShieldCheck size={14} />
          <span>Enterprise grade security</span>
        </div>
      </div>
    </div>
  );
}

// ── OTP grid ──────────────────────────────────────────────────────────────────
function OtpGrid({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...value]; next[i] = digit; onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  }
  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft"  && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  }
  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = Array(6).fill("");
    digits.forEach((d, idx) => { next[idx] = d; });
    onChange(next);
    setTimeout(() => refs.current[Math.min(digits.length, 5)]?.focus(), 0);
  }

  return (
    <div className="vz-login-otp-grid">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`vz-login-otp-input${digit ? " has-value" : ""}`}
          style={{ fontFamily: "var(--font-brand, 'Orbitron', monospace)" }}
        />
      ))}
    </div>
  );
}

// ── Right form panel ──────────────────────────────────────────────────────────
function RightPanel() {
  const navigate = useNavigate();

  const [step, setStep]             = useState<"creds" | "otp">("creds");
  const [userId, setUserId]         = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [otp, setOtp]               = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [countdown, setCountdown]   = useState(45);
  const [forgotOpen, setForgotOpen] = useState(false);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const firstOtpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated()) navigate("/");
  }, [navigate]);

  function startCountdown() {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(45);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    if (step === "otp") {
      startCountdown();
      setTimeout(() => firstOtpRef.current?.querySelector("input")?.focus(), 60);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!userId.trim() || !password.trim()) {
      setError("Please enter your User ID and password.");
      return;
    }
    if (!validateCredentials(userId, password)) {
      setError("Invalid User ID or password. Try admin / admin123.");
      return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 700);
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!otp.every((d) => d !== "")) { setError("Please enter all 6 digits of your OTP."); return; }
    setLoading(true);
    const user = validateCredentials(userId, password)!;
    setTimeout(() => {
      setAuthUser(user);
      setLoading(false);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/");
    }, 700);
  }

  function handleResend() {
    if (countdown > 0) return;
    toast.info("OTP resent to your email.");
    startCountdown();
    setOtp(Array(6).fill(""));
  }

  const maskedEmail  = "md.h***@usbair.com";
  const countdownStr = `0:${String(countdown).padStart(2, "0")}`;

  return (
    <div className="vz-login-form-side">
      <div className="vz-login-form-container">

        <div className="vz-login-form-brand">
          <BrandMark size={40} tone="light" />
          <Wordmark tone="light" />
        </div>

        {/* ── STEP 1: Credentials ── */}
        {step === "creds" && (
          <>
            <div className="vz-login-form-header">
              <div className="vz-login-form-kicker">WELCOME BACK</div>
              <h2>Sign in to Harvest Catering</h2>
              <p>Enter your credentials to access the catering workspace.</p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                marginBottom: 18,
                borderRadius: 10,
                background: "#F0FDFA",
                border: "1px solid #CCFBF1",
                fontSize: 12,
                lineHeight: 1.5,
                color: "#0F766E",
              }}
            >
              <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>Demo credentials</div>
                <div>
                  <code style={{ background: "rgba(15,118,110,0.12)", padding: "1px 6px", borderRadius: 4 }}>admin</code>
                  {" / "}
                  <code style={{ background: "rgba(15,118,110,0.12)", padding: "1px 6px", borderRadius: 4 }}>admin123</code>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => { setUserId("admin"); setPassword("admin123"); }}
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
                      color: "#0F766E",
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Fill
                  </button>
                </div>
              </div>
            </div>

            <form className="vz-login-form" onSubmit={handleCredentials}>
              <div className="vz-login-field">
                <label className="vz-login-label">User ID</label>
                <div className="vz-login-input-wrap">
                  <span className="vz-login-input-icon"><UserRound size={16} /></span>
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your user ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="vz-login-input"
                  />
                </div>
              </div>

              <div className="vz-login-field">
                <label className="vz-login-label">Password</label>
                <div className="vz-login-input-wrap">
                  <span className="vz-login-input-icon"><LockKeyhole size={16} /></span>
                  <input
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="vz-login-input"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                      color: showPass ? "#0f766e" : "#9ca3af", display: "flex", alignItems: "center",
                      transition: "color 140ms",
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 12, color: "#dc2626", fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <div className="vz-login-actions-row" style={{ marginTop: -6 }}>
                <span />
                <button type="button" className="vz-login-link-btn" onClick={() => setForgotOpen(true)}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="vz-login-submit">
                {loading
                  ? <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.6s linear infinite", display: "inline-block", flexShrink: 0 }} />
                  : <><Mail size={16} /> Continue with OTP <ArrowRight size={16} /></>
                }
              </button>
            </form>
          </>
        )}

        {/* ── STEP 2: OTP Verification ── */}
        {step === "otp" && (
          <>
            <div className="vz-login-form-header">
              <div className="vz-login-form-kicker">EMAIL VERIFICATION</div>
              <h2>Verify OTP</h2>
              <p>Enter the 6-digit code sent to your email.</p>
            </div>

            <form className="vz-login-form" onSubmit={handleVerifyOtp}>
              <div className="vz-login-otp-banner">
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mail size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 2 }}>OTP sent to email</p>
                  <p style={{ fontSize: 12, lineHeight: 1.6, color: "#6b7280" }}>
                    A 6-digit code was sent to <strong>{maskedEmail}</strong>. Check your inbox.
                  </p>
                </div>
              </div>

              <div ref={firstOtpRef}>
                <OtpGrid value={otp} onChange={setOtp} />
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 12, color: "#dc2626", fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="vz-login-submit">
                {loading
                  ? <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.6s linear infinite", display: "inline-block", flexShrink: 0 }} />
                  : "Verify OTP"
                }
              </button>

              <div className="vz-login-actions-row">
                <button
                  type="button"
                  className="vz-login-link-btn"
                  style={{ color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}
                  onClick={() => { setStep("creds"); setOtp(Array(6).fill("")); setError(""); }}
                >
                  <ArrowLeft size={14} /> Back to credentials
                </button>
                <button
                  type="button"
                  className="vz-login-link-btn"
                  disabled={countdown > 0}
                  onClick={handleResend}
                  style={{ display: "flex", alignItems: "center", gap: 4, opacity: countdown > 0 ? 0.55 : 1 }}
                >
                  <RotateCcw size={13} />
                  {countdown > 0 ? `Resend in ${countdownStr}` : "Resend OTP"}
                </button>
              </div>
            </form>
          </>
        )}

        <p className="vz-login-footer-text">
          By signing in, you agree to Harvest Catering's{" "}
          <button type="button" className="vz-login-link-btn" style={{ fontSize: 11 }}>Terms of Service</button>{" "}
          and{" "}
          <button type="button" className="vz-login-link-btn" style={{ fontSize: 11 }}>Privacy Policy</button>.
        </p>

        <p className="vz-login-build-tag">Build HCERP 1.0</p>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LockKeyhole size={15} color="#fff" />
              </div>
              <div>
                <DialogTitle style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>
                  Forgot Password
                </DialogTitle>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Password recovery assistance</p>
              </div>
            </div>
          </DialogHeader>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginTop: 4 }}>
            Please contact your system administrator or IT support team to reset your
            password. You can also reach out to{" "}
            <span style={{ fontWeight: 600, color: "#0f766e" }}>md.hossain@usbair.com</span>{" "}
            for assistance. Include your User ID in the request.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button
              onClick={() => setForgotOpen(false)}
              style={{ height: 34, padding: "0 20px", borderRadius: 8, border: "none", background: "#0f766e", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Got it
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="vz-login-shell">
      <div className="vz-login-card">
        <LeftPanel />
        <RightPanel />
      </div>
    </div>
  );
}
