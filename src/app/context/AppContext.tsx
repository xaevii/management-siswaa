"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Toast, { type ToastMessage, type ToastType } from "@/app/components/Toast";
import {
  initialKelas,
  initialSiswa,
  initialPelanggaran,
  type Kelas,
  type Siswa,
  type Pelanggaran,
  type TingkatPelanggaran,
  type StatusPelanggaran,
} from "@/app/data/mockData";

export interface UserProfile {
  id: string;
  email: string;
  nama: string;
  role: string;
}

interface AppContextType {
  // Auth
  isLoggedIn: boolean;
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  showRegister: boolean;
  setShowRegister: (v: boolean) => void;
  login: () => void;
  logout: () => Promise<void>;

  // Toasts
  addToast: (type: ToastType, message: string) => void;

  // Loading
  isLoadingData: boolean;

  // Kelas
  kelasList: Kelas[];
  addKelas: (k: Omit<Kelas, "id">) => void;
  updateKelas: (id: string, k: Omit<Kelas, "id">) => void;
  deleteKelas: (id: string) => void;

  // Siswa
  siswaList: Siswa[];
  addSiswa: (s: Omit<Siswa, "id">) => void;
  updateSiswa: (id: string, s: Omit<Siswa, "id">) => void;
  deleteSiswa: (id: string) => void;

  // Pelanggaran
  pelanggaranList: Pelanggaran[];
  addPelanggaran: (p: Omit<Pelanggaran, "id">) => Promise<void>;
  updatePelanggaran: (id: string, p: Omit<Pelanggaran, "id">) => Promise<void>;
  deletePelanggaran: (id: string) => Promise<void>;
  markPelanggaranSelesai: (id: string) => Promise<void>;
  updateTindakanPelanggaran: (id: string, sanksi: string, tanggalTindakLanjut: string, catatan: string) => Promise<void>;

