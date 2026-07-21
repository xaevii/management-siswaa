import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Pelanggaran, Siswa, Kelas } from "@/app/data/mockData";

export async function generatePelanggaranPDF(
  pelanggaran: Pelanggaran,
  siswa: Siswa | null,
  kelas: Kelas | null
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Header Banner
  doc.setFillColor(29, 99, 255); // #1d63ff
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("LAPORAN PELANGGARAN SISWA", 14, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("SMK NEGERI 2 MALANG | SISTEM MANAJEMEN SISWA", 14, 20);
  doc.text(`Tanggal Cetak: ${printDate}`, pageWidth - 14, 20, { align: "right" });

  let currentY = 36;

  // Section 1: Informasi Siswa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // dark slate
  doc.text("1. INFORMASI SISWA", 14, currentY);

  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    head: [["Field", "Keterangan"]],
    body: [
      ["Nama Siswa", siswa?.nama || "-"],
      ["NIS", siswa?.nis || "-"],
      ["Kelas", kelas?.nama || "-"],
      ["Jenis Kelamin", siswa?.jenisKelamin === "L" ? "Laki-laki" : siswa?.jenisKelamin === "P" ? "Perempuan" : "-"],
      ["Alamat", siswa?.alamat || "-"],
    ],
    theme: "striped",
    headStyles: { fillColor: [29, 99, 255], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9.5, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 45, fontStyle: "bold" } },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Section 2: Detail Pelanggaran
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("2. DETAIL PELANGGARAN", 14, currentY);

  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    head: [["Informasi", "Detail"]],
    body: [
      ["Jenis Pelanggaran", pelanggaran.jenisPelanggaran],
      ["Tingkat & Poin", `${pelanggaran.tingkat} (${pelanggaran.poin} Poin)`],
      ["Tanggal & Waktu", `${pelanggaran.tanggal} - ${pelanggaran.waktu} WIB`],
      ["Lokasi Kejadian", pelanggaran.lokasi || "-"],
      ["Status Pelanggaran", pelanggaran.status],
      ["Pelapor", pelanggaran.pelapor || "Admin Sekolah"],
      ["Deskripsi Kejadian", pelanggaran.deskripsi || "-"],
    ],
    theme: "striped",
    headStyles: { fillColor: [29, 99, 255], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9.5, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 45, fontStyle: "bold" } },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Section 3: Bukti Pelanggaran
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("3. BUKTI PELANGGARAN", 14, currentY);

  currentY += 6;

  if (pelanggaran.fotoBukti) {
    try {
      // Draw placeholder or image box
      const imgWidth = 80;
      const imgHeight = 50;
      const imgX = (pageWidth - imgWidth) / 2;

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.rect(imgX, currentY, imgWidth, imgHeight, "FD");

      if (pelanggaran.fotoBukti.startsWith("data:image/")) {
        doc.addImage(pelanggaran.fotoBukti, "JPEG", imgX + 2, currentY + 2, imgWidth - 4, imgHeight - 4);
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`[Bukti Foto Link: ${pelanggaran.fotoBukti.substring(0, 45)}...]`, pageWidth / 2, currentY + imgHeight / 2, { align: "center" });
      }

      currentY += imgHeight + 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Tercatat pada: ${pelanggaran.tanggal} ${pelanggaran.waktu}`, pageWidth / 2, currentY, { align: "center" });
      currentY += 8;
    } catch {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Gagal memuat format foto bukti", 14, currentY);
      currentY += 8;
    }
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Tidak ada foto bukti yang dilampirkan.", 14, currentY);
    currentY += 8;
  }

  // Section 4: Tindakan yang Diambil
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("4. TINDAKAN YANG DIAMBIL", 14, currentY);

  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    head: [["Informasi", "Keterangan"]],
    body: [
      ["Sanksi / Tindakan", pelanggaran.sanksi || "Belum ada tindakan"],
      ["Tanggal Tindak Lanjut", pelanggaran.tanggalTindakLanjut || "-"],
      ["Catatan Tambahan", pelanggaran.catatan || "-"],
    ],
    theme: "striped",
    headStyles: { fillColor: [29, 99, 255], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9.5, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 45, fontStyle: "bold" } },
  });

  // Footer / Tanda Tangan
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16;
  if (finalY < doc.internal.pageSize.getHeight() - 40) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);

    const rightX = pageWidth - 50;
    doc.text(`Malang, ${printDate}`, rightX, finalY, { align: "center" });
    doc.text("Petugas BK / Admin", rightX, finalY + 5, { align: "center" });

    doc.text("( ____________________ )", rightX, finalY + 25, { align: "center" });
  }

  doc.save(`Laporan_Pelanggaran_${siswa?.nama.replace(/\s+/g, "_") || "Siswa"}_${pelanggaran.tanggal}.pdf`);
}

export function generatePelanggaranListPDF(
  pelanggaranList: Pelanggaran[],
  siswaList: Siswa[],
  kelasList: Kelas[]
) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Header Banner
  doc.setFillColor(29, 99, 255);
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("REKAPITULASI PELANGGARAN SISWA", 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("SMK NEGERI 2 MALANG | TOTAL RECORD: " + pelanggaranList.length, 14, 18);
  doc.text(`Tanggal Cetak: ${printDate}`, pageWidth - 14, 18, { align: "right" });

  const getSiswa = (id: string) => siswaList.find((s) => s.id === id);
  const getKelasName = (kelasId?: string) => kelasList.find((k) => k.id === kelasId)?.nama || "-";

  const tableBody = pelanggaranList.map((p, index) => {
    const s = getSiswa(p.siswaId);
    return [
      index + 1,
      s?.nama || "-",
      s?.nis || "-",
      getKelasName(s?.kelasId),
      p.jenisPelanggaran,
      p.tingkat,
      p.poin,
      p.tanggal,
      p.status,
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: [["No", "Nama Siswa", "NIS", "Kelas", "Pelanggaran", "Tingkat", "Poin", "Tanggal", "Status"]],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [29, 99, 255], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
  });

  doc.save(`Rekap_Pelanggaran_${new Date().toISOString().slice(0, 10)}.pdf`);
}
