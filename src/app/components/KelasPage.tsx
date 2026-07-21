"use client";

import React, { useState, useMemo } from "react";
import type { Kelas } from "@/app/data/mockData";

interface KelasPageProps {
  kelasList: Kelas[];
  onAdd: (k: Omit<Kelas, "id">) => Promise<void> | void;
  onUpdate: (id: string, k: Omit<Kelas, "id">) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

export default function KelasPage({ kelasList, onAdd, onUpdate, onDelete }: KelasPageProps) {
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNama, setFormNama] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return kelasList.filter((k) => k.nama.toLowerCase().includes(search.toLowerCase()));
  }, [kelasList, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => {
    setEditingId(null);
    setFormNama("");
    setShowModal(true);
  };

  const openEdit = (k: Kelas) => {
    setEditingId(k.id);
    setFormNama(k.nama);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await onUpdate(editingId, { nama: formNama.trim() });
      } else {
        await onAdd({ nama: formNama.trim() });
      }
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      await onDelete(id);
      setShowDeleteConfirm(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px", color: "var(--text-primary)" }}>
        Kelas
      </h1>

      <div className="card animate-fade-in" style={{ padding: "24px" }}>
        {/* Top Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <select className="select-field" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} style={{ width: "72px" }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <button className="btn-primary" onClick={openAdd}>+ Tambah Kelas</button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>No</th>
                <th>Nama Kelas</th>
                <th style={{ width: "180px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((k, i) => (
                <tr key={k.id}>
                  <td>{(page - 1) * perPage + i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{k.nama}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn-warning" onClick={() => openEdit(k)}>Edit</button>
                      <button className="btn-danger" onClick={() => setShowDeleteConfirm(k.id)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                {editingId ? "Edit Kelas" : "Tambah Kelas"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Nama Kelas</label>
                <input className="input-field" placeholder="Contoh: X RPL 3" value={formNama} onChange={(e) => setFormNama(e.target.value)} required autoFocus />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)} style={{ padding: "10px 24px" }} disabled={isSubmitting}>Batal</button>
                <button type="submit" className="btn-primary" style={{ padding: "10px 24px", opacity: isSubmitting ? 0.7 : 1 }} disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : editingId ? "Simpan" : "Tambah"}
                </button>
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
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Hapus Kelas?</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
                Data yang dihapus tidak dapat dikembalikan.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <button className="btn-outline" onClick={() => setShowDeleteConfirm(null)} style={{ padding: "10px 24px" }} disabled={isSubmitting}>Batal</button>
                <button className="btn-danger" onClick={() => handleDelete(showDeleteConfirm)} style={{ padding: "10px 24px", opacity: isSubmitting ? 0.7 : 1 }} disabled={isSubmitting}>
                  {isSubmitting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