  // Sidebar
  activeMenu: string;
  setActiveMenu: (m: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

let _id = 100;
function genId(prefix: string) {
  return `${prefix}${++_id}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [kelasList, setKelasList] = useState<Kelas[]>(initialKelas);
  const [siswaList, setSiswaList] = useState<Siswa[]>(initialSiswa);
  const [pelanggaranList, setPelanggaranList] = useState<Pelanggaran[]>(initialPelanggaran);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchUserProfile = useCallback(async (userId: string, userEmail?: string) => {
    try {
      const { data } = await supabase.from("users").select("*").eq("id", userId).single();
      if (data) {
        setUserProfile(data);
      } else {
        setUserProfile({
          id: userId,
          email: userEmail || "",
          nama: userEmail ? userEmail.split("@")[0] : "Admin",
          role: "admin",
        });
      }
    } catch {
      setUserProfile({
        id: userId,
        email: userEmail || "",
        nama: userEmail ? userEmail.split("@")[0] : "Admin",
        role: "admin",
      });
    }
  }, []);

  // Fetch Data from Supabase
  const fetchDataFromSupabase = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // 1. Kelas
      let { data: dbKelas, error: kelasErr } = await supabase
        .from("kelas")
        .select("*")
        .order("id", { ascending: true });

      // Auto-seed if database table is empty
      if (!kelasErr && (!dbKelas || dbKelas.length === 0)) {
        const seedPayload = initialKelas.map((k) => ({ nama: k.nama }));
        const { data: seeded } = await supabase.from("kelas").insert(seedPayload).select();
        if (seeded) dbKelas = seeded;
      }

      if (dbKelas && dbKelas.length > 0) {
        setKelasList(dbKelas.map((k) => ({ id: String(k.id), nama: k.nama || k.name || "" })));
      }

      // 2. Siswa
      let { data: dbSiswa, error: siswaErr } = await supabase.from("siswa").select("*");

      // Auto-seed siswa if database table is empty
      if (!siswaErr && (!dbSiswa || dbSiswa.length === 0) && dbKelas && dbKelas.length > 0) {
        const kelasNameToId: Record<string, string> = {};
        dbKelas.forEach((k) => {
          if (k.nama) kelasNameToId[k.nama] = String(k.id);
        });

        const seedSiswaPayload = initialSiswa.map((s) => {
          const classNama = initialKelas.find((ik) => ik.id === s.kelasId)?.nama || "";
          const realKelasId = kelasNameToId[classNama] || null;
          return {
            nama: s.nama,
            nis: s.nis,
            kelas_id: realKelasId ? (isNaN(Number(realKelasId)) ? realKelasId : Number(realKelasId)) : null,
            jenis_kelamin: s.jenisKelamin,
            tanggal_lahir: s.tanggalLahir,
            alamat: s.alamat,
          };
        });

        const { data: seededSiswa } = await supabase.from("siswa").insert(seedSiswaPayload).select();
        if (seededSiswa) dbSiswa = seededSiswa;
      }

      if (dbSiswa && dbSiswa.length > 0) {
        setSiswaList(
          dbSiswa.map((s) => ({
            id: String(s.id),
            nama: s.nama,
            nis: s.nis,
            kelasId: String(s.kelas_id || ""),
            jenisKelamin: s.jenis_kelamin as "L" | "P",
            tanggalLahir: s.tanggal_lahir || "",
            alamat: s.alamat || "",
          }))
        );
      }

      // 3. Pelanggaran
      const { data: dbPelanggaran, error: pErr } = await supabase.from("pelanggaran").select("*");
      if (!pErr && dbPelanggaran && dbPelanggaran.length > 0) {
        setPelanggaranList(
          dbPelanggaran.map((p) => ({
            id: String(p.id),
            siswaId: String(p.siswa_id),
            jenisPelanggaran: p.jenis_pelanggaran,
            tingkat: p.tingkat as TingkatPelanggaran,
            poin: Number(p.poin),
            tanggal: p.tanggal,
            waktu: p.waktu ? p.waktu.slice(0, 5) : "",
            lokasi: p.lokasi || "",
            deskripsi: p.deskripsi || "",
            fotoBukti: p.foto_bukti || "",
            status: p.status as StatusPelanggaran,
            pelapor: p.pelapor || "Admin Sekolah",
            sanksi: p.sanksi || "",
            tanggalTindakLanjut: p.tanggal_tindak_lanjut || "",
            catatan: p.catatan || "",
          }))
        );
      }
    } catch {
      // Fallback to initial mock data
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
        fetchUserProfile(session.user.id, session.user.email);
        fetchDataFromSupabase();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
        fetchUserProfile(session.user.id, session.user.email);
        fetchDataFromSupabase();
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, fetchDataFromSupabase]);

  const login = useCallback(() => {
    setIsLoggedIn(true);
    fetchDataFromSupabase();
  }, [fetchDataFromSupabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setUserProfile(null);
  }, []);

  // Kelas CRUD via Supabase
  const addKelas = useCallback(
    async (k: Omit<Kelas, "id">) => {
      try {
        const { data, error } = await supabase
          .from("kelas")
          .insert({ nama: k.nama })
          .select()
          .single();

        if (error) {
          addToast("error", `Gagal menambahkan kelas: ${error.message}`);
          const fallbackItem: Kelas = { ...k, id: genId("k") };
          setKelasList((prev) => [...prev, fallbackItem]);
          return;
        }

        const newItem: Kelas = { id: String(data.id), nama: data.nama || data.name || k.nama };
        setKelasList((prev) => [...prev, newItem]);
        addToast("success", "Kelas berhasil ditambahkan!");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        addToast("error", msg);
      }
    },
    [addToast]
  );

  const updateKelas = useCallback(
    async (id: string, k: Omit<Kelas, "id">) => {
      try {
        const { error } = await supabase
          .from("kelas")
          .update({ nama: k.nama, updated_at: new Date().toISOString() })
          .eq("id", id);

        if (error) {
          addToast("error", `Gagal memperbarui kelas: ${error.message}`);
        } else {
          addToast("success", "Kelas berhasil diperbarui!");
        }

        setKelasList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...k } : item))
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        addToast("error", msg);
      }
    },
    [addToast]
  );

  const deleteKelas = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from("kelas").delete().eq("id", id);
        if (error) {
          addToast("error", `Gagal menghapus kelas: ${error.message}`);
        } else {
          addToast("success", "Kelas berhasil dihapus!");
        }
        setKelasList((prev) => prev.filter((item) => item.id !== id));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        addToast("error", msg);
      }
    },
    [addToast]
  );

  // Siswa CRUD
  const addSiswa = useCallback((s: Omit<Siswa, "id">) => {
    setSiswaList((prev) => [...prev, { ...s, id: genId("s") }]);
  }, []);
  const updateSiswa = useCallback((id: string, s: Omit<Siswa, "id">) => {
    setSiswaList((prev) => prev.map((item) => (item.id === id ? { ...item, ...s } : item)));
  }, []);
  const deleteSiswa = useCallback((id: string) => {
    setSiswaList((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Pelanggaran CRUD via Supabase
  const addPelanggaran = useCallback(
    async (p: Omit<Pelanggaran, "id">) => {
      try {
        const payload = {
          siswa_id: p.siswaId,
          jenis_pelanggaran: p.jenisPelanggaran,
          tingkat: p.tingkat,
          poin: p.poin,
          tanggal: p.tanggal,
          waktu: p.waktu,
          lokasi: p.lokasi,
          deskripsi: p.deskripsi,
          foto_bukti: p.fotoBukti,
          status: p.status,
          pelapor: p.pelapor || "Admin Sekolah",
          sanksi: p.sanksi,
          tanggal_tindak_lanjut: p.tanggalTindakLanjut || null,
          catatan: p.catatan,
        };

        const { data, error } = await supabase.from("pelanggaran").insert(payload).select().single();

        if (error) {
          addToast("error", `Gagal menyimpan: ${error.message}`);
          const fallbackItem: Pelanggaran = { ...p, id: genId("p") };
          setPelanggaranList((prev) => [fallbackItem, ...prev]);
          return;
        }

        const newItem: Pelanggaran = {
          id: String(data.id),
          siswaId: String(data.siswa_id),
          jenisPelanggaran: data.jenis_pelanggaran,
          tingkat: data.tingkat as TingkatPelanggaran,
          poin: Number(data.poin),
          tanggal: data.tanggal,
          waktu: data.waktu ? data.waktu.slice(0, 5) : p.waktu,
          lokasi: data.lokasi || "",
          deskripsi: data.deskripsi || "",
          fotoBukti: data.foto_bukti || "",
          status: data.status as StatusPelanggaran,
          pelapor: data.pelapor || "Admin Sekolah",
          sanksi: data.sanksi || "",
          tanggalTindakLanjut: data.tanggal_tindak_lanjut || "",
          catatan: data.catatan || "",
        };

        setPelanggaranList((prev) => [newItem, ...prev]);
        addToast("success", "Data pelanggaran berhasil ditambahkan!");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        addToast("error", msg);
      }
    },
    [addToast]
  );

  const updatePelanggaran = useCallback(
    async (id: string, p: Omit<Pelanggaran, "id">) => {
      try {
        const payload = {
          siswa_id: p.siswaId,
          jenis_pelanggaran: p.jenisPelanggaran,
          tingkat: p.tingkat,
          poin: p.poin,
          tanggal: p.tanggal,
          waktu: p.waktu,
          lokasi: p.lokasi,
          deskripsi: p.deskripsi,
          foto_bukti: p.fotoBukti,
          status: p.status,
          pelapor: p.pelapor,
          sanksi: p.sanksi,
          tanggal_tindak_lanjut: p.tanggalTindakLanjut || null,
          catatan: p.catatan,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("pelanggaran").update(payload).eq("id", id);

        if (error) {
          addToast("error", `Gagal memperbarui: ${error.message}`);
        } else {
          addToast("success", "Data pelanggaran berhasil diperbarui!");
        }

        setPelanggaranList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...p } : item))
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        addToast("error", msg);
      }
    },
    [addToast]
  );

  const deletePelanggaran = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from("pelanggaran").delete().eq("id", id);
        if (error) {
          addToast("error", `Gagal menghapus: ${error.message}`);
        } else {
          addToast("success", "Data pelanggaran berhasil dihapus!");
        }
        setPelanggaranList((prev) => prev.filter((item) => item.id !== id));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        addToast("error", msg);
      }
    },
    [addToast]
  );

  const markPelanggaranSelesai = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("pelanggaran")
          .update({ status: "Selesai", updated_at: new Date().toISOString() })
          .eq("id", id);

        if (error) {
          addToast("error", `Gagal mengubah status: ${error.message}`);
        } else {
          addToast("success", "Status pelanggaran telah diubah menjadi Selesai!");
        }

        setPelanggaranList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "Selesai" } : item))
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        addToast("error", msg);
      }
    },
    [addToast]
  );

  const updateTindakanPelanggaran = useCallback(
    async (id: string, sanksi: string, tanggalTindakLanjut: string, catatan: string) => {
      try {
        const { error } = await supabase
          .from("pelanggaran")
          .update({
            sanksi,
            tanggal_tindak_lanjut: tanggalTindakLanjut || null,
            catatan,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) {
          addToast("error", `Gagal mengupdate tindakan: ${error.message}`);
        } else {
          addToast("success", "Tindakan pelanggaran berhasil diperbarui!");
        }

        setPelanggaranList((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, sanksi, tanggalTindakLanjut, catatan }
              : item
          )
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        addToast("error", msg);
      }
    },
    [addToast]
  );

  return (
    <AppContext.Provider
      value={{
        isLoggedIn, user, userProfile, showRegister, setShowRegister, login, logout,
        addToast, isLoadingData,
        kelasList, addKelas, updateKelas, deleteKelas,
        siswaList, addSiswa, updateSiswa, deleteSiswa,
        pelanggaranList, addPelanggaran, updatePelanggaran, deletePelanggaran,
        markPelanggaranSelesai, updateTindakanPelanggaran,
        activeMenu, setActiveMenu,
      }}
    >
      {children}
      <Toast toasts={toasts} onClose={removeToast} />
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}


