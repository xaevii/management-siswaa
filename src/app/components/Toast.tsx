"use client";

import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export default function Toast({ toasts, onClose }: ToastProps) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      onClose(toasts[0].id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts, onClose]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "400px",
        width: "100%",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        let bg = "#10b981";
        let icon = "✓";
        if (t.type === "error") {
          bg = "#ef4444";
          icon = "✕";
        } else if (t.type === "info") {
          bg = "#3b82f6";
          icon = "ℹ";
        }

        return (
          <div
            key={t.id}
            className="animate-fade-in-scale"
            style={{
              pointerEvents: "auto",
              background: "#ffffff",
              borderLeft: `4px solid ${bg}`,
              borderRadius: "10px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: bg,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#1e293b",
                  lineHeight: "1.4",
                }}
              >
                {t.message}
              </span>
            </div>
            <button
              onClick={() => onClose(t.id)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "16px",
                padding: "2px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
