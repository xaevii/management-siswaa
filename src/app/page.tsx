"use client";

import React from "react";
import { useAppContext } from "@/app/context/AppContext";
import LoginPage from "@/app/components/LoginPage";
import RegisterPage from "@/app/components/RegisterPage";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import DashboardPage from "@/app/components/DashboardPage";
import SiswaPage from "@/app/components/SiswaPage";
import KelasPage from "@/app/components/KelasPage";
import PelanggaranPage from "@/app/components/PelanggaranPage";

export default function Home() {
  const {
    isLoggedIn, showRegister, setShowRegister, login,
    activeMenu, setActiveMenu,
    siswaList, addSiswa, updateSiswa, deleteSiswa,
    kelasList, addKelas, updateKelas, deleteKelas,
    pelanggaranList, addPelanggaran, updatePelanggaran, deletePelanggaran,
  } = useAppContext();

  // ---- Login Screen ----
  if (!isLoggedIn) {
    if (showRegister) {
      return <RegisterPage onBackToLogin={() => setShowRegister(false)} />;
    }
    return <LoginPage onLogin={login} onRegister={() => setShowRegister(true)} />;
  }

  // ---- Render active page ----
  const renderPage = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <DashboardPage
            siswaList={siswaList}
            kelasList={kelasList}
            pelanggaranList={pelanggaranList}
          />
        );
      case "siswa":
        return (
          <SiswaPage
            siswaList={siswaList}
            kelasList={kelasList}
            onAdd={addSiswa}
            onUpdate={updateSiswa}
            onDelete={deleteSiswa}
          />
        );
      case "kelas":
        return (
          <KelasPage
            kelasList={kelasList}
            onAdd={addKelas}
            onUpdate={updateKelas}
            onDelete={deleteKelas}
          />
        );
      case "pelanggaran":
        return (
          <PelanggaranPage
            pelanggaranList={pelanggaranList}
            siswaList={siswaList}
            kelasList={kelasList}
            onAdd={addPelanggaran}
            onUpdate={updatePelanggaran}
            onDelete={deletePelanggaran}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <div style={{ flex: 1 }}>
        <Topbar />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
