"use client";

import React from "react";
import { useAppContext } from "@/app/context/AppContext";

export default function Topbar() {
  const { userProfile } = useAppContext();
  const initials = userProfile?.nama ? userProfile.nama.substring(0, 2).toUpperCase() : "AD";

  return (
    <div className="topbar">
      <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>
        SMK Negeri 2 Malang
      </div>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1d63ff, #4f8bff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: "13px",
          cursor: "pointer",
        }}
        title={userProfile?.nama || "Admin"}
      >
        {initials}
      </div>
    </div>
  );
}

