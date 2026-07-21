"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

interface LoginPageProps {
  onLogin: () => void;
  onRegister?: () => void;
}

export default function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fillDemo = () => {
    setEmail("admin@sekolah.com");
    setPassword("admin123");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        setIsLoading(false);
        onLogin();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal melakukan login. Silakan coba lagi.";
      setErrorMsg(message);
      setIsLoading(false);
    }
  };


  return (
    <div className="login-bg">
      <div
        className="animate-fade-in-scale"
        style={{
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "440px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e8efff, #c7d7ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1d63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>Welcome Back</h1>
          <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>Sign in to your account</p>
        </div>

        {/* Demo Info Box */}
        <div
          onClick={fillDemo}
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "28px",
            cursor: "pointer",
            textAlign: "center",
            fontSize: "13px",
            color: "#64748b",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#1d63ff";
            e.currentTarget.style.background = "#f0f4ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.background = "#f8fafc";
          }}
        >
          Akun demo: <span style={{ color: "#1d63ff", fontWeight: 600 }}>admin@sekolah.com</span> /{" "}
          <span style={{ color: "#1d63ff", fontWeight: 600 }}>admin123</span>{" "}
          <span style={{ color: "#94a3b8" }}>(Klik untuk isi)</span>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#ef4444",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontSize: "13px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <input
                type="email"
                className="input-field"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "42px", paddingRight: "42px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 0,
                  display: "flex",
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "14px",
              fontSize: "16px",
              borderRadius: "12px",
              marginBottom: "12px",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeLinecap="round" />
                </svg>
                Signing in...
              </span>
            ) : (
              "Login"
            )}
          </button>

          {/* Demo Account Button */}
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              fillDemo();
              setTimeout(() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  onLogin();
                }, 800);
              }, 200);
            }}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "14px",
              fontSize: "14px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
            }}
          >
            Use Demo Account (admin@sekolah.com)
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b", marginTop: "24px" }}>
          Don&apos;t have an account?{" "}
          <span
            onClick={onRegister}
            style={{ color: "#1d63ff", fontWeight: 600, cursor: "pointer" }}
          >
            Register
          </span>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
