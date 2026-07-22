"use client";

import React, { useEffect } from "react";
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
    if (menu === "dashboard") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard/${menu}`);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      <div style={{ flex: 1 }}>
        <Topbar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
