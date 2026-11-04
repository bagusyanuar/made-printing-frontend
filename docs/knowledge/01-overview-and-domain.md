# 01. Overview & Domain Model: Made Printing ERP

## 1. Latar Belakang & Profil Bisnis

**Made Printing** adalah unit usaha percetakan digital (_digital printing & creative production_) yang melayani kebutuhan cetak personal, retail, UMKM, korporat, hingga mitra reseller/percetakan rekanan.

### Mengapa Digital Printing Berbeda dari Percetakan Konvensional (Offset)?

| Karakteristik           | Digital Printing (Made Printing)                                                         | Konvensional / Offset                                                                     |
| :---------------------- | :--------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| **Kuantitas Minimum**   | Bisa satuan (on-demand), mulai dari 1 pcs atau 1 meter persegi.                          | Memerlukan kuantitas besar (misal min. 500–1.000 lembar) untuk menutup biaya pelat cetak. |
| **Kecepatan Produksi**  | Sangat cepat: _Same Day Service_ (hitungan jam) atau 1 hari kerja.                       | Butuh waktu persiapan (pembuatan pelat CTP, wash up mesin, drying time).                  |
| **Bentuk Bahan Baku**   | Menggunakan roll meteran fleksibel (Flexy, Sticker, Albatros) atau lembaran digital A3+. | Umumnya plano kertas lembaran besar yang dipotong sesuai kapasitas mesin cetak besar.     |
| **Variabilitas Desain** | Fleksibel (_Variable Data Printing_): tiap lembar bisa berbeda nama/nomor/desain.        | Statis: satu pelat mencetak ribuan lembar yang identik.                                   |

---

## 2. Aktor Pengguna & Peran Sistem (_User Personas_)

Sistem ERP ini dirancang untuk melayani alur kerja kolaboratif antar divisi berikut:

```
+--------------------------------------------------------------------------+
|                            KASIR / FRONT DESK                            |
|             (Input Order, Terima File, Cek Harga, Terima DP/Bayar)        |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                          DESAINER / PRE-PRESS                            |
|          (Verifikasi Resolusi/CMYK, Buat Pola Potong, RIP, Nesting)      |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                           OPERATOR CETAK                                 |
|         (Monitor Antrian Mesin, Pasang Roll/Bahan, Cetak SPK, QC Cetak)  |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                          OPERATOR FINISHING                              |
|           (Laminasi, Mata Ayam, Seaming, Kiss/Die Cut, Jilid, QC)         |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                         CUSTOMER SERVICE / LOGISTIK                      |
|                  (Packing, Notifikasi WA, Serah Terima / Kasir Pelunasan) |
+--------------------------------------------------------------------------+
```

### Detail Tanggung Jawab Per Role:

1. **Kasir / Front Desk (Sales Counter)**:
   - Menerima pesanan dari pelanggan langsung (_walk-in_) atau chat WhatsApp.
   - Menginput dimensi ($P \times L$), bahan, finishing, dan estimasi waktu selesai.
   - Menerapkan tier harga customer (Retail, Member, atau Reseller).
   - Menagih Down Payment (DP) atau pembayaran lunas, mencetak Nota & menerbitkan **SPK**.

2. **Operator Pre-press (Cek File & Layouting)**:
   - Memeriksa kelayakan file: resolusi minimal 150–300 DPI, mode warna CMYK (bukan RGB), margin aman, dan bleed.
   - Menyiapkan garis potong (_die-cut stroke vector_) untuk mesin cutting.
   - Melakukan proses **Nesting / Imposition**: menyusun banyak pesanan berukuran kecil ke dalam satu bentang roll/lembar agar hemat bahan.
   - Melakukan eksekusi RIP (Raster Image Processor) ke file siap cetak mesin (`.tif`, `.prn`, dsb.).

3. **Operator Mesin Cetak (Production Print)**:
   - Memilih antrian SPK prioritas (Express/Urgent didahulukan).
   - Memastikan bahan baku terpasang pada mesin sesuai pesanan.
   - Mengontrol kualitas cetak (_banding_, _nozzle drop_, akurasi warna).
   - Mengupdate status SPK: `Sedang Cetak` &rarr; `Cetak Selesai`.

4. **Operator Finishing (Pasca-Cetak)**:
   - Menjalankan proses mekanikal akhir: mesin laminasi panas/dingin, mata ayam banner, lem lipatan seaming, mesin potong guillotine, atau mesin pon.
   - Memeriksa kesesuaian hasil akhir dengan catatan SPK.
   - Mengupdate status SPK ke `Selesai QC / Siap Ambil`.

5. **Petugas Gudang & Inventori (Warehouse)**:
   - Mencatat penerimaan bahan baku roll & sheet.
   - Memantau sisa meter lari dan stok tinta/toner.
   - Melakukan audit fisik berkala (_stock opname_) dan mendeteksi selisih waste.

6. **Owner / Manajer Keuangan**:
   - Menerima ringkasan omzet harian (_cash-in_ vs transfer vs piutang).
   - Memonitor efisiensi mesin (_uptime_ vs _downtime_) dan pemborosan bahan baku (_waste percentage_).
   - Mengelola limit piutang dan persetujuan jatuh tempo rekanan reseller.
