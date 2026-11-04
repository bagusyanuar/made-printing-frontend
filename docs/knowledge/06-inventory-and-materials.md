# 06. Manajemen Inventori, Bahan Baku, & Pelacakan Waste

Dokumentasi mengenai manajemen stok bahan continuous (_roll_), diskrit (_sheet_), tinta, serta kalkulasi limbah bahan (_waste tolerance_).

---

## 1. Dua Tipe Inventori Bahan Baku Utama

### A. Bahan Continuous / Roll-Based Goods

Bahan yang dibeli dalam bentuk gulungan silinder panjang:

- **Parameter Karakteristik**:
  - **Lebar Roll Fisik**: $1.07\ \text{m}$, $1.27\ \text{m}$, $1.52\ \text{m}$, $2.20\ \text{m}$, $2.50\ \text{m}$, $3.20\ \text{m}$.
  - **Panjang Roll Total**: Umumnya $50\ \text{meter}$ atau $100\ \text{meter}$.
  - **Ketebalan / Gramatur**: $280\ \text{gsm}$, $340\ \text{gsm}$, $440\ \text{gsm}$, dsb.
- **Pencatatan Stok**:
  - Dihitung dalam **Meter Lari ($m$)** atau **Meter Persegi ($m^2$)**.
  - Setiap cetak mengurangi panjang roll aktif.
  - Sisa potongan bahan (_offcuts / sisa perca_): Jika sisa potongan roll masih memiliki lebar $> 1\ \text{m}$ dan panjang $> 2\ \text{m}$, dicatat sebagai bahan sisa yang dapat dialokasikan untuk pesanan kecil.

### B. Bahan Diskrit / Sheet-Based Goods

Bahan yang dibeli dalam bentuk lembaran plano:

- **Satuan Pembelian**: **Rim** ($1\ \text{Rim} = 500\ \text{lembar}$) atau **Lembar Plano** (misal ukuran $65 \times 100\ \text{cm}$ atau $79 \times 109\ \text{cm}$).
- **Pemotongan Plano ke A3+**:
  - Satu lembar plano $65 \times 100\ \text{cm}$ dapat dipotong menjadi 4 lembar A3+ ($32 \times 48\ \text{cm}$).
  - Stok yang dicatat di sistem terbagi dua: Stok Plano Mentah di Gudang dan Stok Lembar A3+ Siap Cetak di Ruang Mesin.

---

## 2. Inventori Tinta & Consumables

Tinta merupakan biaya variabel krusial pada digital printing:

- **Tinta Solvent Outdoor**: Galon / Botol 1 Liter atau 5 Liter (CMYK).
- **Tinta Eco-Solvent**: Botol 1 Liter (CMYK, Light Cyan, Light Magenta).
- **Tinta DTF**: Botol 1 Liter (CMYK + Extra White Ink). Tinta putih DTF wajib dishake/diaduk otomatis agar tidak mengendap di printhead.
- **Toner Laser A3+**: Cartridge bubuk toner (Black, Cyan, Magenta, Yellow) dan Drum Unit.
- **Consumable Pasca-Cetak**:
  - Mata ayam (Grommets): Box isi 1.000 / 5.000 pcs.
  - Lem banner (Cyanoacrylate adhesive): Botol 500g.
  - Kawat spiral jilid: Box batang atau roll spul.
  - Mata pisau cutting (_plotter blades_ 45° dan 60°).

---

## 3. Toleransi Limbah & Waste Ratio (_Scrap Tracking_)

Di percetakan, bahan terbuang (_waste_) tidak dapat dihindarkan. Sistem ERP Made Printing melacak **Waste Ratio** untuk mendeteksi inefisiensi operator atau keausan mesin:

### Sumber-sumber Limbah Cetak:

1. **Lead-in & Lead-out Margin**:
   - Untuk menarik bahan dari roll ke printhead dan roll penarik (_take-up roller_), dibutuhkan sekitar $30 - 50\ \text{cm}$ bahan kosong di awal dan akhir cetak.
2. **Margin Samping (Side Trim)**:
   - Jika lebar bahan adalah $3.2\ \text{m}$, namun desain spanduk yang dicetak selebar $3.0\ \text{m}$, maka ada sisa strip putih $20\ \text{cm}$ di sepanjang spanduk.
3. **Reject Cetak (Gagal Produksi)**:
   - Goresan head (_head strike_), tinta tersumbat di tengah jalan (_banding_), salah ukuran file, atau salah finishing (misal salah posisi mata ayam).

### Rumus Persentase Waste:

$$\text{Waste Ratio (\%)} = \frac{\text{Meter Bahan Terpakai Riil} - \text{Meter Luas SPK Selesai}}{\text{Meter Bahan Terpakai Riil}} \times 100\%$$

_Target Standar Made Printing_: Waste ratio operasional harus di bawah **8%**. Jika melebihi 10%, supervisor produksi menerima notifikasi review performa.
