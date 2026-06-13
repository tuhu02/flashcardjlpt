# KanjiQuiz — Product Requirements Document

| | |
|---|---|
| **Versi** | 1.1.0 |
| **Tanggal** | Juni 2026 |
| **Status** | Draft |
| **Tech Stack** | Next.js · Prisma · PostgreSQL · Vercel |

---

## Daftar Isi

1. [Ringkasan Produk](#1-ringkasan-produk)
2. [Fitur & Persyaratan Fungsional](#2-fitur--persyaratan-fungsional)
3. [Arsitektur & Tech Stack](#3-arsitektur--tech-stack)
4. [UX & Desain](#4-ux--desain)
5. [Roadmap & Milestone](#5-roadmap--milestone)
6. [Persyaratan Non-Fungsional](#6-persyaratan-non-fungsional)
7. [Risiko & Mitigasi](#7-risiko--mitigasi)

---

## 1. Ringkasan Produk

### 1.1 Latar Belakang

Belajar kanji untuk JLPT membutuhkan latihan berulang dengan feedback langsung. Flashcard statis tidak memberi pengalaman yang adaptif — pengguna tidak tahu kanji mana yang perlu diprioritaskan dan seberapa jauh progresnya.

KanjiQuiz adalah platform web berbasis kuis interaktif yang memungkinkan pengguna mengelola koleksi kanji sendiri, lalu berlatih melalui berbagai mode kuis. Sistem melacak performa per kanji sehingga pengguna tahu persis mana yang harus diulang.

### 1.2 Tujuan Produk

- Memudahkan pengguna input dan kelola data kanji (kanji, cara baca, arti) secara mandiri
- Menyediakan kuis interaktif dengan tiga mode latihan
- Melacak progres dan menampilkan statistik belajar
- Mendukung belajar mandiri untuk semua level JLPT (N5 hingga N1)

### 1.3 Target Pengguna

| Segmen | Deskripsi | Kebutuhan Utama |
|--------|-----------|-----------------|
| Pelajar JLPT N5/N4 | Baru mulai belajar kanji, butuh fondasi kuat | Input mudah, kuis dasar, hint arti |
| Pelajar JLPT N3–N1 | Sudah punya basis, fokus hafalan maju | Mode kuis beragam, statistik detail |
| Otodidak Umum | Belajar Jepang tanpa target sertifikasi | Kelola koleksi bebas, belajar santai |

---

## 2. Fitur & Persyaratan Fungsional

### 2.1 Manajemen Kanji (CRUD)

Pengguna dapat mengelola seluruh data kanji secara mandiri melalui antarmuka yang intuitif.

#### Input Kanji

- Form input dengan field: Kanji (karakter), Cara Baca (on'yomi / kun'yomi), Arti (Indonesia/Inggris), Level JLPT, Kelompok/Kategori (opsional), Contoh Kalimat (opsional)
- Validasi: kanji tidak boleh duplikat dalam satu koleksi
- Support input massal via file CSV/JSON

#### Edit & Hapus

- Edit semua field kanji yang sudah tersimpan
- Hapus kanji dengan konfirmasi
- Hapus massal dengan multi-select

#### Organisasi Koleksi

- Buat beberapa koleksi (contoh: N5 Angka, N4 Kata Kerja, dsb.)
- Pindahkan kanji antar koleksi
- Filter dan cari kanji berdasarkan kanji, arti, atau cara baca

---

### 2.2 Mode Kuis

Tiga mode kuis utama yang dapat dipilih sebelum sesi latihan dimulai.

| Mode | Deskripsi | Contoh Soal |
|------|-----------|-------------|
| Kanji → Arti | Lihat kanji, pilih arti yang benar | 見 → A) Lihat &nbsp; B) Dengar &nbsp; C) Makan &nbsp; D) Minum |
| Kanji → Cara Baca | Lihat kanji, pilih cara baca yang benar | 日 → A) にち &nbsp; B) つき &nbsp; C) ほし &nbsp; D) そら |
| Arti → Kanji | Lihat arti, pilih kanji yang benar | "Matahari" → A) 月 &nbsp; B) 火 &nbsp; C) 日 &nbsp; D) 水 |

#### Pengaturan Kuis

- Pilih koleksi atau kelompok kanji yang ingin dilatih
- Atur jumlah soal per sesi (10 / 20 / semua)
- Pilih mode kuis (satu atau kombinasi)
- Opsi shuffle soal

#### Selama Kuis

- Tampilkan feedback langsung (benar/salah) setelah menjawab
- Tampilkan jawaban yang benar jika salah
- Progress bar dan counter soal
- Tombol lewati (skip) dengan penalti minor pada statistik

#### Hasil Kuis

- Skor akhir (persentase benar)
- Daftar kanji yang salah beserta jawaban benar
- Tombol ulangi hanya kanji yang salah

---

### 2.3 Sistem Progres & Statistik

#### Per Kanji

