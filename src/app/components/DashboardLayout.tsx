"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/context/AppContext";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";

export default function DashboardLayout({
  children,
  activeMenu,
}: {
  children: React.ReactNode;
  activeMenu: string;
}) {
  const { isLoggedIn, setActiveMenu } = useAppContext();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setActiveMenu(activeMenu);
  }, [activeMenu, setActiveMenu]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
    setIsMobileSidebarOpen(false);
    if (menu === "dashboard") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard/${menu}`);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Topbar onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
