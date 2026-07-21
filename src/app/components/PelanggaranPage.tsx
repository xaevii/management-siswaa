"use client";

import React, { useState, useMemo, useRef } from "react";
import { useAppContext } from "@/app/context/AppContext";
import type { Kelas, Siswa, Pelanggaran, TingkatPelanggaran, StatusPelanggaran } from "@/app/data/mockData";
import { generatePelanggaranPDF, generatePelanggaranListPDF } from "@/lib/pdfGenerator";
import { exportPelanggaranExcel } from "@/lib/excelGenerator";

interface PelanggaranPageProps {
  pelanggaranList: Pelanggaran[];
  siswaList: Siswa[];
  kelasList: Kelas[];
  onAdd: (p: Omit<Pelanggaran, "id">) => Promise<void> | void;
  onUpdate: (id: string, p: Omit<Pelanggaran, "id">) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

const emptyForm = {
  siswaId: "",
  jenisPelanggaran: "",
  tingkat: "Ringan" as TingkatPelanggaran,
  poin: 5,
  tanggal: new Date().toISOString().slice(0, 10),
  waktu: new Date().toTimeString().slice(0, 5),
  lokasi: "",
  deskripsi: "",
  fotoBukti: "",
  status: "Aktif" as StatusPelanggaran,
  pelapor: "Admin Sekolah",
  sanksi: "",
  tanggalTindakLanjut: "",
  catatan: "",
};

export default function PelanggaranPage({
  pelanggaranList,
  siswaList,
  kelasList,
  onAdd,
  onUpdate,
  onDelete,
}: PelanggaranPageProps) {
  const { markPelanggaranSelesai, updateTindakanPelanggaran } = useAppContext();

  // Navigation / Active View
  const [detailId, setDetailId] = useState<string | null>(null);

  // Table controls
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filterTingkat, setFilterTingkat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [openActionsId, setOpenActionsId] = useState<string | null>(null);

  // Update Tindakan modal
  const [showTindakanModal, setShowTindakanModal] = useState<string | null>(null);
  const [tindakanForm, setTindakanForm] = useState({
    sanksi: "",
    catatan: "",
    tanggalTindakLanjut: "",
  });

  // Image Zoom Modal
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Image Input Mode (url vs upload)
  const [imageInputMode, setImageInputMode] = useState<"url" | "file">("file");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Siswa autocomplete
  const [siswaSearch, setSiswaSearch] = useState("");
  const [showSiswaDropdown, setShowSiswaDropdown] = useState(false);

  // Helper functions
  const getSiswaById = (id: string) => siswaList.find((s) => s.id === id);
  const getKelasName = (kelasId?: string) => kelasList.find((k) => k.id === kelasId)?.nama || "-";

  // Filtered List
  const filtered = useMemo(() => {
    return pelanggaranList.filter((p) => {
      const siswa = getSiswaById(p.siswaId);
      const kelasName = getKelasName(siswa?.kelasId);

      const matchSearch =
        (siswa?.nama.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (siswa?.nis.includes(search) ?? false) ||
        p.jenisPelanggaran.toLowerCase().includes(search.toLowerCase());

      const matchTingkat = filterTingkat ? p.tingkat === filterTingkat : true;
      const matchStatus = filterStatus ? p.status === filterStatus : true;
      const matchKelas = filterKelas ? siswa?.kelasId === filterKelas || kelasName === filterKelas : true;

      let matchDate = true;
      if (filterDateFrom) matchDate = matchDate && p.tanggal >= filterDateFrom;
      if (filterDateTo) matchDate = matchDate && p.tanggal <= filterDateTo;

      return matchSearch && matchTingkat && matchStatus && matchKelas && matchDate;
    });
  }, [pelanggaranList, siswaList, kelasList, search, filterTingkat, filterStatus, filterKelas, filterDateFrom, filterDateTo]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  // Autocomplete Siswa list
  const filteredSiswaOptions = useMemo(() => {
    if (!siswaSearch || siswaSearch.includes("(")) return [];
    return siswaList
      .filter(
        (s) =>
          s.nama.toLowerCase().includes(siswaSearch.toLowerCase()) ||
          s.nis.includes(siswaSearch)
      )
      .slice(0, 8);
  }, [siswaList, siswaSearch]);

  // Selected item for detail view
  const selectedPelanggaran = useMemo(() => {
    if (!detailId) return null;
    return pelanggaranList.find((p) => p.id === detailId) || null;
  }, [pelanggaranList, detailId]);

  const selectedSiswa = useMemo(() => {
    if (!selectedPelanggaran) return null;
    return getSiswaById(selectedPelanggaran.siswaId) || null;
  }, [selectedPelanggaran, siswaList]);

  // Handlers
  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      tanggal: new Date().toISOString().slice(0, 10),
      waktu: new Date().toTimeString().slice(0, 5),
    });
    setSiswaSearch("");
    setShowModal(true);
  };

