import * as XLSX from "xlsx";
import type { Pelanggaran, Siswa, Kelas } from "@/app/data/mockData";

export function exportPelanggaranExcel(
  pelanggaranList: Pelanggaran[],
  siswaList: Siswa[],
  kelasList: Kelas[]
) {
  const getSiswa = (id: string) => siswaList.find((s) => s.id === id);
  const getKelasName = (kelasId?: string) => kelasList.find((k) => k.id === kelasId)?.nama || "-";

  const data = pelanggaranList.map((p, index) => {
    const s = getSiswa(p.siswaId);
    return {
      No: index + 1,
      "Nama Siswa": s?.nama || "-",
      NIS: s?.nis || "-",
      Kelas: getKelasName(s?.kelasId),
      "Jenis Pelanggaran": p.jenisPelanggaran,
      Tingkat: p.tingkat,
      Poin: p.poin,
      Tanggal: p.tanggal,
      Waktu: p.waktu,
      Lokasi: p.lokasi,
      Status: p.status,
      Pelapor: p.pelapor || "Admin Sekolah",
      Sanksi: p.sanksi || "-",
      "Tanggal Tindak Lanjut": p.tanggalTindakLanjut || "-",
      Catatan: p.catatan || "-",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pelanggaran");

  const fileName = `Rekap_Pelanggaran_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