- Total benar vs salah
- Tingkat akurasi (%)
- Terakhir dilatih
- Status hafalan: `Baru` / `Sedang Dipelajari` / `Hafal` / `Perlu Diulang`

#### Per Sesi

- Rekap skor dan durasi belajar
- Perbandingan dengan sesi sebelumnya

#### Dashboard

- Total kanji terdaftar vs sudah hafal
- Streak harian (hari berturut-turut latihan)
- Grafik progres mingguan
- Rekomendasi kanji yang perlu diulang

---

### 2.4 Import & Export

- Import kanji dari CSV (format: `kanji, cara_baca, arti, level, kelompok`)
- Export koleksi ke CSV/JSON untuk backup
- Export laporan progres ke PDF

---

## 3. Arsitektur & Tech Stack

### 3.1 Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Frontend | Next.js + TypeScript | Full-stack dalam satu repo, SSR/SSG, ekosistem luas |
| Styling | Tailwind CSS | Utility-first, cepat, konsisten |
| ORM | Prisma ORM | Type-safe query, auto-migration, support PostgreSQL |
| Backend | Next.js API Routes | Built-in, tidak perlu server terpisah |
| Database | PostgreSQL | Relasional, native support di Vercel Postgres (Neon) |
| Auth | NextAuth.js | OAuth & credentials, terintegrasi native dengan Next.js |
| Deployment | Vercel | Zero-config deploy, native untuk Next.js |

### 3.2 Struktur Database (Prisma Schema)

```prisma
model User {
  id            String       @id @default(cuid())
  name          String?
  email         String       @unique
  password      String?
  createdAt     DateTime     @default(now())
  collections   Collection[]
  quizSessions  QuizSession[]
  kanjiStats    KanjiStat[]
}

model Collection {
  id          String      @id @default(cuid())
  userId      String
  name        String
  description String?
  jlptLevel   String?
  createdAt   DateTime    @default(now())
  user        User        @relation(fields: [userId], references: [id])
  kanjis      Kanji[]
  quizSessions QuizSession[]
}

model Kanji {
  id           String      @id @default(cuid())
  collectionId String
  kanji        String
  reading      String
  meaning      String
  example      String?
  createdAt    DateTime    @default(now())
  collection   Collection  @relation(fields: [collectionId], references: [id])
  quizResults  QuizResult[]
  kanjiStats   KanjiStat[]
}

model QuizSession {
  id           String       @id @default(cuid())
  userId       String
  collectionId String
  mode         String
  total        Int
  correct      Int
  duration     Int
  createdAt    DateTime     @default(now())
  user         User         @relation(fields: [userId], references: [id])
  collection   Collection   @relation(fields: [collectionId], references: [id])
  results      QuizResult[]
}

model QuizResult {
  id        String      @id @default(cuid())
  sessionId String
  kanjiId   String
  isCorrect Boolean
  timeTaken Int
  session   QuizSession @relation(fields: [sessionId], references: [id])
  kanji     Kanji       @relation(fields: [kanjiId], references: [id])
}

model KanjiStat {
  id              String   @id @default(cuid())
  userId          String
  kanjiId         String
  totalAttempts   Int      @default(0)
  correctAttempts Int      @default(0)
  lastPracticed   DateTime?
  status          String   @default("Baru")
  user            User     @relation(fields: [userId], references: [id])
  kanji           Kanji    @relation(fields: [kanjiId], references: [id])
}
```

### 3.3 Struktur Halaman (Next.js App Router)

| Route | Halaman | Deskripsi |
|-------|---------|-----------|
| `/` | Landing Page | Intro produk, CTA daftar/login |
| `/dashboard` | Dashboard | Ringkasan progres, streak, rekomendasi |
| `/collections` | Daftar Koleksi | CRUD koleksi kanji milik user |
| `/collections/[id]` | Detail Koleksi | Daftar kanji, filter, edit, hapus |
| `/quiz/setup` | Setup Kuis | Pilih koleksi, mode, dan jumlah soal |
| `/quiz/session` | Sesi Kuis | Antarmuka kuis interaktif |
| `/quiz/result` | Hasil Kuis | Skor, recap kanji salah, aksi lanjut |
| `/stats` | Statistik | Grafik progres, kanji lemah, riwayat sesi |
| `/settings` | Pengaturan | Profil user, preferensi, import/export |

### 3.4 Struktur Folder Project

```
kanji-quiz/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── collections/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── quiz/
│   │   ├── setup/page.tsx
│   │   ├── session/page.tsx
│   │   └── result/page.tsx
│   ├── stats/page.tsx
│   ├── settings/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── collections/route.ts
│       ├── kanjis/route.ts
│       ├── quiz/route.ts
│       └── stats/route.ts
├── components/
│   ├── ui/
│   ├── quiz/
│   └── dashboard/
├── lib/
│   ├── prisma.ts
│   └── auth.ts
├── prisma/
│   └── schema.prisma
└── .env
```

---

## 4. UX & Desain

### 4.1 Prinsip Desain