  const openEdit = (p: Pelanggaran) => {
    setEditingId(p.id);
    setForm({
      siswaId: p.siswaId,
      jenisPelanggaran: p.jenisPelanggaran,
      tingkat: p.tingkat,
      poin: p.poin,
      tanggal: p.tanggal,
      waktu: p.waktu,
      lokasi: p.lokasi,
      deskripsi: p.deskripsi,
      fotoBukti: p.fotoBukti,
      status: p.status,
      pelapor: p.pelapor || "Admin Sekolah",
      sanksi: p.sanksi || "",
      tanggalTindakLanjut: p.tanggalTindakLanjut || "",
      catatan: p.catatan || "",
    });
    const siswa = getSiswaById(p.siswaId);
    setSiswaSearch(siswa ? `${siswa.nama} (${siswa.nis})` : "");
    setShowModal(true);
    setOpenActionsId(null);
  };

  const handleFileUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file foto melebihi batas maksimal 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setForm((prev) => ({ ...prev, fotoBukti: e.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let resolvedSiswaId = form.siswaId;

    // Auto-resolve siswaId if user typed text but didn't click dropdown option
    if (!resolvedSiswaId && siswaSearch.trim()) {
      const matched = siswaList.find(
        (s) =>
          s.nama.toLowerCase() === siswaSearch.trim().toLowerCase() ||
          s.nis === siswaSearch.trim() ||
          siswaSearch.toLowerCase().includes(s.nama.toLowerCase()) ||
          `${s.nama} (${s.nis})`.toLowerCase() === siswaSearch.trim().toLowerCase()
      );
      if (matched) {
        resolvedSiswaId = matched.id;
      } else if (siswaList.length > 0) {
        // Fallback to first matching option in search
        const candidate = siswaList.find(
          (s) =>
            s.nama.toLowerCase().includes(siswaSearch.toLowerCase()) ||
            s.nis.includes(siswaSearch)
        );
        if (candidate) resolvedSiswaId = candidate.id;
      }
    }

    if (!resolvedSiswaId) {
      alert("Harap pilih Siswa terlebih dahulu.");
      return;
    }

    if (!form.jenisPelanggaran.trim()) {
      alert("Harap isi Jenis Pelanggaran.");
      return;
    }

    setIsSubmitting(true);
    const dataToSend: Omit<Pelanggaran, "id"> = {
      siswaId: resolvedSiswaId,
      jenisPelanggaran: form.jenisPelanggaran.trim(),
      tingkat: form.tingkat,
      poin: Number(form.poin),
      tanggal: form.tanggal,
      waktu: form.waktu || new Date().toTimeString().slice(0, 5),
      lokasi: form.lokasi.trim(),
      deskripsi: form.deskripsi.trim(),
      fotoBukti: form.fotoBukti,
      status: form.status,
      pelapor: form.pelapor || "Admin Sekolah",
      sanksi: form.sanksi.trim(),
      tanggalTindakLanjut: form.tanggalTindakLanjut || "",
      catatan: form.catatan.trim(),
    };

    try {
      if (editingId) {
        await onUpdate(editingId, dataToSend);
      } else {
        await onAdd(dataToSend);
      }
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTindakanModal = (p: Pelanggaran) => {
    setShowTindakanModal(p.id);
    setTindakanForm({
      sanksi: p.sanksi || "",
      catatan: p.catatan || "",
      tanggalTindakLanjut: p.tanggalTindakLanjut || new Date().toISOString().slice(0, 10),
    });
  };

  const handleSaveTindakan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTindakanModal) return;
    await updateTindakanPelanggaran(
      showTindakanModal,
      tindakanForm.sanksi,
      tindakanForm.tanggalTindakLanjut,
      tindakanForm.catatan
    );
    setShowTindakanModal(null);
  };

  // Badges styling
  const renderStatusBadge = (status: StatusPelanggaran) => {
    const isAktif = status === "Aktif";
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 600,
          background: isAktif ? "#fff7ed" : "#ecfdf5",
          color: isAktif ? "#c2410c" : "#047857",
          border: `1px solid ${isAktif ? "#ffedd5" : "#a7f3d0"}`,
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: isAktif ? "#f97316" : "#10b981",
          }}
        />
        {status}
      </span>
    );
  };

  const renderTingkatBadge = (tingkat: TingkatPelanggaran) => {
    let bg = "#ecfdf5";
    let color = "#047857";
    let border = "#a7f3d0";

    if (tingkat === "Sedang") {
      bg = "#fefce8";
      color = "#a16207";
      border = "#fef08a";
    } else if (tingkat === "Berat") {
      bg = "#fef2f2";
      color = "#b91c1c";
      border = "#fecaca";
    }

    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 600,
          background: bg,
          color: color,
          border: `1px solid ${border}`,
        }}
      >
        {tingkat}
      </span>
    );
  };

  // ============================================================
  // RENDER: DETAIL VIEW
  // ============================================================
  if (detailId && selectedPelanggaran) {
    const s = selectedSiswa;
    const k = getKelasName(s?.kelasId);

    return (
      <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Navigation Back */}
        <button
          onClick={() => setDetailId(null)}
          className="btn-secondary"
          style={{
            marginBottom: "20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#fff",
            border: "1px solid var(--border)",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            color: "#475569",
          }}
        >
          ← Kembali ke Daftar Pelanggaran
        </button>

        {/* Detail Card Container */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          {/* Top Header Card */}
          <div
            style={{
              padding: "24px",
              background: "linear-gradient(135deg, #1d63ff, #4f8bff)",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Detail Pelanggaran
              </span>
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "8px 0 4px" }}>
                {selectedPelanggaran.jenisPelanggaran}
              </h2>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                Dilaporkan oleh: <strong>{selectedPelanggaran.pelapor || "Admin Sekolah"}</strong> | Tanggal: {selectedPelanggaran.tanggal} ({selectedPelanggaran.waktu} WIB)
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {renderStatusBadge(selectedPelanggaran.status)}
              {renderTingkatBadge(selectedPelanggaran.tingkat)}
              <span
                style={{
                  background: "#fff",
                  color: "#1d63ff",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                +{selectedPelanggaran.poin} Poin
              </span>
            </div>
          </div>

          <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Left Column: Siswa & Kejadian Info */}
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
                1. Informasi Siswa
              </h3>
              <div style={{ display: "grid", gap: "12px", fontSize: "14px" }}>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "12px" }}>Nama Lengkap</span>
                  <strong style={{ color: "#1e293b", fontSize: "15px" }}>{s?.nama || "-"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "12px" }}>NIS</span>
                  <span style={{ color: "#1e293b", fontWeight: 600 }}>{s?.nis || "-"}</span>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "12px" }}>Kelas</span>
                  <span style={{ color: "#1e293b", fontWeight: 600 }}>{k}</span>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "12px" }}>Jenis Kelamin</span>
                  <span>{s?.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</span>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "12px" }}>Alamat</span>
                  <span>{s?.alamat || "-"}</span>
                </div>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginTop: "24px", marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
                2. Detail Kejadian
              </h3>
              <div style={{ display: "grid", gap: "12px", fontSize: "14px" }}>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "12px" }}>Lokasi Kejadian</span>
                  <strong style={{ color: "#1e293b" }}>{selectedPelanggaran.lokasi || "-"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "12px" }}>Deskripsi Kejadian</span>
                  <p style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#334155", margin: "4px 0 0", lineHeight: 1.5 }}>
                    {selectedPelanggaran.deskripsi || "Tidak ada deskripsi rinci."}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Bukti & Actions */}
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
                3. Bukti Pelanggaran
              </h3>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                {selectedPelanggaran.fotoBukti ? (
                  <div>
                    <div
                      style={{
                        position: "relative",
                        maxHeight: "220px",
                        overflow: "hidden",
                        borderRadius: "8px",
                        marginBottom: "12px",
                        background: "#000",
                        cursor: "pointer",
                      }}
                      onClick={() => setZoomImage(selectedPelanggaran.fotoBukti)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedPelanggaran.fotoBukti}
                        alt="Bukti Foto"
                        style={{ width: "100%", height: "200px", objectFit: "cover", opacity: 0.9, transition: "opacity 0.2s" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                      <button
                        onClick={() => setZoomImage(selectedPelanggaran.fotoBukti)}
                        className="btn-secondary"
                        style={{ padding: "6px 14px", fontSize: "13px", background: "#fff", border: "1px solid #cbd5e1", cursor: "pointer", borderRadius: "6px" }}
                      >
                        👁 Lihat Preview
                      </button>
                      <a
                        href={selectedPelanggaran.fotoBukti}
                        download={`Bukti_Pelanggaran_${selectedPelanggaran.id}.jpg`}
                        className="btn-secondary"
                        style={{ padding: "6px 14px", fontSize: "13px", background: "#fff", border: "1px solid #cbd5e1", cursor: "pointer", borderRadius: "6px", textDecoration: "none", color: "inherit" }}
                      >
                        ⬇ Unduh Foto
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "30px 10px", color: "#94a3b8", fontSize: "14px" }}>
                    📷 Tidak ada foto bukti yang dilampirkan
                  </div>
                )}
              </div>

              {/* Section 4: Tindakan yang Diambil */}
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginTop: "24px", marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
                4. Tindakan yang Diambil
              </h3>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#166534", fontWeight: 600 }}>Sanksi / Tindakan:</span>
                  <div style={{ fontWeight: 700, color: "#14532d", fontSize: "15px" }}>
                    {selectedPelanggaran.sanksi || "Belum ada tindakan yang ditetapkan"}
                  </div>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#166534", fontWeight: 600 }}>Tanggal Tindak Lanjut:</span>
                  <div style={{ color: "#14532d", fontSize: "14px" }}>
                    {selectedPelanggaran.tanggalTindakLanjut || "-"}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#166534", fontWeight: 600 }}>Catatan:</span>
                  <div style={{ color: "#14532d", fontSize: "13px" }}>
                    {selectedPelanggaran.catatan || "-"}
                  </div>
                </div>
              </div>

              {/* Actions for Tindakan */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleOpenTindakanModal(selectedPelanggaran)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", background: "#f8fafc", border: "1px solid #cbd5e1" }}
                >
                  📝 Update Tindakan
                </button>
                {selectedPelanggaran.status === "Aktif" && (
                  <button
                    onClick={async () => {
                      await markPelanggaranSelesai(selectedPelanggaran.id);
                    }}
                    className="btn-primary"
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", background: "#10b981", border: "none", color: "#fff" }}
                  >
                    ✓ Tandai Selesai
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar: Large Download PDF Button */}
          <div
            style={{
              padding: "20px 24px",
              background: "#f8fafc",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => generatePelanggaranPDF(selectedPelanggaran, s, getSiswaById(s?.id || "") ? kelasList.find(k => k.id === s?.kelasId) || null : null)}
              className="btn-primary"
              style={{
                width: "100%",
                maxWidth: "320px",
                padding: "14px 24px",
                fontSize: "15px",
                fontWeight: 700,
                borderRadius: "12px",
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 14px rgba(29, 99, 255, 0.3)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Laporan (PDF)
            </button>
          </div>
        </div>

        {/* Update Tindakan Modal */}
        {showTindakanModal && (
          <div className="modal-backdrop" onClick={() => setShowTindakanModal(null)}>
            <div className="modal-content animate-fade-in-scale" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Update Tindakan Pelanggaran</h3>
              <form onSubmit={handleSaveTindakan}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                    Tindakan / Sanksi Baru
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Contoh: Skorsing 3 hari + Panggilan orang tua"
                    value={tindakanForm.sanksi}
                    onChange={(e) => setTindakanForm({ ...tindakanForm, sanksi: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                    Tanggal Tindak Lanjut
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={tindakanForm.tanggalTindakLanjut}
                    onChange={(e) => setTindakanForm({ ...tindakanForm, tanggalTindakLanjut: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                    Catatan Tambahan
                  </label>
                  <textarea
                    className="input-field"
                    rows={2}
                    placeholder="Catatan hasil tindak lanjut..."
                    value={tindakanForm.catatan}
                    onChange={(e) => setTindakanForm({ ...tindakanForm, catatan: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowTindakanModal(null)}>
                    Batal
                  </button>
                  <button type="submit" className="btn-primary">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Zoom Image Modal */}
        {zoomImage && (
          <div className="modal-backdrop" onClick={() => setZoomImage(null)}>
            <div style={{ maxWidth: "90vw", maxHeight: "90vh", overflow: "hidden", position: "relative" }} onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={zoomImage} alt="Preview Bukti" style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: "12px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} />
              <button
                onClick={() => setZoomImage(null)}
                style={{ position: "absolute", top: "10px", right: "10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // RENDER: MAIN LIST & TABLE PAGE
  // ============================================================
  return (
    <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header & Export Controls */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: "0 0 12px 0" }}>
          Data Pelanggaran
        </h1>

        {/* Export Buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => exportPelanggaranExcel(filtered, siswaList, kelasList)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              background: "#dcfce7",
              color: "#15803d",
              border: "none",
              cursor: "pointer",
            }}
          >
            Export Excel
          </button>

          <button
            onClick={() => generatePelanggaranListPDF(filtered, siswaList, kelasList)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              background: "#dbeafe",
              color: "#1d4ed8",
              border: "none",
              cursor: "pointer",
            }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Filter & Controls Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          padding: "16px 20px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          {/* Left: Search & Filter */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, minWidth: "280px" }}>
            <div style={{ flex: 1, maxWidth: "320px", position: "relative" }}>
              <input
                type="text"
                className="input-field"
                placeholder="Cari..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ padding: "8px 14px", fontSize: "13px", borderRadius: "8px" }}
              />
            </div>

            <button
              onClick={() => setShowFilter(!showFilter)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: showFilter ? "#eff6ff" : "#fff",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filter
            </button>
          </div>

          {/* Right: Per Page & + Tambah Pelanggaran */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                cursor: "pointer",
                background: "#fff",
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <button
              onClick={openAdd}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 18px",
                borderRadius: "8px",
                background: "#1d63ff",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(29, 99, 255, 0.2)",
              }}
            >
              + Tambah Pelanggaran
            </button>
          </div>
        </div>

        {/* Extended Filter Panel */}
        {showFilter && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>
                Tingkat
              </label>
              <select
                value={filterTingkat}
                onChange={(e) => { setFilterTingkat(e.target.value); setPage(1); }}
                className="select-field"
                style={{ padding: "6px 10px", fontSize: "12px", borderRadius: "6px" }}
              >
                <option value="">Semua Tingkat</option>
                <option value="Ringan">Ringan</option>
                <option value="Sedang">Sedang</option>
                <option value="Berat">Berat</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="select-field"
                style={{ padding: "6px 10px", fontSize: "12px", borderRadius: "6px" }}
              >
                <option value="">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>
                Kelas
              </label>
              <select
                value={filterKelas}
                onChange={(e) => { setFilterKelas(e.target.value); setPage(1); }}
                className="select-field"
                style={{ padding: "6px 10px", fontSize: "12px", borderRadius: "6px" }}
              >
                <option value="">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>
                Dari Tanggal
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1); }}
                className="input-field"
                style={{ padding: "6px 10px", fontSize: "12px", borderRadius: "6px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => { setFilterDateTo(e.target.value); setPage(1); }}
                className="input-field"
                style={{ padding: "6px 10px", fontSize: "12px", borderRadius: "6px" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#475569", background: "#ffffff" }}>
                <th style={{ padding: "12px 16px", width: "45px", fontWeight: 600 }}>No</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Nama Siswa</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>NIS</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Kelas</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Jenis Pelanggaran</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tingkat</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "center" }}>Poin</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tanggal</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "center" }}>Foto</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "center", width: "60px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "40px 16px", color: "#94a3b8" }}>
                    Tidak ada data pelanggaran ditemukan.
                  </td>
                </tr>
              ) : (
                paginated.map((p, idx) => {
                  const s = getSiswaById(p.siswaId);
                  const k = getKelasName(s?.kelasId);
                  const rowNo = (page - 1) * perPage + idx + 1;

                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                    >
                      <td style={{ padding: "14px 16px", color: "#64748b" }}>{rowNo}</td>
                      <td style={{ padding: "14px 16px", color: "#0f172a" }}>{s?.nama || "-"}</td>
                      <td style={{ padding: "14px 16px", color: "#64748b" }}>{s?.nis || "-"}</td>
                      <td style={{ padding: "14px 16px", color: "#334155" }}>{k}</td>
                      <td style={{ padding: "14px 16px", color: "#1e293b" }}>{p.jenisPelanggaran}</td>
                      <td style={{ padding: "14px 16px" }}>{renderTingkatBadge(p.tingkat)}</td>
                      <td style={{ padding: "14px 16px", textAlign: "center", color: "#334155" }}>{p.poin}</td>
                      <td style={{ padding: "14px 16px", color: "#64748b", whiteSpace: "nowrap" }}>{p.tanggal}</td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => setZoomImage(p.fotoBukti || "/file.svg")}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            border: "none",
                            background: "#eff6ff",
                            color: "#1d63ff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                          title="Lihat foto bukti"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                        </button>
                      </td>
                      <td style={{ padding: "14px 16px" }}>{renderStatusBadge(p.status)}</td>
                      <td style={{ padding: "14px 16px", textAlign: "center", position: "relative" }}>
                        <button
                          onClick={() => setOpenActionsId(openActionsId === p.id ? null : p.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            color: "#64748b",
                            fontSize: "16px",
                            letterSpacing: "1px",
                          }}
                        >
                          •••
                        </button>

                        {/* Action Dropdown Menu */}
                        {openActionsId === p.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: "16px",
                              top: "40px",
                              background: "#fff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "10px",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              zIndex: 100,
                              minWidth: "130px",
                              overflow: "hidden",
                              textAlign: "left",
                            }}
                          >
                            <button
                              onClick={() => {
                                setDetailId(p.id);
                                setOpenActionsId(null);
                              }}
                              style={{ width: "100%", padding: "8px 12px", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: "12px", color: "#1e293b" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                            >
                              Lihat Detail
                            </button>
                            <button
                              onClick={() => openEdit(p)}
                              style={{ width: "100%", padding: "8px 12px", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: "12px", color: "#1d63ff" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(p.id);
                                setOpenActionsId(null);
                              }}
                              style={{ width: "100%", padding: "8px 12px", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: "12px", color: "#ef4444" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar Footer */}
        <div
          style={{
            padding: "14px 20px",
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          <div>
            Menampilkan {paginated.length > 0 ? (page - 1) * perPage + 1 : 0} dari {filtered.length} data
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              style={{
                padding: "5px 12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: page === 1 ? "not-allowed" : "pointer",
                opacity: page === 1 ? 0.5 : 1,
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              &lsaquo; Sebelumnya
            </button>
            <span style={{ padding: "0 8px", fontSize: "12px", color: "#64748b" }}>
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
              style={{
                padding: "5px 12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: page === totalPages || totalPages === 0 ? "not-allowed" : "pointer",
                opacity: page === totalPages || totalPages === 0 ? 0.5 : 1,
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Berikutnya &rsaquo;
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL FORM: TAMBAH / EDIT PELANGGARAN                        */}
      {/* ============================================================ */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div
            className="modal-content animate-fade-in-scale"
            style={{ maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto", borderRadius: "16px", padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                {editingId ? "Edit Pelanggaran" : "Tambah Pelanggaran"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Field 1: Autocomplete Select Siswa */}
              <div style={{ marginBottom: "16px", position: "relative" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Siswa <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px" }}>
                    🔍
                  </span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ketik nama atau NIS siswa..."
                    value={siswaSearch}
                    onChange={(e) => {
                      setSiswaSearch(e.target.value);
                      setShowSiswaDropdown(true);
                      if (!e.target.value) setForm({ ...form, siswaId: "" });
                    }}
                    onFocus={() => setShowSiswaDropdown(true)}
                    style={{ paddingLeft: "36px", borderRadius: "8px" }}
                    required
                  />
                </div>

                {/* Dropdown Options */}
                {showSiswaDropdown && filteredSiswaOptions.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      zIndex: 100,
                      maxHeight: "200px",
                      overflowY: "auto",
                      marginTop: "4px",
                    }}
                  >
                    {filteredSiswaOptions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setForm({ ...form, siswaId: s.id });
                          setSiswaSearch(`${s.nama} (${s.nis})`);
                          setShowSiswaDropdown(false);
                        }}
                        style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                      >
                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b" }}>{s.nama}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          NIS: {s.nis} | Kelas: {getKelasName(s.kelasId)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid 2 Column: Jenis & Tingkat */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Jenis Pelanggaran <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Terlambat, Tidak berseragam"
                    value={form.jenisPelanggaran}
                    onChange={(e) => setForm({ ...form, jenisPelanggaran: e.target.value })}
                    style={{ borderRadius: "8px" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Tingkat <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    className="select-field"
                    value={form.tingkat}
                    onChange={(e) => {
                      const t = e.target.value as TingkatPelanggaran;
                      let defaultPoin = 5;
                      if (t === "Sedang") defaultPoin = 20;
                      if (t === "Berat") defaultPoin = 50;
                      setForm({ ...form, tingkat: t, poin: defaultPoin });
                    }}
                    style={{ borderRadius: "8px" }}
                    required
                  >
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                  </select>
                </div>
              </div>

              {/* Grid 2 Column: Poin & Tanggal */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Poin
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="input-field"
                    value={form.poin}
                    onChange={(e) => setForm({ ...form, poin: Number(e.target.value) })}
                    style={{ borderRadius: "8px" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Tanggal
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    style={{ borderRadius: "8px" }}
                    required
                  />
                </div>
              </div>

              {/* Grid 2 Column: Waktu & Lokasi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Waktu
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={form.waktu}
                    onChange={(e) => setForm({ ...form, waktu: e.target.value })}
                    style={{ borderRadius: "8px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Lokasi
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Ruang kelas, Kantin"
                    value={form.lokasi}
                    onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                    style={{ borderRadius: "8px" }}
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Deskripsi
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Deskripsi detail pelanggaran"
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  style={{ borderRadius: "8px" }}
                />
              </div>

              {/* Foto Bukti Header */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Foto Bukti <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 400 }}>(Upload file atau tempel URL link gambar)</span>
                </label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="Tempel URL Link Gambar (contoh: https://images.unsplash.com/...)"
                  value={form.fotoBukti}
                  onChange={(e) => setForm({ ...form, fotoBukti: e.target.value })}
                  style={{ borderRadius: "8px", marginBottom: "10px" }}
                />

                {/* Upload Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `1.5px dashed ${isDragOver ? "#1d63ff" : "#e2e8f0"}`,
                    background: isDragOver ? "#f0f4ff" : "#fafafa",
                    borderRadius: "10px",
                    padding: "24px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                  />
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", color: "#1d63ff" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                    Atau klik untuk upload file gambar
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                    PNG, JPG, GIF, WEBP (max 5MB)
                  </div>
                </div>

                {/* Preview Thumbnail */}
                {form.fotoBukti && (
                  <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "6px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.fotoBukti} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>✓ Foto bukti dilampirkan</span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fotoBukti: "" })}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              {/* Form Actions Footer */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#fff",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "8px 20px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#1d63ff",
                    color: "#fff",
                    border: "none",
                    padding: "8px 24px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Simpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content animate-fade-in-scale" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ef4444", marginBottom: "10px" }}>
              Konfirmasi Hapus
            </h3>
            <p style={{ fontSize: "14px", color: "#475569", marginBottom: "20px" }}>
              Apakah Anda yakin ingin menghapus data pelanggaran ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                Batal
              </button>
              <button
                className="btn-primary"
                style={{ background: "#ef4444" }}
                onClick={async () => {
                  await onDelete(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Zoom Modal */}
      {zoomImage && (
        <div className="modal-backdrop" onClick={() => setZoomImage(null)}>
          <div style={{ maxWidth: "90vw", maxHeight: "90vh", overflow: "hidden", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoomImage} alt="Preview Bukti" style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: "12px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} />
            <button
              onClick={() => setZoomImage(null)}
              style={{ position: "absolute", top: "10px", right: "10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
