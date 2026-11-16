# PURIVA — Integrated Web Profile & Web Prototype

**Smart Air Purifier Berbasis Biomimetik untuk Melindungi Kelompok Rentan dari Ancaman Kabut Asap Karhutla di Kalimantan.**

Repository ini memuat dua halaman terintegrasi dalam satu domain untuk proyek **PURIVA** (Universitas Tanjungpura Pontianak):
1. **PURIVA Web Profile (`/`)**: Halaman profil utama proyek yang memperkenalkan latar belakang, konsep biomimetik stomata daun, alur teknologi 7 tahap, galeri perangkat keras (*3D render*, *exploded view*, *wiring diagram*), profil tim inti, serta visi keberlanjutan.
2. **PURIVA Web Prototype (`/prototype/`)**: Aplikasi dashboard interaktif berbasis simulasi untuk mendemonstrasikan pemantauan sensor lingkungan (BME680 & MQ-135), kontrol perangkat & katup stomata, grafik riwayat waktu, serta ekspor CSV.

---

## Arsitektur Direktori & URL

```text
PURIVA/
├── index.html                        # Entry point PURIVA Web Profile (/)
├── assets/
│   ├── logo.png                      # Logo identitas PURIVA
│   ├── product/
│   │   ├── puriva-render.png         # Render fisik 3D perangkat PURIVA
│   │   └── poster-puriva.jpeg        # Poster informasi resmi proyek PURIVA
│   ├── hardware/
│   │   ├── exploded-view.jpeg        # Ilustrasi exploded-view komponen internal
│   │   └── wiring-diagram.jpeg       # Skema koneksi pengkabelan elektronik
│   └── team/
│       ├── chiko.png                 # Immanuel Chiko Selvin (CEO)
│       ├── evan.jpeg                 # Evan Mulya Oktarohmat (CPO)
│       └── perry.jpeg                # Perry Buinasi Edgar (CTO)
├── css/
│   ├── style.css                     # Design system & gaya utama Web Profile
│   ├── animations.css                # Animasi scroll-reveal & interaksi halus
│   └── responsive.css                # Media queries (Desktop, Laptop, Tablet, Mobile)
├── js/
│   ├── navigation.js                 # Sticky navbar, mobile drawer, & scroll-spy
│   └── main.js                       # Galeri interaktif produk & lightbox modal
├── prototype/
│   ├── index.html                    # Entry point PURIVA Web Prototype (/prototype/)
│   ├── assets/
│   │   └── logo.png                  # Logo pada halaman prototype
│   ├── css/
│   │   └── style.css                 # Stylesheet asli Web Prototype
│   └── js/
│       └── app.js                    # Logika simulasi sensor, grafik, & CSV
└── README.md
```

---

## Akun Demo Web Prototype (`/prototype/`)

Untuk masuk ke dalam dashboard simulasi pada halaman `/prototype/`, gunakan kredensial berikut:
- **Username**: `admin`
- **Password**: `puriva123`

*(Catatan: Seluruh pembacaan sensor pada halaman `/prototype/` merupakan data simulasi/dummy untuk keperluan demonstrasi antarmuka sistem).*

---

## Cara Menjalankan Proyek Secara Lokal

Karena proyek ini dibangun menggunakan **HTML5, CSS3, dan Vanilla JavaScript** murni tanpa memerlukan *build step* atau *bundler*, Anda dapat menjalankannya dengan salah satu cara berikut:

1. **Menggunakan Python HTTP Server**:
   ```bash
   cd PURIVA
   python -m http.server 8080
   ```
   Lalu buka `http://localhost:8080/` untuk Web Profile dan `http://localhost:8080/prototype/` untuk Web Prototype.

2. **Menggunakan VS Code Live Server / `npx serve`**:
   ```bash
   npx serve .
   ```

---

## Panduan Deployment (Satu Domain)

Struktur file menggunakan *relative paths* yang kompatibel dengan berbagai layanan *static hosting*:
- **GitHub Pages**: Aktifkan GitHub Pages dari branch `web-profile` (atau `main` setelah *merge*) pada direktori `/ (root)`.
- **Vercel / Netlify**: Hubungkan langsung ke repository GitHub tanpa perintah *build* (*Build Command* dikosongkan, *Output Directory*: `.`).
- **Nginx / Apache**: Arahkan *document root* ke direktori repository ini.

---

## Tim Pengembang — Universitas Tanjungpura Pontianak
- **Immanuel Chiko Selvin** — Ketua / CEO (Statistika)
- **Evan Mulya Oktarohmat** — CPO (Sistem Informasi)
- **Perry Buinasi Edgar** — CTO (Rekayasa Sistem Komputer)
