"use client";

import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from "recharts";
import type { Kelas, Siswa, Pelanggaran } from "@/app/data/mockData";
import { initialKelas, trenPelanggaran } from "@/app/data/mockData";

interface DashboardPageProps {
  siswaList: Siswa[];
  kelasList: Kelas[];
  pelanggaranList: Pelanggaran[];
}

export default function DashboardPage({ siswaList, kelasList, pelanggaranList }: DashboardPageProps) {
  const totalSiswa = siswaList.length;
  const totalKelas = kelasList.length;
  const rataPerKelas = totalKelas > 0 ? Math.round(totalSiswa / totalKelas) : 0;
  const totalPelanggaran = pelanggaranList.length;

  // Helper to match student's kelasId with a Kelas object
  const isSiswaInKelas = (s: Siswa, k: Kelas) => {
    if (!s.kelasId) return false;
    if (s.kelasId === k.id || s.kelasId === k.nama) return true;
    const mockMatch = initialKelas.find((ik) => ik.id === s.kelasId);
    if (mockMatch && mockMatch.nama === k.nama) return true;
    return false;
  };

  // ---- Bar Chart: Siswa per Kelas ----
  const barData = kelasList.map((k) => {
    const siswaInKelas = siswaList.filter((s) => isSiswaInKelas(s, k));
    return {
      name: k.nama,
      "Laki-Laki": siswaInKelas.filter((s) => s.jenisKelamin === "L").length,
      Perempuan: siswaInKelas.filter((s) => s.jenisKelamin === "P").length,
    };
  });

  // ---- Pie Chart: Jenis Kelamin ----
  const lakiCount = siswaList.filter((s) => s.jenisKelamin === "L").length;
  const perempuanCount = siswaList.filter((s) => s.jenisKelamin === "P").length;
  const pieData = [
    { name: "Laki-Laki", value: lakiCount },
    { name: "Perempuan", value: perempuanCount },
  ];
  const PIE_COLORS = ["#1d63ff", "#ec4899"];

  // ---- Jenis Pelanggaran Top 5 ----
  const jenisCounts: Record<string, number> = {};
  pelanggaranList.forEach((p) => {
    jenisCounts[p.jenisPelanggaran] = (jenisCounts[p.jenisPelanggaran] || 0) + 1;
  });
  const topJenis = Object.entries(jenisCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // ---- Tingkat Pelanggaran ----
  const tingkatCounts = { Ringan: 0, Sedang: 0, Berat: 0 };
  pelanggaranList.forEach((p) => {
    tingkatCounts[p.tingkat]++;
  });

  // ---- Pelanggaran per Kelas ----
  const kelasViolations: Record<string, number> = {};
  pelanggaranList.forEach((p) => {
    const siswa = siswaList.find((s) => s.id === p.siswaId);
    if (siswa) {
      const kelas = kelasList.find((k) => isSiswaInKelas(siswa, k));
      if (kelas) {
        kelasViolations[kelas.nama] = (kelasViolations[kelas.nama] || 0) + 1;
      }
    }
  });
  const topKelas = Object.entries(kelasViolations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // ---- Distribusi Tahun Kelahiran ----
  const yearCounts: Record<string, number> = {};
  siswaList.forEach((s) => {
    const y = s.tanggalLahir.slice(0, 4);
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  });
  const birthYearData = Object.entries(yearCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, count]) => ({ year, count }));

  // ---- Stat Cards ----
  const stats = [
    {
      label: "Siswa",
      value: totalSiswa,
      sub: "Siswa Aktif",
      color: "#1d63ff",
      bgColor: "#e8efff",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Kelas",
      value: totalKelas,
      sub: "Kelas Aktif",
      color: "#22c55e",
      bgColor: "#dcfce7",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
        </svg>
      ),
    },
    {
      label: "Rata-Rata per Kelas",
      value: rataPerKelas,
      sub: "Siswa per kelas",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: "Pelanggaran",
      value: totalPelanggaran,
      sub: "Total Pelanggaran",
      color: "#ef4444",
      bgColor: "#fee2e2",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px", color: "var(--text-primary)" }}>
        Dashboard Siswa
      </h1>

      {/* ---- Stat Cards ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }} className="stagger-children">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500, marginBottom: "4px" }}>
                {s.label}
              </div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                {s.value}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{s.sub}</div>
            </div>
            <div className="stat-icon" style={{ background: s.bgColor }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ---- Row 1: Bar Chart + Pie Chart ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {/* Bar Chart */}
        <div className="card animate-fade-in" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d63ff" strokeWidth="2"><rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="7" width="4" height="14" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" /></svg>
              Siswa per Kelas
            </h3>
            <span className="badge badge-blue">Gender Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={12} tick={{ fill: "#64748b" }} />
              <YAxis fontSize={12} tick={{ fill: "#64748b" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
              <Legend iconType="square" wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="Laki-Laki" fill="#1d63ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Perempuan" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card animate-fade-in" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d63ff" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 0 20" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
              Jenis Kelamin
            </h3>
            <span className="badge badge-blue">Total Ratio</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(1)}%)`}
                labelLine={true}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
              <Legend iconType="square" wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Row 2: Area Chart + Jenis Pelanggaran ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {/* Area Chart */}
        <div className="card animate-fade-in" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              Tren Pelanggaran Siswa
            </h3>
            <span className="badge badge-orange">6 Bulan Terakhir</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trenPelanggaran}>
              <defs>
                <linearGradient id="colorPelanggaran" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDiselesaikan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" fontSize={12} tick={{ fill: "#64748b" }} />
              <YAxis fontSize={12} tick={{ fill: "#64748b" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
              <Legend iconType="line" wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="pelanggaran" name="Pelanggaran" stroke="#ef4444" strokeWidth={2} fill="url(#colorPelanggaran)" />
              <Area type="monotone" dataKey="diselesaikan" name="Diselesaikan" stroke="#22c55e" strokeWidth={2} fill="url(#colorDiselesaikan)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Jenis Pelanggaran List */}
        <div className="card animate-fade-in" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            Jenis Pelanggaran
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topJenis.map(([jenis, count], i) => (
              <div
                key={jenis}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f4ff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: i === 0 ? "#fee2e2" : i === 1 ? "#fef3c7" : "#e8efff",
                    color: i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#1d63ff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>{jenis}</span>
                </div>
                <span className={`badge ${i === 0 ? "badge-red" : i === 1 ? "badge-orange" : "badge-blue"}`}>
                  {count} kasus
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Row 3: Tingkat Pelanggaran + Pelanggaran Terbanyak + Birth Year Distribution ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        {/* Tingkat Pelanggaran */}
        <div className="card animate-fade-in" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d63ff" strokeWidth="2"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>
            Tingkat Pelanggaran
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {([
              { label: "Ringan", count: tingkatCounts.Ringan, color: "#22c55e", bg: "#dcfce7" },
              { label: "Sedang", count: tingkatCounts.Sedang, color: "#f59e0b", bg: "#fef3c7" },
              { label: "Berat", count: tingkatCounts.Berat, color: "#ef4444", bg: "#fee2e2" },
            ] as const).map((t) => (
              <div key={t.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#f8fafc", borderRadius: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.color }} />
                  <span style={{ fontWeight: 500, fontSize: "14px" }}>{t.label}</span>
                </div>
                <span style={{ background: t.bg, color: t.color, padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pelanggaran Terbanyak per Kelas */}
        <div className="card animate-fade-in" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M8 6L21 6" /><path d="M8 12L21 12" /><path d="M8 18L21 18" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></svg>
            Pelanggaran Terbanyak
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {topKelas.map(([kelas, count], i) => (
              <div key={kelas} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "#fee2e2", color: "#ef4444",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>{kelas}</span>
                </div>
                <span className="badge badge-red">{count} kasus</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribusi Tahun Kelahiran */}
        <div className="card animate-fade-in" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Distribusi Tahun Kelahiran
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={birthYearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" fontSize={12} tick={{ fill: "#64748b" }} />
              <YAxis fontSize={12} tick={{ fill: "#64748b" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
              <Bar dataKey="count" name="Jumlah Siswa" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
