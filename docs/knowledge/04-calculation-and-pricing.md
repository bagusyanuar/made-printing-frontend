# 04. Model Rumus Kalkulasi Harga & Multi-Tier Pricing

Dokumen ini mendefinisikan rumus komputasi matematis untuk setiap jenis produk cetak, penanganan _minimum charge_, matrix harga customer bertingkat, serta aturan presisi angka finansial.

---

## 1. Rumus Cetak Format Meteran ($m^2$ - Banner & Indoor)

### A. Rumus Dasar

$$\text{Luas (m}^2) = \frac{\text{Panjang (cm)} \times \text{Lebar (cm)}}{10.000}$$

Jika input dalam meter:
$$\text{Luas (m}^2) = \text{Panjang (m)} \times \text{Lebar (m)}$$

### B. Aturan Minimum Order Charge

Pada industri cetak banner, file kecil (contoh: $0.5 \times 0.6\ \text{m} = 0.3\ m^2$) tetap memakan waktu setting mesin dan bahan awal. Oleh karena itu berlaku aturan **Minimum Charge**:
$$\text{Luas Tagihan} = \max(\text{Luas Aktual}, \text{Batas Minimum Charge})$$

_Contoh Standar Made Printing_:

- Batas Minimum Luas = $1.00\ m^2$.
- Jika ukuran banner $0.8\ \text{m} \times 0.8\ \text{m} = 0.64\ m^2$, maka sistem menghitungnya sebagai $1.00\ m^2$.
- Jika ukuran banner $2.0\ \text{m} \times 1.5\ \text{m} = 3.00\ m^2$, maka dihitung $3.00\ m^2$.

### C. Total Harga Item Banner

$$\text{Subtotal} = (\text{Luas Tagihan} \times \text{Harga Satuan Bahan per } m^2 + \text{Biaya Finishing}) \times \text{Quantity}$$

---

## 2. Rumus Cetak Digital Press Lembaran A3+ (Sheetfed)

Pada cetak A3+, pelanggan sering memesan dalam kuantitas produk akhir (misal: 100 kartu nama atau 500 label stiker). Sistem perlu menghitung kebutuhan lembar A3+ melalui algoritma **Nesting / Imposition**:

### A. Rumus Muat per Lembar (_Imposition Yield_)

Area cetak efektif standar lembar A3+ adalah **$31.0 \times 47.0\ \text{cm}$** (setelah dikurangi margin jepit mesin cetak laser).

$$\text{Pcs Muat Horizontal} = \left\lfloor \frac{31.0}{\text{Lebar Pcs}} \right\rfloor \times \left\lfloor \frac{47.0}{\text{Panjang Pcs}} \right\rfloor$$
$$\text{Pcs Muat Vertikal} = \left\lfloor \frac{31.0}{\text{Panjang Pcs}} \right\rfloor \times \left\lfloor \frac{47.0}{\text{Lebar Pcs}} \right\rfloor$$
$$\text{Pcs per Lembar A3+} = \max(\text{Pcs Muat Horizontal}, \text{Pcs Muat Vertikal})$$

_Contoh Kartu Nama ($9.0 \times 5.5\ \text{cm}$)_:

- Posisi 1: $\lfloor 31 / 9 \rfloor \times \lfloor 47 / 5.5 \rfloor = 3 \times 8 = 24\ \text{pcs}$.
- Posisi 2: $\lfloor 31 / 5.5 \rfloor \times \lfloor 47 / 9 \rfloor = 5 \times 5 = 25\ \text{pcs}$.
- &rarr; Maka dipilih 25 pcs per lembar A3+.

### B. Kebutuhan Lembar A3+

$$\text{Jumlah Lembar A3+} = \left\lceil \frac{\text{Jumlah Pesanan}}{\text{Pcs per Lembar A3+}} \right\rceil$$

### C. Biaya Cetak A3+

$$\text{Total} = \text{Jumlah Lembar A3+} \times (\text{Harga Cetak A3+} + \text{Biaya Bahan Kertas} + \text{Biaya Laminasi A3+}) + \text{Biaya Jasa Potong}$$

---

## 3. Rumus Cetak DTF (Meter Lari)

Pada DTF (Direct-to-Film), lebar roll film sudah paten ($58\ \text{cm}$ atau $60\ \text{cm}$). Biaya dihitung berdasarkan **panjang meter lari** yang digunakan:

$$\text{Panjang Meter} = \frac{\text{Panjang Desain (cm)}}{100}$$
$$\text{Panjang Tagihan} = \max(\text{Panjang Meter}, \text{Minimum DTF (misal 0.5m)})$$
$$\text{Total} = \text{Panjang Tagihan} \times \text{Harga DTF per Meter}$$

---

## 4. Multi-Tier Customer Pricing (Matrix Harga)

Made Printing menerapkan 3 tingkat harga pelanggan:

| Tier                | Kode Sistem | Kriteria                                                                                           | Kebijakan Harga                                                                                                                                      |
| :------------------ | :---------- | :------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Retail (Umum)**   | `retail`    | Pelanggan umum / perorangan / walk-in.                                                             | Harga standar eceran penuh. Wajib DP min 50% atau lunas.                                                                                             |
| **Member (Silver)** | `member`    | Pelanggan rutin / UMKM terdaftar nomor member.                                                     | Diskon otomatis 5% - 10% dari harga retail, atau poin reward.                                                                                        |
| **Reseller (Gold)** | `reseller`  | Mitra percetakan, desainer freelance, agensi iklan yang melempar job cetak rutin ke Made Printing. | **Harga Modal Grosir Khusus** (misal Flexy 280g Rp 15.000/$m^2$ dibanding retail Rp 25.000/$m^2$). Berhak atas fasilitas bayar tempo / kredit limit. |

---

## 5. Standar Presisi Finansial dalam Kode

Untuk menghindari galat pembulatan floating point JavaScript (`0.1 + 0.2 === 0.30000000000000004`):

1. **Penyimpanan Angka**:
   - Seluruh nilai nominal Rupiah akhir disimpan sebagai **Integer utuh** (misal: `25000` untuk Rp 25.000).
   - Rate dimensi (seperti panjang meter, berat kilogram) disimpan dengan presisi maksimum 2 hingga 4 digit desimal (`"1.25"` atau `1.25`).
2. **Format Tampilan**:
   - Gunakan fungsi utilitas formatting terpusat: `formatRupiah(amount)` &rarr; `"Rp 150.000"`.
3. **Pembulatan Total**:
   - Total akhir transaksi dibulatkan ke rupiah terdekat (tidak ada uang receh pecahan sen di kasir).
