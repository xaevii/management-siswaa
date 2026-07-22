// ============================================================
// Mock Data Store
// ============================================================

export interface Kelas {
  id: string;
  nama: string;
}

export interface Siswa {
  id: string;
  nama: string;
  nis: string;
  kelasId: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: string;
  alamat: string;
}

export type TingkatPelanggaran = "Ringan" | "Sedang" | "Berat";
export type StatusPelanggaran = "Aktif" | "Selesai";

export interface Pelanggaran {
  id: string;
  siswaId: string;
  jenisPelanggaran: string;
  tingkat: TingkatPelanggaran;
  poin: number;
  tanggal: string;
  waktu: string;
  lokasi: string;
  deskripsi: string;
  fotoBukti: string;
  status: StatusPelanggaran;
  pelapor: string;
  sanksi: string;
  tanggalTindakLanjut: string;
  catatan: string;
}

// ---- Kelas Data ----
export const initialKelas: Kelas[] = [
  { id: "k1", nama: "X RPL 1" },
  { id: "k2", nama: "X RPL 2" },
  { id: "k3", nama: "XI RPL 1" },
  { id: "k4", nama: "XI RPL 2" },
  { id: "k5", nama: "XII RPL 1" },
  { id: "k6", nama: "XII RPL 2" },
];

// ---- Siswa Data ----
export const initialSiswa: Siswa[] = [
  { id: "s1", nama: "Ahmad Rizki Pratama", nis: "2024001", kelasId: "k1", jenisKelamin: "L", tanggalLahir: "2008-05-15", alamat: "Jl. Merdeka No. 10, Malang" },
  { id: "s2", nama: "Siti Nurhaliza", nis: "2024002", kelasId: "k1", jenisKelamin: "P", tanggalLahir: "2008-08-21", alamat: "Jl. Pahlawan No. 5, Malang" },
  { id: "s3", nama: "Budi Santoso", nis: "2024003", kelasId: "k1", jenisKelamin: "L", tanggalLahir: "2009-01-10", alamat: "Jl. Sudirman No. 22, Malang" },
  { id: "s4", nama: "Dewi Lestari", nis: "2024004", kelasId: "k2", jenisKelamin: "P", tanggalLahir: "2008-11-02", alamat: "Jl. Diponegoro No. 8, Malang" },
  { id: "s5", nama: "Eko Prasetyo", nis: "2024005", kelasId: "k2", jenisKelamin: "L", tanggalLahir: "2008-03-30", alamat: "Jl. Gatot Subroto No. 15, Malang" },
  { id: "s6", nama: "Fitri Handayani", nis: "2024006", kelasId: "k2", jenisKelamin: "P", tanggalLahir: "2009-02-14", alamat: "Jl. Ahmad Yani No. 3, Malang" },
  { id: "s7", nama: "Galih Saputra", nis: "2023001", kelasId: "k3", jenisKelamin: "L", tanggalLahir: "2007-07-19", alamat: "Jl. Soekarno No. 12, Malang" },
  { id: "s8", nama: "Hana Salsabila", nis: "2023002", kelasId: "k3", jenisKelamin: "P", tanggalLahir: "2007-09-25", alamat: "Jl. Kartini No. 7, Malang" },
  { id: "s9", nama: "Irfan Maulana", nis: "2023003", kelasId: "k3", jenisKelamin: "L", tanggalLahir: "2007-12-05", alamat: "Jl. Veteran No. 18, Malang" },
  { id: "s10", nama: "Jihan Aulia", nis: "2023004", kelasId: "k4", jenisKelamin: "P", tanggalLahir: "2007-04-18", alamat: "Jl. Tugu No. 9, Malang" },
  { id: "s11", nama: "Krisna Aditya", nis: "2023005", kelasId: "k4", jenisKelamin: "L", tanggalLahir: "2007-06-22", alamat: "Jl. Ijen No. 11, Malang" },
  { id: "s12", nama: "Lina Marlina", nis: "2023006", kelasId: "k4", jenisKelamin: "P", tanggalLahir: "2007-10-30", alamat: "Jl. Bandung No. 4, Malang" },
  { id: "s13", nama: "Miko Ardiansyah", nis: "2022001", kelasId: "k5", jenisKelamin: "L", tanggalLahir: "2006-08-12", alamat: "Jl. Jakarta No. 20, Malang" },
  { id: "s14", nama: "Nadia Putri", nis: "2022002", kelasId: "k5", jenisKelamin: "P", tanggalLahir: "2006-05-08", alamat: "Jl. Surabaya No. 6, Malang" },
  { id: "s15", nama: "Oscar Firmansyah", nis: "2022003", kelasId: "k5", jenisKelamin: "L", tanggalLahir: "2006-11-17", alamat: "Jl. Semarang No. 13, Malang" },
  { id: "s16", nama: "Rafi Hidayat", nis: "2022005", kelasId: "k6", jenisKelamin: "L", tanggalLahir: "2006-02-28", alamat: "Jl. Yogyakarta No. 16, Malang" },
  { id: "s17", nama: "Sarah Amelia", nis: "2022006", kelasId: "k6", jenisKelamin: "P", tanggalLahir: "2006-07-03", alamat: "Jl. Bali No. 2, Malang" },
  { id: "s18", nama: "Taufik Hidayat", nis: "2022007", kelasId: "k6", jenisKelamin: "L", tanggalLahir: "2006-09-14", alamat: "Jl. Lombok No. 19, Malang" },
];

