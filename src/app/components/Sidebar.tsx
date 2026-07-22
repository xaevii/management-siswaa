"use client";

import React from "react";
import { useAppContext } from "@/app/context/AppContext";

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "siswa",
    label: "Siswa",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "kelas",
    label: "Kelas",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: "pelanggaran",
    label: "Pelanggaran",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeMenu, onMenuChange, isOpenMobile, onCloseMobile }: SidebarProps) {
  const { user, userProfile, logout } = useAppContext();

  return (
    <div className={`sidebar ${isOpenMobile ? "open" : ""}`}>
      {/* Logo */}
      <div style={{ padding: "22px 22px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: "var(--blue-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            MS
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)" }}>Manajemen Siswa</div>
          </div>
        </div>
        {onCloseMobile && (
          <button
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close Sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 0" }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-menu-item ${activeMenu === item.id ? "active" : ""}`}
            onClick={() => onMenuChange(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Profile Widget */}
      <div style={{ padding: "18px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1d63ff, #4f8bff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            {userProfile?.nama ? userProfile.nama.substring(0, 2).toUpperCase() : "AD"}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userProfile?.nama || "Admin Sekolah"}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userProfile?.email || user?.email || "admin@sekolah.com"}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#ef4444",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
