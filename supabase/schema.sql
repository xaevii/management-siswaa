-- ============================================================
-- SCHEMA DATABASE MANAGEMENT SISWA
-- ============================================================

-- 1. PERBARUI TABEL KELAS
DO $$ 
BEGIN 
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kelas' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.kelas RENAME COLUMN name TO nama;
  END IF;
END $$;

ALTER TABLE public.kelas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. TABEL SISWA
CREATE TABLE IF NOT EXISTS public.siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  nis VARCHAR(50) UNIQUE NOT NULL,
  kelas_id BIGINT REFERENCES public.kelas(id) ON DELETE SET NULL,
  jenis_kelamin VARCHAR(1) CHECK (jenis_kelamin IN ('L', 'P')) NOT NULL,
  tanggal_lahir DATE,
  alamat TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL PELANGGARAN
CREATE TABLE IF NOT EXISTS public.pelanggaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID REFERENCES public.siswa(id) ON DELETE CASCADE NOT NULL,
  jenis_pelanggaran TEXT NOT NULL,
  tingkat VARCHAR(10) CHECK (tingkat IN ('Ringan', 'Sedang', 'Berat')) NOT NULL,
  poin INTEGER NOT NULL DEFAULT 0,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  waktu TIME NOT NULL DEFAULT CURRENT_TIME,
  lokasi TEXT,
  deskripsi TEXT,
  foto_bukti TEXT,
  status VARCHAR(10) CHECK (status IN ('Aktif', 'Selesai')) DEFAULT 'Aktif' NOT NULL,
  pelapor TEXT,
  sanksi TEXT,
  tanggal_tindak_lanjut DATE,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL USERS (Profil Pengguna)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pelanggaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTION UNTUK CEK ROLE ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.role() = 'authenticated' OR
    auth.role() = 'anon' OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES (ADMIN FULL CRUD)
DROP POLICY IF EXISTS "Allow public access on kelas" ON public.kelas;
DROP POLICY IF EXISTS "Allow public access on siswa" ON public.siswa;
DROP POLICY IF EXISTS "Allow public access on pelanggaran" ON public.pelanggaran;
DROP POLICY IF EXISTS "Allow public access on users" ON public.users;

DROP POLICY IF EXISTS "Admin full CRUD on kelas" ON public.kelas;
DROP POLICY IF EXISTS "Admin full CRUD on siswa" ON public.siswa;
DROP POLICY IF EXISTS "Admin full CRUD on pelanggaran" ON public.pelanggaran;
DROP POLICY IF EXISTS "Admin full CRUD on users" ON public.users;

CREATE POLICY "Admin full CRUD on kelas" ON public.kelas FOR ALL TO authenticated, anon USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full CRUD on siswa" ON public.siswa FOR ALL TO authenticated, anon USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full CRUD on pelanggaran" ON public.pelanggaran FOR ALL TO authenticated, anon USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full CRUD on users" ON public.users FOR ALL TO authenticated, anon USING (public.is_admin()) WITH CHECK (public.is_admin());

