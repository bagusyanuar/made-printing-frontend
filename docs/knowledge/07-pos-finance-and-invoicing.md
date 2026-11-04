# 07. Point of Sales (POS), Keuangan, & Manajemen Penagihan

Dokumentasi mengenai operasional kasir (_front desk POS_), skema pembayaran, Down Payment (DP), piutang reseller, serta spesifikasi dokumen transaksi.

---

## 1. Alur Operasional Kasir / POS

Meja kasir adalah titik awal transaksi Made Printing:

- **Kecepatan Layanan**: Kasir harus bisa menginput pesanan cepat dalam waktu $< 60$ detik untuk pesanan retail standar.
- **Pengecekan File Cepat**: Kasir mengecek dimensi file dasar dan preview gambar sebelum finalisasi order.
- **Pemberian SPK & Nota**: Begitu pembayaran/DP diverifikasi, sistem langsung:
  1. Mencetak Nota Pembayaran untuk customer (lengkap dengan QR Code / Link pelacakan order).
  2. Menerbitkan SPK digital ke dashboard produksi dan mencetak label barcode untuk ditempel pada lembar instruksi kerja.

---

## 2. Skema & Metode Pembayaran

### A. Tipe Status Pembayaran

- **`paid` (Lunas Penuh)**: Customer membayar 100% di muka. Saat barang jadi, langsung diserahkan tanpa antri kasir lagi.
- **`partial` (Down Payment / DP)**: Customer membayar uang muka (biasanya minimal 50%). Sisa tagihan wajib dilunasi saat serah terima barang.
- **`unpaid` (Belum Bayar)**: Berlaku khusus untuk pelanggan kategori **Reseller** yang memiliki plafon kredit/tempo, atau instansi pemerintah/BUMN dengan mekanisme surat pesanan (PO).
- **`refunded` (Uang Dikembalikan)**: Jika pesanan dibatalkan sebelum cetak.

### B. Metode Pembayaran yang Didukung

1. **Tunai (Cash)**: Otomatis menghitung kembalian uang.
2. **QRIS Dinamis / Statis**: Scan langsung di meja kasir.
3. **Transfer Bank (BCA, Mandiri, BRI, BNI)**: Upload bukti transfer atau integrasi mutasi bank otomatis.
4. **Saldo Deposit Reseller**: Saldo prepaid yang didepositkan oleh reseller rekanan sebelumnya.
5. **Tempo / Piutang Usaha**: Pencatatan piutang jatuh tempo (14 hari atau 30 hari).

---

## 3. Manajemen Piutang & Plafon Kredit Reseller (_Credit Limit_)

Untuk mitra bisnis percetakan / reseller, Made Printing memberikan fasilitas pembayaran berkala:

- **Plafon Kredit (Credit Limit)**: Batas maksimal saldo piutang yang boleh dimiliki mitra (contoh: Rp 5.000.000).
- **Jatuh Tempo (Term of Payment - TOP)**: Batas waktu pelunasan nota (contoh: 14 hari sejak nota terbit).
- **Auto-Hold Order**: Jika piutang reseller melebihi batas limit atau ada nota yang telah melewati masa jatuh tempo (_overdue_), sistem kasir secara otomatis mengunci pembuatan SPK baru untuk reseller tersebut sampai pelunasan dilakukan.

---

## 4. Format Dokumen Finansial & Percetakan

1. **Nota Pemesanan / Struk Kasir**:
   - Diberikan ke pelanggan.
   - Berisi daftar item, rincian harga, status DP/Lunas, dan perkiraan tanggal/jam barang bisa diambil.
2. **SPK (Surat Perintah Kerja Produksi)**:
   - Diteruskan ke bengkel produksi (operator mesin & finishing).
   - **TIDAK MENCANTUMKAN HARGA UANG** demi menjaga kerahasiaan tarif reseller/modal dari mata operator lapangan. Hanya mencantumkan detail teknis material, ukuran, Qty, dan finishing.
3. **Surat Jalan / Bukti Serah Terima**:
   - Dokumen tanda tangan serah terima fisik barang saat diambil oleh pelanggan atau kurir ekspedisi.
4. **Invoice Resmi & Kwitansi**:
   - Digunakan untuk penagihan korporat/instansi atau rekap tagihan bulanan mitra reseller.