// ---- Pelanggaran Data ----
export const initialPelanggaran: Pelanggaran[] = [
  { id: "p1", siswaId: "s3", jenisPelanggaran: "Tidak Mengerjakan Tugas", tingkat: "Ringan", poin: 5, tanggal: "2026-07-08", waktu: "08:00", lokasi: "Ruang Kelas X RPL 1", deskripsi: "Tidak mengerjakan tugas Matematika", fotoBukti: "", status: "Selesai", pelapor: "Admin Sekolah", sanksi: "Peringatan lisan", tanggalTindakLanjut: "2026-07-09", catatan: "Siswa berjanji tidak mengulangi" },
  { id: "p2", siswaId: "s1", jenisPelanggaran: "Terlambat Masuk Kelas", tingkat: "Ringan", poin: 10, tanggal: "2026-07-05", waktu: "07:30", lokasi: "Gerbang Utama", deskripsi: "Terlambat 30 menit karena bangun kesiangan.", fotoBukti: "", status: "Aktif", pelapor: "Admin Sekolah", sanksi: "", tanggalTindakLanjut: "", catatan: "" },
  { id: "p3", siswaId: "s7", jenisPelanggaran: "Membolos", tingkat: "Sedang", poin: 25, tanggal: "2026-06-18", waktu: "10:00", lokasi: "Kantin Sekolah", deskripsi: "Ditemukan di kantin saat jam pelajaran berlangsung", fotoBukti: "", status: "Aktif", pelapor: "Admin Sekolah", sanksi: "", tanggalTindakLanjut: "", catatan: "" },
  { id: "p4", siswaId: "s5", jenisPelanggaran: "Seragam Tidak Lengkap", tingkat: "Ringan", poin: 5, tanggal: "2026-06-12", waktu: "07:00", lokasi: "Lapangan Upacara", deskripsi: "Tidak memakai dasi saat upacara", fotoBukti: "", status: "Selesai", pelapor: "Admin Sekolah", sanksi: "Teguran tertulis", tanggalTindakLanjut: "2026-06-13", catatan: "" },
  { id: "p5", siswaId: "s4", jenisPelanggaran: "Menggunakan HP saat Pelajaran", tingkat: "Sedang", poin: 15, tanggal: "2026-05-15", waktu: "09:30", lokasi: "Ruang Kelas X RPL 2", deskripsi: "Bermain game saat jam pelajaran", fotoBukti: "", status: "Selesai", pelapor: "Admin Sekolah", sanksi: "HP disita selama 3 hari", tanggalTindakLanjut: "2026-05-18", catatan: "HP sudah dikembalikan" },
  { id: "p6", siswaId: "s9", jenisPelanggaran: "Terlambat Masuk Kelas", tingkat: "Ringan", poin: 10, tanggal: "2026-05-03", waktu: "07:10", lokasi: "Gerbang Sekolah", deskripsi: "Terlambat 10 menit", fotoBukti: "", status: "Selesai", pelapor: "Admin Sekolah", sanksi: "Peringatan lisan", tanggalTindakLanjut: "2026-05-03", catatan: "" },
  { id: "p7", siswaId: "s2", jenisPelanggaran: "Terlambat Masuk Kelas", tingkat: "Ringan", poin: 10, tanggal: "2026-04-21", waktu: "07:20", lokasi: "Gerbang Sekolah", deskripsi: "Terlambat 20 menit", fotoBukti: "", status: "Selesai", pelapor: "Admin Sekolah", sanksi: "Peringatan lisan", tanggalTindakLanjut: "2026-04-21", catatan: "" },
  { id: "p8", siswaId: "s8", jenisPelanggaran: "Merokok", tingkat: "Berat", poin: 50, tanggal: "2026-04-07", waktu: "11:00", lokasi: "Toilet Sekolah", deskripsi: "Kedapatan merokok di toilet", fotoBukti: "", status: "Selesai", pelapor: "Admin Sekolah", sanksi: "Skorsing 3 hari + panggilan orang tua", tanggalTindakLanjut: "2026-04-10", catatan: "Orang tua sudah dipanggil" },
  { id: "p9", siswaId: "s6", jenisPelanggaran: "Tidak Mengerjakan Tugas", tingkat: "Ringan", poin: 5, tanggal: "2026-03-25", waktu: "08:30", lokasi: "Ruang Kelas X RPL 2", deskripsi: "Tidak mengumpulkan tugas Bahasa Inggris", fotoBukti: "", status: "Selesai", pelapor: "Admin Sekolah", sanksi: "Mengerjakan tugas tambahan", tanggalTindakLanjut: "2026-03-27", catatan: "" },
  { id: "p10", siswaId: "s10", jenisPelanggaran: "Berkelahi", tingkat: "Berat", poin: 75, tanggal: "2026-03-10", waktu: "12:00", lokasi: "Halaman Sekolah", deskripsi: "Berkelahi dengan siswa lain", fotoBukti: "", status: "Selesai", pelapor: "Admin Sekolah", sanksi: "Skorsing 5 hari + mediasi", tanggalTindakLanjut: "2026-03-15", catatan: "Kedua pihak sudah berdamai" },
  { id: "p11", siswaId: "s1", jenisPelanggaran: "Tidak Mengerjakan Tugas", tingkat: "Ringan", poin: 5, tanggal: "2026-02-15", waktu: "08:00", lokasi: "Ruang Kelas X RPL 1", deskripsi: "Tidak mengerjakan PR Fisika", fotoBukti: "", status: "Selesai", pelapor: "Admin Sekolah", sanksi: "Peringatan lisan", tanggalTindakLanjut: "2026-02-15", catatan: "" },
  { id: "p12", siswaId: "s7", jenisPelanggaran: "Membolos", tingkat: "Sedang", poin: 25, tanggal: "2026-02-03", waktu: "09:00", lokasi: "Warnet Dekat Sekolah", deskripsi: "Membolos pelajaran dan pergi ke warnet", fotoBukti: "", status: "Aktif", pelapor: "Admin Sekolah", sanksi: "", tanggalTindakLanjut: "", catatan: "" },
];

// ---- Trend Pelanggaran (monthly data for area chart) ----
export const trenPelanggaran = [
  { bulan: "Feb", pelanggaran: 2, diselesaikan: 1 },
  { bulan: "Mar", pelanggaran: 2, diselesaikan: 2 },
  { bulan: "Apr", pelanggaran: 2, diselesaikan: 2 },
  { bulan: "Mei", pelanggaran: 2, diselesaikan: 2 },
  { bulan: "Jun", pelanggaran: 2, diselesaikan: 1 },
  { bulan: "Jul", pelanggaran: 2, diselesaikan: 2 },
];
