"use client";

import React from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import PelanggaranPage from "@/app/components/PelanggaranPage";
import { useAppContext } from "@/app/context/AppContext";

export default function PelanggaranRoute() {
  const {
    pelanggaranList,
    siswaList,
    kelasList,
    addPelanggaran,
    updatePelanggaran,
    deletePelanggaran,
  } = useAppContext();

  return (
    <DashboardLayout activeMenu="pelanggaran">
      <PelanggaranPage
        pelanggaranList={pelanggaranList}
        siswaList={siswaList}
        kelasList={kelasList}
        onAdd={addPelanggaran}
        onUpdate={updatePelanggaran}
        onDelete={deletePelanggaran}
      />
    </DashboardLayout>
  );
}
