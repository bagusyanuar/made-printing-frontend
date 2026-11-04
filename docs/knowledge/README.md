# Knowledge Base: Made Printing ERP (Digital Printing System)

Direktori ini berisi dokumentasi pengetahuan domain (_domain knowledge_), model bisnis, proses operasional bengkel percetakan, rumus kalkulasi teknis, dan standar alur data untuk sistem **ERP Made Printing**.

Dokumen ini ditujukan sebagai **konteks utama bagi AI Agents dan Developer** agar tidak salah mengasumsikan logika bisnis percetakan digital dengan aplikasi e-commerce atau dashboard generic biasa.

---

## 📚 Daftar Modul Knowledge

|   No   | Dokumen                                                                            | Cakupan & Isi                                                                                                                                                                |
| :----: | :--------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **01** | [**01-overview-and-domain.md**](./01-overview-and-domain.md)                       | Gambaran umum industri digital printing, perbedaan dengan offset, profil pengguna (_personas_), dan arsitektur operasional.                                                  |
| **02** | [**02-order-spk-lifecycle.md**](./02-order-spk-lifecycle.md)                       | Alur siklus hidup order (dari kasir hingga serah terima), status semantik pesanan, dan anatomi dokumen **SPK (Surat Perintah Kerja)**.                                       |
| **03** | [**03-products-materials-finishing.md**](./03-products-materials-finishing.md)     | Taksonomi produk percetakan (Large Format Outdoor/Indoor, Digital A3+, DTF Tekstil, Cutting Sticker, Merchandise) dan opsi pasca-cetak (_finishing_).                        |
| **04** | [**04-calculation-and-pricing.md**](./04-calculation-and-pricing.md)               | Rumus matematis kalkulasi harga cetak: meter persegi ($m^2$), click/lembar A3+, meter lari DTF, nesting, matrix harga bertingkat (_multi-tier pricing_), dan presisi Rupiah. |
| **05** | [**05-production-machines-and-queues.md**](./05-production-machines-and-queues.md) | Karakteristik mesin produksi, kapasitas cetak, pengelompokan bahan (_changeover minimization_), dan antrian produksi (_machine scheduling_).                                 |
| **06** | [**06-inventory-and-materials.md**](./06-inventory-and-materials.md)               | Manajemen inventori bahan continuous (_roll-based_) vs diskrit (_sheet-based_), consumable tinta CMYK, dan perhitungan limbah (_scrap/waste_).                               |
| **07** | [**07-pos-finance-and-invoicing.md**](./07-pos-finance-and-invoicing.md)           | Operasional Kasir (POS), alur Down Payment (DP) & pelunasan, manajemen piutang / kasbon reseller, serta dokumen nota, invoice, dan kwitansi.                                 |

---

## 🎯 Prinsip Utama Domain Percetakan Digital

1. **SPK adalah Jantung Produksi**: Pesanan pelanggan yang sudah dibayar/DP otomatis menjadi SPK. Tim produksi tidak melihat harga uang, melainkan detail teknis ukuran, media bahan, dan instruksi finishing.
2. **Kalkulasi Mengikuti Dimensi Riil**: Luas dihitung dari $P \times L$ dengan toleransi _minimum order charge_ (misal minimal $1.0\ m^2$).
3. **Pemisahan Peran**: Kasir (komersial) &rarr; Pre-press (kesiapan file) &rarr; Operator Mesin (cetak fisik) &rarr; Finishing (pemotongan & kerapihan) &rarr; Pengambilan Barang.
4. **Presisi Finansial**: Seluruh transaksi menggunakan mata uang Rupiah (`IDR`) dengan nilai integer utuh tanpa pembulatan koma desimal sen yang rancu.
