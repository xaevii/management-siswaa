"use client";

import React from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import DashboardPage from "@/app/components/DashboardPage";
import { useAppContext } from "@/app/context/AppContext";

export default function DashboardRoute() {
  const { siswaList, kelasList, pelanggaranList } = useAppContext();

  return (
    <DashboardLayout activeMenu="dashboard">
      <DashboardPage
        siswaList={siswaList}
        kelasList={kelasList}
        pelanggaranList={pelanggaranList}
      />
    </DashboardLayout>
  );
}
