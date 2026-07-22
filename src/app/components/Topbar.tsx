"use client";

import React from "react";
import { useAppContext } from "@/app/context/AppContext";

interface TopbarProps {
  onToggleMobileSidebar?: () => void;
}

export default function Topbar({ onToggleMobileSidebar }: TopbarProps) {
  const { userProfile } = useAppContext();
  const initials = userProfile?.nama ? userProfile.nama.substring(0, 2).toUpperCase() : "AD";

  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="topbar-title">
          SMK Negeri 2 Malang | Fakhri Hadinanta
        </div>
      </div>
      <div
        className="topbar-avatar"
        title={userProfile?.nama || "Admin"}
      >
        {initials}
      </div>
    </div>
  );
}

