# FasilHero 🦸‍♂️ - Google Cloud Arcade Facilitator Dashboard 2026

**FasilHero** adalah platform manajemen dan analitik progres peserta yang dirancang khusus untuk para **Facilitator Google Cloud Arcade**. Aplikasi ini memudahkan fasilitator dalam memantau pertumbuhan Skill Badges, Arcade Games, pencapaian milestone, status aktivasi/redemption akses kode, serta mempermudah komunikasi dengan peserta via WhatsApp secara terstruktur.

---

## 📌 Tentang Program Google Cloud Arcade Facilitator

**Google Cloud Arcade Facilitator Program** adalah inisiatif global dari Google Cloud untuk membekali para pelajar, profesional, dan antusias teknologi dengan keterampilan hands-on cloud computing melalui platform Google Cloud Skills Boost.

Dalam program ini:
- **Peserta** menyelesaikan berbagai kuis, lab, dan tantangan untuk mendapatkan *Skill Badges* dan menyelesaikan *Arcade Games*.
- **Fasilitator** bertindak sebagai pembimbing komunitas yang membantu peserta melewati kendala teknis, memberikan dorongan motivasi, serta memantau perkembangan peserta menuju milestone poin dan swag berhadiah resmi dari Google Cloud.

---

## 🛠️ Tech Stack & Arsitektur

FasilHero dibangun menggunakan arsitektur modern full client-side yang berkinerja tinggi, responsif, serta menjamin privasi data karena seluruh pemrosesan data dilakukan secara lokal di perangkat fasilitator.

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Dev Server** | [Vite](https://vitejs.dev/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/) |
| **Local Database & Persistence** | [Dexie.js](https://dexie.org/) (Wrapper berbasis IndexedDB dengan skema compound key `[project_id+email]`) |
| **Excel / CSV Parser** | [SheetJS (XLSX)](https://sheetjs.com/) untuk pengolahan file laporan Google Cloud Arcade |
| **Deployment / Environment** | Node.js Containerized Cloud Run Engine |

---

## ✨ Fitur Utama

1. **Multi-Project Management (Batch Facilitator)**
   - Mendukung pengelolaan beberapa batch/kelompok peserta sekaligus dalam project terpisah.
   - Isolasi data penuh antar project dengan dukungan backup/restore format JSON.

2. **Snapshot Tracking & Auto-Comparison (Perbandingan Laporan Excel)**
   - Upload file Laporan Excel (`.xlsx` / `.csv`) berkala dari portal Google Arcade.
   - Deteksi otomatis peserta baru (*First Seen Date*) vs peserta lama.
   - Perhitungan delta pertumbuhan Skill Badges dan Arcade Games antar snapshot laporan.

3. **Indikator Milestone Facilitator**
   - Perhitungan otomatis Poin Facilitator berdasarkan aturan resmi Google Arcade 2026.
   - Pelacakan tingkat Tier Milestone (misal: Starter, Bronze, Silver, Gold, Platinum).
   - Visualisasi progress bar menuju tier berikutnya.

4. **Pencarian, Filter & Manajemen Peserta**
   - Filter cepat berdasarkan status *Redeem Access Code*, *Sudah Diundang ke WA*, maupun *Peserta Baru*.
   - Modal detail peserta untuk menambahkan catatan khusus (*Facilitator Notes*).

5. **Integrasi Komunikasi & WhatsApp Broadcast Generator**
   - Penanda status udangan WhatsApp (*WA Invited* toggle).
   - Generator teks sapaan WhatsApp otomatis yang dipersonalisasi dengan data peserta.

6. **Responsif & Mobile Friendly**
   - Navigasi tab responsif dengan *horizontal scroll* yang lancar di layar HP maupun desktop.

---

## 🚀 Cara Menggunakan Aplikasi

1. **Membuat / Memilih Project**
   - Di halaman utama, klik **"Buat Project Baru"** dan masukkan nama project (misal: `Batch 1 - Kampus A`).
2. **Mengimpor Laporan Excel (.xlsx / .csv)**
   - Pilih project, lalu masuk ke tab **Overview** atau **Data Peserta**.
   - Klik **"Upload Snapshot Excel"** dan pilih file laporan dari Google Cloud Arcade.
3. **Menganalisis Progres Peserta**
   - Buka tab **Data Peserta** untuk melihat daftar, pencapaian badge, status redeem, serta pertumbuhan poin.
   - Buka tab **Milestone Facilitator** untuk memantau pencapaian tier Anda.
4. **Mengekspor & Backup Data**
   - Gunakan fitur **Export Backup JSON** pada Pengaturan Project untuk menyimpan salinan cadangan data Anda.

---

## 🔗 Link Pendaftaran Peserta & Grup WhatsApp

Untuk membagikan informasi pendaftaran peserta di bawah bimbingan Anda:

- **Link Pendaftaran Peserta**: [https://s.id/GoogleArcadeFacilitator](https://s.id/GoogleArcadeFacilitator)
- **Link Grup WhatsApp Peserta**: [https://s.id/GoogleArcadeWAGroup](https://s.id/GoogleArcadeWAGroup)

*(Link ini juga tersedia di dalam menu "Bantuan" di dalam aplikasi).*

---

## 📧 Dukungan & Contact

Jika memerlukan bantuan terkait program Google Cloud Arcade Facilitator:
- **Dicoding Arcade Support**: `arcade@dicoding.com`
- **Google Arcade Official Support**: `arcade-facilitator@google.com`

---
*Dibuat untuk mendukung para Facilitator Google Cloud Arcade 2026.* 🚀
