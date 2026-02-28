# Sistem Monitoring Produksi PPIC Berbasis Web

Sistem web berbasis React (Vite) dan Supabase untuk memonitor produksi (QC SVC, Aksesoris, Finishing).

## Setup Lokal

1. Clone repositori ini
2. Jalankan `npm install`
3. Buat file `.env` (atau rename dari `.env.example`) dan masukkan credentials Supabase yang Anda miliki:
   ```env
   VITE_SUPABASE_URL=https://<PROJECT-ID>.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbG...
   ```
4. Jalankan `npm run dev`

## Panduan Supabase

Anda harus menjalankan script SQL yang ada di `/supabase/schema.sql` dan `/supabase/rls.sql` di SQL Editor pada Dashboard Supabase Anda agar stuktur tabel beserta hak akses (Row Level Security) terbentuk.

Buat juga bucket Storage di Supabase dengan nama **`uploads`** dan set sebagai **Public**.

## Panduan Deploy ke Vercel

1. Buat akun di [Vercel](https://vercel.com/) dan login.
2. Sinkronisasikan akun GitHub Anda dengan Vercel.
3. Klik tombol **"Add New Project"** di Dashboard Vercel dan pilih repository GitHub project ini (`tugasakhir`).
4. Di bagian **Build and Output Settings**, pastikan:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Buka bagian **Environment Variables**, dan tambahkan:
   - Key: `VITE_SUPABASE_URL` | Value: `(url Supabase Anda)`
   - Key: `VITE_SUPABASE_ANON_KEY` | Value: `(anon key Supabase Anda)`
6. Klik **Deploy** dan tunggu proses selesai. 
7. Aplikasi sudah bisa diakses lewat link `.vercel.app` yang diberikan oleh Vercel.

## Fitur Tersedia
- Login Multi Role (Superadmin, PPIC, QC, Viewer)
- Create Order Multi-Item (PPIC)
- Update Status Item via Form QC
- History QC Per Item
- Dashboard Statistik
- Compress Gambar Client-side (sebelum diupload ke Supabase Storage)

Semoga sukses untuk Tugas Akhirnya!
