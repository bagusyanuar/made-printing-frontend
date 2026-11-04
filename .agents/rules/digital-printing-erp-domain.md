# Domain Knowledge: Digital Printing ERP (Made Printing)

Dokumentasi domain, istilah teknis, alur proses bisnis, dan aturan semantik untuk sistem ERP **Made Printing**.

---

## 1. Glosarium & Terminologi Domain

Istilah berikut digunakan di seluruh kode (entitas, DTO, use-case) dan antarmuka UI. Jangan menerjemahkan sembarangan atau mengganti dengan sinonim umum:

| Istilah                        | Arti dalam Sistem Made Printing                                                                                                                                    |
| :----------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SPK (Surat Perintah Kerja)** | Dokumen instruksi kerja cetak & finishing yang diteruskan dari kasir/CS ke operator mesin. Berisi nomor order, spesifikasi bahan, ukuran, finishing, dan deadline. |
| **Pre-press / RIP**            | Tahap pengecekan file desain customer (resolusi, format CMYK, bleed/margin) dan proses rastering (RIP - Raster Image Processor) sebelum dikirim ke mesin cetak.    |
| **Nesting / Imposition**       | Penataan susunan beberapa desain/item ke dalam satu area cetak (roll lebar atau lembar A3+) guna memaksimalkan efisiensi dan meminimalkan waste bahan.             |
| **Waste / Toleransi Bahan**    | Bahan terbuang (margin awal roll, sisa potongan, lead-in/lead-out margin mesin).                                                                                   |
| **Click Count**                | Meteran cetak mesin (terutama digital printing laser A3+), dihitung per klik lembar/sisi cetak untuk biaya operasional mesin.                                      |
| **Finishing**                  | Proses pasca cetak: laminasi, pond, cutting/potong, jilid, mata ayam, seaming, dll.                                                                                |
| **Mata Ayam (Grommet)**        | Ring besi berlubang pada banner untuk tali pengikat (contoh: 4 sudut, per meter, atau keliling).                                                                   |
| **Seaming / Lipat Lem**        | Pelipatan pinggiran banner dengan pemanas/lem agar tepi spanduk lebih kuat dan tidak mudah sobek.                                                                  |
| **Kiss Cut vs Die Cut**        | _Kiss Cut_: potong stiker hanya sampai lapisan vinyl (backing kertas tetap utuh lembaran). _Die Cut_: potong tembus sampai backing kertas mengikuti pola desain.   |
| **Min. Order m²**              | Aturan perhitungan minimum luas cetak (misal cetak banner ukuran 0.5m x 0.8m tetap dihitung minimal 1.0 m²).                                                       |
| **Reseller / Member Tier**     | Kategori customer dengan matrix harga khusus (Retail, Silver, Gold, Reseller/Percetakan Mitra).                                                                    |

---

## 2. Kategori Produk & Satuan Hitung

Sistem Digital Printing memiliki beragam jenis kalkulasi tergantung kategori produk:

### A. Large Format / Outdoor & Indoor Banner

- **Satuan:** Meter Persegi ($m^2$). Rumus: $\text{Panjang (m)} \times \text{Lebar (m)} \times \text{Qty}$.
- **Aturan Pembulatan:** Umumnya ada batas toleransi dan _minimum area_ (biasanya $1.0\ m^2$).
- **Bahan Populer:** Flexy 280g, Flexy 340g, Korcin 440g (Korea China), Albatros, Luster, Easy Banner, Duratrans/Backlite.
- **Finishing Spesifik:**
  - `mata_ayam` (4 pojok, per 1 meter, per keliling)
  - `seaming` (lipat keliling tanpa lubang)
  - `kolong` (selongsong atas-bawah atau kiri-kanan untuk bambu/pipa)
  - `potong_pas` (potong pas garis gambar tanpa lipat)
  - `lebih_bahan` (diberikan sisa bahan putih keliling)

### B. Digital Printing Lembaran (Sheetfed A3+)

- **Satuan:** Lembar A3+ / Pcs produk akhir (setelah potong).
- **Dimensi Bahan:** Standar plano A3+ ($32 \times 48\ \text{cm}$ atau $32.5 \times 48.5\ \text{cm}$), dengan area cetak efektif ($31 \times 47\ \text{cm}$).
- **Bahan Populer:** HVS 80g/100g, Art Paper 120g/150g, Art Carton 210g/260g/310g, Ivory, Matte Paper, Jasmine, Linen, Sticker Chromo, Sticker Vinyl A3+.
- **Sisi Cetak:** 1 Sisi (4/0) vs 2 Sisi Bolak-balik (4/4).
- **Finishing Spesifik:** Laminasi Dingin/Panas (Doff/Glossy), Potong Kotak/Sisir, Pond/Creasing, Spot UV, Poly Emas/Silver.

