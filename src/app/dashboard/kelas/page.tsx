"use client";

import React from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import KelasPage from "@/app/components/KelasPage";
import { useAppContext } from "@/app/context/AppContext";

export default function KelasRoute() {
  const { kelasList, addKelas, updateKelas, deleteKelas } = useAppContext();

  return (
    <DashboardLayout activeMenu="kelas">
      <KelasPage
        kelasList={kelasList}
        onAdd={addKelas}
        onUpdate={updateKelas}
        onDelete={deleteKelas}
      />
    </DashboardLayout>
  );
}
