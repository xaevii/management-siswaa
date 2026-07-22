"use client";

import React, { useState, useMemo } from "react";
import type { Kelas, Siswa } from "@/app/data/mockData";
import { initialKelas } from "@/app/data/mockData";

interface SiswaPageProps {
  siswaList: Siswa[];
  kelasList: Kelas[];
  onAdd: (s: Omit<Siswa, "id">) => void;
  onUpdate: (id: string, s: Omit<Siswa, "id">) => void;
  onDelete: (id: string) => void;
}

const emptyForm = {
  nama: "", nis: "", tanggalLahir: "", alamat: "", kelasId: "", jenisKelamin: "" as "L" | "P" | "",
};

export default function SiswaPage({ siswaList, kelasList, onAdd, onUpdate, onDelete }: SiswaPageProps) {
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Helper for matching class
  const getKelasName = (kelasId: string) => {
    if (!kelasId) return "-";
    const directMatch = kelasList.find((k) => k.id === kelasId || k.nama === kelasId);
    if (directMatch) return directMatch.nama;
    const mockMatch = initialKelas.find((ik) => ik.id === kelasId);
    if (mockMatch) return mockMatch.nama;
    return "-";
  };

  // Filter + search
  const filtered = useMemo(() => {
    return siswaList.filter((s) => {
      const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
      const sKelasName = getKelasName(s.kelasId);
      const fKelasName = filterKelas ? getKelasName(filterKelas) : "";
      const matchKelas = filterKelas ? (s.kelasId === filterKelas || sKelasName === fKelasName) : true;
      return matchSearch && matchKelas;
    });
  }, [siswaList, search, filterKelas, kelasList]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s: Siswa) => {
    setEditingId(s.id);
    setForm({ nama: s.nama, nis: s.nis, tanggalLahir: s.tanggalLahir, alamat: s.alamat, kelasId: s.kelasId, jenisKelamin: s.jenisKelamin });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.nis || !form.kelasId || !form.jenisKelamin) return;
    const data: Omit<Siswa, "id"> = {
      nama: form.nama,
      nis: form.nis,
      tanggalLahir: form.tanggalLahir,
      alamat: form.alamat,
      kelasId: form.kelasId,
      jenisKelamin: form.jenisKelamin as "L" | "P",
    };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "28px", color: "var(--text-primary)" }}>
        Siswa
      </h1>

      <div className="card animate-fade-in" style={{ padding: "28px" }}>
        {/* Top Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "14px" }}>
          {/* Search */}
          <div style={{ position: "relative", minWidth: "240px" }}>
            <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <input
              className="input-field"
              placeholder="Cari..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: "36px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500, whiteSpace: "nowrap" }}>Filter by Kelas:</span>
              <select className="select-field" value={filterKelas} onChange={(e) => { setFilterKelas(e.target.value); setPage(1); }} style={{ width: "160px" }}>
                <option value="">Semua Kelas</option>
                {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <select className="select-field" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} style={{ width: "72px" }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <button className="btn-primary" onClick={openAdd}>+ Tambah Siswa</button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>No</th>
                <th>Nama</th>
                <th>NIS</th>
                <th>Kelas</th>
                <th>Jenis Kelamin</th>
                <th>Tanggal Lahir</th>
                <th style={{ width: "160px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, i) => (
                <tr key={s.id}>
                  <td>{(page - 1) * perPage + i + 1}</td>
                  <td style={{ fontWeight: 500, color: "#1d63ff" }}>{s.nama}</td>
                  <td>{s.nis}</td>
                  <td>{getKelasName(s.kelasId)}</td>
                  <td>{s.jenisKelamin}</td>
                  <td>{s.tanggalLahir}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn-warning" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn-danger" onClick={() => setShowDeleteConfirm(s.id)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
          <span style={{ fontSize: "13px", color: "#1d63ff", fontWeight: 500 }}>
            Menampilkan {Math.min(perPage, filtered.length)} dari {filtered.length} data
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              &lsaquo; Sebelumnya
            </button>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", padding: "0 8px" }}>
              {page}/{totalPages || 1}
            </span>
            <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Berikutnya &rsaquo;
            </button>
          </div>
        </div>
      </div>

      {/* ---- Modal Form ---- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                {editingId ? "Edit Siswa" : "Tambah Siswa"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Nama Lengkap</label>
                  <input className="input-field" placeholder="Masukkan nama lengkap" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>NIS</label>
                  <input className="input-field" placeholder="Masukkan NIS" value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Tanggal Lahir</label>
                  <input type="date" className="input-field" value={form.tanggalLahir} onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Alamat</label>
                  <input className="input-field" placeholder="Masukkan alamat" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Kelas</label>
                  <select className="select-field" value={form.kelasId} onChange={(e) => setForm({ ...form, kelasId: e.target.value })} required>
                    <option value="">Pilih Kelas</option>
                    {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Jenis Kelamin</label>
                  <select className="select-field" value={form.jenisKelamin} onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value as "L" | "P" })} required>
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)} style={{ padding: "10px 24px" }}>Batal</button>
                <button type="submit" className="btn-primary" style={{ padding: "10px 24px" }}>{editingId ? "Simpan" : "Tambah"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Delete Confirm Modal ---- */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div style={{ padding: "32px 28px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Hapus Siswa?</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
                Data yang dihapus tidak dapat dikembalikan.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <button className="btn-outline" onClick={() => setShowDeleteConfirm(null)} style={{ padding: "10px 24px" }}>Batal</button>
                <button className="btn-danger" onClick={() => handleDelete(showDeleteConfirm)} style={{ padding: "10px 24px" }}>Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
