# 05. Manajemen Mesin Produksi & Antrian Kerja (_Machine Scheduling_)

Dokumentasi mengenai pengelompokan mesin percetakan, kapasitas kerja, algoritma antrian SPK, serta strategi minimasi waktu persiapan mesin (_changeover_).

---

## 1. Inventori & Kategori Mesin Produksi

Bengkel produksi Made Printing mengoperasikan beberapa lini mesin:

| ID Kategori            | Tipe Mesin                         | Lebar Maksimal    | Kecepatan Rata-rata      | Bahan Utama                                 |
| :--------------------- | :--------------------------------- | :---------------- | :----------------------- | :------------------------------------------ |
| `outdoor`              | **Mesin Banner Solvent**           | 3.20 meter        | $30 - 50\ m^2$/jam       | Flexy 280, 340, Korcin 440, Backlite        |
| `indoor`               | **Mesin Indoor Eco-Solvent**       | 1.60 meter        | $10 - 18\ m^2$/jam       | Albatros, Luster, Easy Banner, Stiker Vinyl |
| `a3_press`             | **Digital Press Laser A3+**        | 33 cm (A3+)       | $60 - 80$ lembar/menit   | Art Paper, Art Carton, Ivory, Stiker Chromo |
| `dtf`                  | **DTF Textile Printer (2/4 Head)** | 60 cm             | $6 - 12$ meter lari/jam  | Film PET DTF, Powder Lem                    |
| `cutting`              | **Cutting Plotter Auto-Mark**      | 1.30 meter        | Sesuai kompleksitas pola | Kiss cut stiker, Die cut label, Polyflex    |
| `finishing_laminating` | **Roll Laminator Panas/Dingin**    | 1.60 meter        | Cepat (mekanikal)        | Plastik Doff / Glossy                       |
| `finishing_seaming`    | **Mesin Seaming / Heat Welder**    | Manual / Otomatis | Cepat                    | Banner Outdoor                              |

---

## 2. Status Siklus Mesin (_Machine State Machine_)

Setiap mesin memiliki status operasional real-time di dashboard produksi:

- **`idle` (Siap Beroperasi)**: Mesin dalam kondisi siap cetak, tidak ada error, siap menerima SPK antrian berikutnya.
- **`running` (Sedang Berproduksi)**: Mesin sedang aktif mencetak SPK tertentu. Dashboard menampilkan progress estimasi menit selesai.
- **`maintenance` (Perawatan / Cleaning Head)**: Operator sedang melakukan pembersihan printhead (_head cleaning_ / _nozzle purge_), pengisian tinta, atau kalibrasi alignment.
- **`error` / `jammed` (Mogok / Kertas Macet)**: Terjadi masalah teknis (kertas macet, ink out, head crash). Membutuhkan perhatian supervisor.
- **`offline` (Mati)**: Mesin sedang tidak dinyalakan (di luar jam kerja).

---

## 3. Algoritma Antrian Produksi (_Production Queue Strategy_)

Mengganti roll bahan pada mesin banner besar ($3.2\ \text{m}$) memakan waktu 10–15 menit (_setup / changeover cost_). Untuk memaksimalkan efisiensi (_throughput_), antrian mesin diatur dengan aturan prioritas cerdas:

### Aturan 1: Emergency First (Express / Same-Day)

Pesanan berstatus `priority: 'urgent'` **selalu meloncat ke urutan paling atas** antrian mesin yang bersangkutan, tanpa memedulikan pergantian bahan.

### Aturan 2: Batching Bahan Serupa (Material Grouping)

Untuk pesanan berstatus normal, sistem mengelompokkan pesanan yang menggunakan **jenis bahan yang sama** (misal seluruh SPK _Flexy 280g_ dicetak sekaligus dalam satu sesi pemasangan roll, baru kemudian beralih ke roll _Flexy 340g_).

### Aturan 3: Gang-Run Printing / Nesting

Jika ada 3 pesanan stiker ukuran kecil berbeda pelanggan, operator pre-press menggabungkan ketiganya ke dalam satu layout lebar $1.5\ \text{m}$ sehingga dicetak bersamaan dalam 1 meter lari.

---

## 4. Pelacakan Kapasitas & Bottleneck

Dashboard produksi menampilkan indikator beban kerja (_Workload Metric_):

- **Queue Depth**: Jumlah meter persegi ($m^2$) atau lembar A3+ yang menunggu dicetak per mesin.
- **Estimated Completion Time (ETA)**: Kapan seluruh antrian pada mesin tersebut akan rampung berdasarkan kecepatan rata-rata.
- **Bottleneck Alert**: Memberikan peringatan jika antrian di meja finishing menumpuk (misal mesin cetak selesai cepat, tetapi operator mata ayam / laminasi overload).
