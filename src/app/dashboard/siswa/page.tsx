"use client";

import React from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import SiswaPage from "@/app/components/SiswaPage";
import { useAppContext } from "@/app/context/AppContext";

export default function SiswaRoute() {
  const { siswaList, kelasList, addSiswa, updateSiswa, deleteSiswa } = useAppContext();

  return (
    <DashboardLayout activeMenu="siswa">
      <SiswaPage
        siswaList={siswaList}
        kelasList={kelasList}
        onAdd={addSiswa}
        onUpdate={updateSiswa}
        onDelete={deleteSiswa}
      />
    </DashboardLayout>
  );
}
