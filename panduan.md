# Panduan Mengisi "The Tempering"

Situs ini adalah file HTML polos — tidak ada database, tidak ada CMS, tidak ada proses build. Menambah konten baru artinya: **copy file template → isi bagian yang ditandai → sambungkan link ke halaman induknya.** Semua bisa dilakukan lewat editor teks biasa (VS Code, Notepad, atau editor file bawaan Netlify).

Struktur situsnya berjenjang, tiga tingkat:

```
index.html               (daftar tahun 2026 → daftar bulan)
 └─ august-2026.html      (satu bulan → daftar minggu)
     └─ week-32.html       (satu minggu → tesis Minggu + daftar hari + review Sabtu)
         └─ day-aug-11.html (satu hari → satu trade, rinci)
```

Ada 3 file template di root project yang sudah disiapkan, tinggal di-copy:

- `template-hari.html` — untuk satu catatan trade harian
- `template-minggu.html` — untuk satu minggu (tesis + review)
- `template-bulan.html` — untuk satu bulan baru

Di setiap template, semua bagian yang perlu kamu isi ditandai dengan `[GANTI: ...]`. Cukup cari tulisan itu (Ctrl+F / Cmd+F cari `[GANTI`) dan ganti satu per satu — jangan ubah tag HTML di sekitarnya.

---

## 1. Menambah Hari Baru (satu catatan trade)

1. Copy `template-hari.html`, ganti nama filenya, contoh: `day-agu-18.html`. Pakai huruf kecil semua, tanpa spasi.
2. Buka file barunya, isi semua `[GANTI: ...]` — judul trade, instrumen, arah, bacaan pra-pasar, breakdown chart, hasil, dst.
3. Perbaiki link breadcrumb di bagian atas (`<nav class="site-nav">`) agar mengarah ke file bulan dan minggu yang benar.
4. Buka file **minggu** tempat hari ini berada (misal `week-32.html`). Cari baris hari itu yang masih begini:
   ```html
   <div class="rail-row locked">
     <div class="rail-day">SEN<b>18</b></div>
     <div class="rail-body"><h4>Tidak ada sesi tercatat</h4></div>
     <div class="rail-tag"></div>
     <div class="rail-tag"></div>
   </div>
   ```
   Ganti jadi (contoh, sesuaikan isinya):
   ```html
   <a class="rail-row linked" href="day-agu-18.html">
     <div class="rail-day">SEN<b>18</b></div>
     <div class="rail-body">
       <h4>Judul singkat trade</h4>
       <p>Satu kalimat ringkasan</p>
     </div>
     <div class="seal loss"><span>B</span></div>
     <div class="rail-tag" style="color:var(--rust);">−1R</div>
   </a>
   ```
   (pakai class `seal win` kalau profit, dan warna `var(--water)` untuk tag hasil positif)

Selesai — halaman hari otomatis muncul sebagai link dari halaman minggunya.

---

## 2. Menambah Minggu Baru

1. Copy `template-minggu.html`, ganti nama file, contoh: `week-33.html`.
2. Isi semua `[GANTI: ...]` — tesis pra-pasar hari Minggu, lalu di akhir minggu isi bagian "Sabtu — Rincian Lengkap" (tesis vs realita, psikologi, pelajaran chart, hasil).
3. Untuk hari-hari yang ada catatannya, ikuti langkah di bagian 1 di atas (ubah baris "locked" jadi link ke halaman hari).
4. Buka file **bulan** yang sesuai (misal `august-2026.html`). Cari baris minggu itu yang masih "locked" dan ubah jadi link, sama seperti contoh di langkah 1 tapi untuk baris minggu:
   ```html
   <a class="rail-row linked" href="week-33.html">
     <div class="rail-day">AGU<b>17–23</b></div>
     <div class="rail-body">
       <h4>Judul singkat minggu ini</h4>
       <p>Satu kalimat ringkasan</p>
     </div>
     <div class="rail-tag">2 TRADE</div>
     <div class="rail-tag" style="color:var(--water);">+1R MINGGU</div>
   </a>
   ```
5. Update juga angka "Sesi Tercatat / Net R / dst." di bagian atas halaman bulan (`stat-strip`), kalau mau selalu akurat.

---

## 3. Menambah Bulan Baru

1. Copy `template-bulan.html`, ganti nama file, contoh: `september-2026.html`.
2. Isi semua `[GANTI: ...]`.
3. Buka `index.html`. Cari blok bulan yang masih terkunci:
   ```html
   <div class="tile locked">
     <div class="tile-eyebrow"><span>BULAN 09</span><span class="lock-icon">🔒</span></div>
     <h3>September</h3>
     <p>Belum ditempa.</p>
   </div>
   ```
   Ganti jadi:
   ```html
   <a class="tile" href="september-2026.html">
     <div class="tile-eyebrow"><span>BULAN 09</span><span class="tile-arrow">→</span></div>
     <h3>September</h3>
     <p>Ringkasan singkat bulan ini.</p>
     <div class="tile-stats"><span><b>0</b> minggu tercatat</span><span><b>NQ / ES</b></span></div>
   </a>
   ```
4. Kalau mau, tambahkan satu tile baru lagi di bawahnya untuk bulan berikutnya (Oktober), dengan status `tile locked` seperti contoh di atas, supaya progres bulan-bulan ke depan tetap terlihat di halaman utama.

---

## Hal-hal kecil yang perlu diingat

- **Warna hasil**: `var(--rust)` untuk kerugian/merah, `var(--water)` untuk profit/biru-hijau, `var(--gold)` untuk penekanan netral.
- **Grade & seal**: class `seal win` / `seal loss` menentukan warna lingkaran grade di halaman hari.
- **Jangan hapus entri yang rugi.** Semangat situs ini ("catatan yang jujur") justru dari trade yang kalah tetap tampil, tidak dihapus.
- **Style & animasi** (warna, font, efek scroll) ada di `style.css` dan `script.js` — tidak perlu disentuh untuk menambah konten. Kalau suatu saat ingin ubah tampilan (misalnya warna brand), itu ada di bagian `:root { --... }` paling atas `style.css`.
- **Tidak ada proses build.** Begitu file di-simpan dan situs di-deploy ulang di Netlify, perubahan langsung tampil — tidak perlu menjalankan perintah apa pun.

---

## Sebelum situs ini dibagikan ke publik

- Semua angka di `stat-strip` pada halaman `august-2026.html` dan `july-2026.html` masih **data contoh** (ditandai catatan ✏️ di bawah tabelnya) — ganti dengan angka asli.
- File `files.zip` di root project adalah salinan upload awal yang isinya sama dengan file yang sudah ada di situs — aman dihapus kalau sudah tidak diperlukan, supaya tidak jadi file yang bisa didownload pengunjung.