### C. Sablon Digital / DTF (Direct-to-Film) & Sublimasi

- **Satuan:** Meter Lari (Lebar roll standar biasanya $58\ \text{cm}$ atau $60\ \text{cm}$, dihitung panjang meteran) atau per pcs (jika paket kaos jadi).
- **Proses:** Print film -> Powdering -> Shaking/Curing -> Press pemanas.

### D. Merchandise & UV Flatbed

- **Satuan:** Pcs / Item.
- **Produk:** Gantungan Kunci Akrilik, Plakat, Tumbler Grafir/UV, Flashdisk, Pin, ID Card PVC.

---

## 3. Alur Siklus Hidup Order & Status Semantik

Setiap pesanan di sistem Made Printing bergerak melalui status berikut:

```
[Draft] -> [Confirmed / DP] -> [Pre-press / File Ready] -> [In Queue]
            -> [Printing] -> [Finishing] -> [QC Passed]
            -> [Ready for Pickup / Delivery] -> [Completed]
```

### Pemetaan Status & Warna Semantik UI:

| Status Code        | Label UI                   | Warna Token Semantik                                                           | Keterangan                                            |
| :----------------- | :------------------------- | :----------------------------------------------------------------------------- | :---------------------------------------------------- |
| `draft`            | Draft                      | `text-ink-muted bg-surface-muted`                                              | Pesanan belum difinalisasi / kalkulasi sementara      |
| `confirmed`        | Dikonfirmasi / Menunggu DP | `text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-950/40`                  | Customer setuju, menunggu bukti bayar/DP              |
| `prepress`         | Cek File / RIP             | `text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/40`      | File desain sedang diverifikasi teknis atau disiapkan |
| `in_queue`         | Antrian Cetak              | `text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40`          | File siap, menunggu giliran mesin cetak               |
| `printing`         | Sedang Cetak               | `text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-950/40`          | Mesin sedang memproses cetak                          |
| `finishing`        | Proses Finishing           | `text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/40`      | Cetak selesai, sedang laminasi / cutting / jilid      |
| `ready_for_pickup` | Siap Ambil / Kirim         | `text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40`  | Produk selesai QC, siap diserahkan ke pelanggan       |
| `completed`        | Selesai                    | `text-emerald-900 bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-900/40` | Sudah diambil/diterima & lunas                        |
| `cancelled`        | Dibatalkan                 | `text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40`              | Order dibatalkan                                      |

### Prioritas Order:

- **Urgent / Express:** Badge `text-rose-700 bg-rose-50 border-rose-200` dengan ikon peringatan (`heroicons:bolt` / `lucide:zap`). Harus diutamakan dalam visual antrian mesin.
- **Normal / Reguler:** Badge neutral `text-ink-muted bg-surface-muted`.

---

## 4. Keuangan, Kasir, & Presisi Angka

1. **Format Mata Uang:**
   - Semua nilai finansial menggunakan Rupiah (`IDR`).
   - Format tampilan: `Rp 150.000` (menggunakan helper pemformatan terpusat, tanpa desimal sen).
   - Di batas API / DTO: Simpan sebagai integer untuk Rupiah (contoh `150000`) atau string desimal presisi tinggi jika melibatkan rate kalkulasi bahan per milimeter/m². Dilarang melakukan komputasi uang menggunakan float mentah `0.1 + 0.2`.
2. **Status Pembayaran:**
   - `unpaid` (Belum Bayar)
   - `partial` (DP / Uang Muka Masuk, ada sisa pelunasan)
   - `paid` (Lunas)
   - `refunded` (Dikembalikan)
3. **Metode Pembayaran:** Tunai (Cash), QRIS, Transfer Bank BCA/Mandiri, Saldo Deposit Reseller / Kasbon (Piutang Usaha).

---

## 5. Manajemen Mesin & Stok Bahan

1. **Mesin (Machine Asset):**
   - Identifikasi mesin: Tipe (Outdoor, Indoor Eco, DTF, Konica A3+, Plotter Cutting), Kapasitas m²/jam atau lembar/menit, Lebar Maksimum Cetak (contoh: 3.2m untuk banner, 1.6m untuk indoor, 33cm untuk A3+).
   - Status Mesin: `idle` (Siap jalan), `running` (Sedang mencetak), `maintenance` (Perawatan rutin/pembersihan head), `error` (Trouble/Macet).
2. **Tracking Bahan Baku:**
   - Bahan Roll: Dicatat panjang total (meter) dan sisa meter lari. Sistem harus menghitung estimasi penggunaan bahan dari SPK aktif.
   - Bahan Lembaran: Dicatat dalam satuan rim atau lembar plano.
   - Tinta: Level persentase estimasi atau stok botol/liter per warna (Cyan, Magenta, Yellow, Black, Light Cyan, Light Magenta, White).
