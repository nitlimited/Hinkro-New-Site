import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { startDemo, useAuth } from "./useAuth";
import { ROLE_HOME, type UserRole } from "../types";

const logoUrl = "/images/hinkro-kente-bespoke-kente-weaving-services-logo.png";

type Mode = "client" | "staff";
type OtpStep = "email" | "code";

export function LoginPage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpStep, setOtpStep] = useState<OtpStep>("email");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Already signed in → straight to the right dashboard.
  useEffect(() => {
    if (!loading && profile) {
      navigate(ROLE_HOME[profile.role], { replace: true });
    }
  }, [loading, profile, navigate]);

  const submitStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (err) setError(err.message);
  };

  const submitOtpEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setBusy(false);
    if (err) {
      setError(
        err.message.includes("Signups not allowed")
          ? "We couldn't find an account for that email. Please use the invitation link from Hinkro Kente, or contact us."
          : err.message,
      );
      return;
    }
    setOtpStep("code");
    setNotice(`We sent a 6-digit code to ${email}.`);
  };

  const submitOtpCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (err) setError(err.message);
  };

  return (
    <main className="portal-login">
      <div className="portal-login-card">
        <img
          className="portal-login-logo"
          src={logoUrl}
          alt="Hinkro Kente"
        />
        <h1>Welcome back</h1>
        <p className="portal-login-sub">
          Sign in to follow your bespoke Kente project or manage the studio.
        </p>

        {!isSupabaseConfigured && (
          <div className="portal-demo">
            <div className="portal-alert">
              The backend isn&rsquo;t connected yet, so sign-in is disabled.
              Meanwhile you can preview each dashboard with sample data:
            </div>
            <div className="portal-demo-buttons">
              {(
                [
                  ["admin", "Administrator"],
                  ["content_manager", "Content"],
                  ["weaver", "Weaver"],
                  ["client", "Client"],
                ] as [UserRole, string][]
              ).map(([role, label]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    startDemo(role);
                    window.location.assign(ROLE_HOME[role]);
                  }}
                >
                  Preview as {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="portal-login-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "client"}
            className={mode === "client" ? "is-active" : ""}
            onClick={() => {
              setMode("client");
              setError("");
              setNotice("");
            }}
          >
            I&rsquo;m a client
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "staff"}
            className={mode === "staff" ? "is-active" : ""}
            onClick={() => {
              setMode("staff");
              setError("");
              setNotice("");
            }}
          >
            Team sign in
          </button>
        </div>

        {mode === "client" && otpStep === "email" && (
          <form onSubmit={submitOtpEmail}>
            <label htmlFor="client-email">Email address</label>
            <input
              id="client-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="portal-btn-primary"
              type="submit"
              disabled={busy || !isSupabaseConfigured}
            >
              {busy ? "Sending…" : "Email me a sign-in code"}
            </button>
            <p className="portal-login-hint">
              No password needed — we&rsquo;ll email you a one-time code. First
              time here? Use the invitation link Hinkro Kente sent you.
            </p>
          </form>
        )}

        {mode === "client" && otpStep === "code" && (
          <form onSubmit={submitOtpCode}>
            {notice && <div className="portal-notice">{notice}</div>}
            <label htmlFor="client-code">6-digit code</label>
            <input
              id="client-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              className="portal-btn-primary"
              type="submit"
              disabled={busy || !isSupabaseConfigured}
            >
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button
              className="portal-btn-link"
              type="button"
              onClick={() => {
                setOtpStep("email");
                setCode("");
                setNotice("");
              }}
            >
              Use a different email
            </button>
          </form>
        )}

        {mode === "staff" && (
          <form onSubmit={submitStaff}>
            <label htmlFor="staff-email">Email address</label>
            <input
              id="staff-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="staff-password">Password</label>
            <input
              id="staff-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="portal-btn-primary"
              type="submit"
              disabled={busy || !isSupabaseConfigured}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {error && <div className="portal-error" role="alert">{error}</div>}

        <a className="portal-login-back" href="/">
          ← Back to hinkrokente.com
        </a>
      </div>
    </main>
  );
}