- **Minimal** — tidak ada elemen visual yang tidak perlu; fokus ke konten kanji
- **Responsif** — bisa dipakai di desktop dan mobile dengan nyaman
- **Feedback cepat** — setiap aksi pengguna mendapat respons visual kurang dari 200ms
- **Aksesibel** — kontras warna memadai, font cukup besar untuk karakter kanji

### 4.2 Komponen UI Utama

#### Kartu Kuis

- Kanji ditampilkan besar (min. 72px) agar mudah dibaca
- Empat pilihan jawaban dalam grid 2×2
- Warna hijau untuk benar, merah untuk salah
- Animasi ringan saat transisi soal

#### Dashboard Progres

- Kartu metrik: total kanji, sudah hafal, perlu diulang, streak
- Bar chart atau ring chart untuk visualisasi progres koleksi
- Daftar rekomendasi kanji yang perlu diulang hari ini

#### Form Input Kanji

- Auto-suggest kelompok/kategori yang sudah ada
- Preview karakter kanji real-time saat diketik
- Validasi inline dengan pesan error yang jelas

### 4.3 Alur Pengguna Utama

Alur belajar harian yang diharapkan:

1. Login ke aplikasi
2. Lihat dashboard — kanji apa yang perlu diulang hari ini?
3. Buka koleksi — tambah kanji baru jika ada
4. Mulai kuis — pilih koleksi, mode, jumlah soal
5. Kerjakan kuis — jawab satu per satu dengan feedback langsung
6. Lihat hasil — review kanji yang salah
7. Ulangi hanya yang salah *(opsional)*

---

## 5. Roadmap & Milestone

### 5.1 Fase Pengembangan

| Fase | Estimasi | Deliverable | Status |
|------|----------|-------------|--------|
| Fase 1 | 2 minggu | Setup Next.js + Prisma + PostgreSQL, Auth (NextAuth.js), CRUD koleksi & kanji | 🔲 Rencana |
| Fase 2 | 2 minggu | Kuis interaktif 3 mode, hasil kuis, recap kanji salah | 🔲 Rencana |
| Fase 3 | 1 minggu | Sistem progres, statistik per kanji, dashboard | 🔲 Rencana |
| Fase 4 | 1 minggu | Import/export CSV, responsif mobile, polish UI, deploy ke Vercel | 🔲 Rencana |
| Fase 5 | Ongoing | Fitur lanjutan: SRS, audio pengucapan, mode streak | 📋 Backlog |

### 5.2 Fitur Prioritas (MVP)

Fitur minimum yang harus ada sebelum launch pertama:

- [ ] Registrasi & login pengguna
- [ ] CRUD koleksi dan kanji
- [ ] Kuis mode Kanji → Arti
- [ ] Hasil kuis dengan rekap kanji yang salah
- [ ] Responsif di mobile
- [ ] Deploy ke Vercel

### 5.3 Fitur Backlog (Post-MVP)

- [ ] Mode kuis tambahan: menulis kanji (stroke order)
- [ ] Spaced Repetition System (SRS) otomatis
- [ ] Audio pengucapan kanji (Text-to-Speech)
- [ ] Leaderboard / gamifikasi antar pengguna
- [ ] Integrasi dengan kamus Jepang (JISHO API)
- [ ] Mode offline (PWA)
- [ ] Notifikasi pengingat belajar harian

---

## 6. Persyaratan Non-Fungsional

### 6.1 Performa

- Halaman kuis ter-load kurang dari 1.5 detik pada koneksi 4G
- Feedback jawaban muncul kurang dari 200ms setelah klik
- Mendukung minimal 100 pengguna aktif bersamaan pada MVP

### 6.2 Keamanan

- Password di-hash dengan bcrypt
- API route dilindungi dengan session/token via NextAuth.js
- Validasi input di sisi server untuk mencegah SQL injection dan XSS
- Data koleksi bersifat privat per pengguna (tidak bisa diakses pengguna lain)

### 6.3 Skalabilitas

- Struktur database dinormalisasi agar bisa menampung ribuan kanji per user
- Query dioptimasi dengan indeks pada kolom yang sering di-filter
- Next.js API Routes dapat dikonsumsi oleh aplikasi mobile di masa depan

---

## 7. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Font kanji tidak render dengan benar di semua device | 🔴 Tinggi | Gunakan Google Fonts `Noto Sans JP` sebagai fallback wajib |
| Kompleksitas fitur statistik memakan waktu | 🟡 Sedang | Tunda ke Fase 3, MVP fokus di kuis dulu |
| User enggan input kanji manual satu per satu | 🟡 Sedang | Sediakan template CSV siap pakai per level JLPT |
| Performa lambat saat koleksi kanji sangat banyak | 🟢 Rendah | Implementasi pagination dan lazy loading |
| Vercel Postgres free tier terbatas | 🟡 Sedang | Monitor usage, upgrade ke paid plan jika perlu |

---

*KanjiQuiz PRD v1.1 — Dibuat Juni 2026*