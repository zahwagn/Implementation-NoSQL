<div align="center">

# 🎬 Media Tracker 📚

###  Track Your Movies & Books, See What's Trending!

![Tech Stack](https://skillicons.dev/icons?i=mongodb,express,react,nodejs,docker)

</div>

## 🌟 Why Media Tracker?

Bagaimana jika kamu memiliki hobi membaca buku atau menonton film, namun sering lupa judul yang sudah kamu baca atau tonton? Atau mungkin kamu ingin membuat daftar media dari yang kamu baca atau tonton, tapi tidak tau mau menyimpan dimana? Dan bagaimana jika kamu ingin merekomendasikan teman yang lain atau mencari kecocokan? **Media Tracker** hadir sebagai alat pencatat dan pelengkap digital untuk hobi kamu.

## 🌟 What is Media Tracker?

Media Tracker adalah aplikasi Full Stack MERN (MongoDB, Express.js, React, Node.js) yang dibuat untuk membantu user tracking konsumsi media mereka seperti Movie dan Book. Pengguna dapat menyimpan daftar apa yang telah mereka tonton, baca, rencanakan untuk ditonton/dibaca, atau telah selesaikan. Aplikasi ini memiliki kontrol akses berbasis peran yang ditentukan oleh usia pengguna, memastikan visibilitas konten dan kemampuan manajemen yang sesuai. Selain itu, fitur Billboard dinamis menampilkan media yang sedang tren berdasarkan keterlibatan pengguna (disimulasikan melalui pembelian tiket atau interaksi) menggunakan statistik mingguan.

## 👥 Team Members (Placeholder)

| Peran            | Nama             | NIM        |
|------------------|------------------|------------|
| Fullstack Lead   | Dwigina Sitti Zahwa      | 2306250724 |
| BE & FE Developer| Aliya Rizqiningrum Salamun | 2306161813      |
| BE & FE Developer| Muhammad Iqbal Alfajri | 2306250705      |
| BE & FE Designer   | Raddief Ezra Satrio Andaru | 2306250693      |

## ✨ Key Features

*   **Pelacakan Media**: Catat film, buku, atau media lain dengan status seperti Sudah Ditonton, Sedang Dibaca, Rencana Tonton/Baca, Selesai.
*   **Akses Berbasis Peran & Kategori Usia**: Aplikasi membedakan antara tamu dan pengguna terdaftar, dengan kontrol akses lebih lanjut berdasarkan usia untuk pengguna terdaftar:
    *   **Tamu (Guest)**: Hanya dapat melihat media yang ditujukan untuk kategori usia 'kids'.
    *   **Pengguna (Terdaftar & Login)**: Dapat melakukan operasi Create, Read, Update, dan Delete (CRUD) pada media, dibatasi oleh kelompok usia mereka:
        *   **Anak-anak (Kids, Usia 3-12)**: Dapat melihat dan mengelola media yang ditandai sebagai 'kids'.
        *   **Remaja (Teens, Usia 13-19)**: Dapat melihat dan mengelola media yang ditandai sebagai 'kids' atau 'teen'.
        *   **Dewasa (Adults, Usia 20+)**: Dapat melihat dan mengelola media yang ditandai sebagai 'kids', 'teen', 'adult', atau 'all'.
*   **Statistik Billboard**: Fitur billboard dinamis yang memberi peringkat media berdasarkan aktivitas mingguan (misalnya, pembelian tiket). Ini menggunakan pipeline agregasi MongoDB untuk menghitung peringkat berdasarkan data dalam seminggu terakhir.
*   **Autentikasi Aman**: Fungsionalitas pendaftaran dan login pengguna menggunakan JWT (JSON Web Tokens) untuk sesi yang aman.
*   **Sistem Tiket & Venue (Tersirat dari Model)**: Fungsionalitas kemungkinan ada atau direncanakan untuk mengelola tiket yang terkait dengan media (misalnya, pemutaran film) dan venue terkait.

## 📂 Project Structure

Berdasarkan file yang diberikan, struktur backend adalah sebagai berikut:

```
server/
├── config/
│   └── db.js           # Pengaturan koneksi database (MongoDB)
├── controllers/
│   ├── auth.controller.js # Menangani logika autentikasi
│   └── media.controller.js # Menangani logika media & billboard
├── middlewares/
│   ├── auth.js         # Verifikasi JWT & pemeriksaan peran/usia
│   └── upload.js       # Menangani unggahan file (misalnya, poster)
├── models/
│   ├── Billboard.js    # Skema untuk data billboard mingguan
│   ├── Media.js        # Skema untuk item media (film, buku)
│   ├── Ticket.js       # Skema untuk tiket
│   ├── User.js         # Skema untuk akun pengguna
│   └── Venue.js        # Skema untuk venue
├── node_modules/       # Dependensi proyek
├── repositories/
│   └── media.repository.js # Logika akses data untuk media
├── routes/
│   ├── auth.route.js   # Endpoint autentikasi
│   └── media.route.js  # Endpoint Media dan Billboard
├── uploads/            # Direktori untuk file yang diunggah
├── .env                # Konfigurasi variabel lingkungan
├── Dockerfile          # Konfigurasi Docker untuk deployment
└── index.js          # Titik masuk server utama
```
*(Catatan: Mengasumsikan pengaturan MERN standar dengan direktori `client/` untuk frontend React)*

## 🛠️ Quick Start

[![Node.js](https://img.shields.io/badge/Node.js->=18-success?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB->=5.0-success?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![npm](https://img.shields.io/badge/npm->=8-red?logo=npm&logoColor=white)](https://www.npmjs.com)

### 📋 Prerequisites

*   Node.js (v18 atau lebih baru direkomendasikan)
*   npm atau yarn
*   MongoDB (instance cloud Atlas atau instalasi lokal)
*   Docker (Opsional, untuk deployment terkontainerisasi)

### 🔧 Installation

1.  **Clone repositori:**
    ```bash
    git clone <url-repositori-anda>
    cd <direktori-repositori>
    ```

2.  **Pengaturan Backend:**
    ```bash
    cd server
    npm install
    ```
    *   Buat file `.env` di direktori `server/` dengan menyalin `.env.example` atau menggunakan `.env.txt` yang disediakan sebagai template. Isi detail konfigurasi spesifik Anda (URI Database, Rahasia JWT, dll.). Lihat bagian [Variabel Lingkungan](#-variabel-lingkungan).

3.  **Pengaturan Frontend (Mengasumsikan pengaturan React standar):**
    ```bash
    cd ../client
    npm install
    ```
    *   Konfigurasikan file `.env` frontend jika perlu untuk menunjuk ke URL API backend (misalnya, `VITE_API_URL=http://localhost:5000/api`).

### ▶️ Running the Application

1.  **Mulai Server Backend:**
    ```bash
    cd ../server
    npm run dev # Atau skrip yang Anda konfigurasikan untuk pengembangan
    ```

2.  **Mulai Server Pengembangan Frontend:**
    ```bash
    cd ../client
    npm run dev # Atau skrip yang Anda konfigurasikan untuk pengembangan
    ```

Aplikasi sekarang seharusnya dapat diakses, biasanya di `http://localhost:3000` atau `http://localhost:5173` untuk frontend, dengan backend berjalan pada port yang ditentukan dalam file `.env` Anda (misalnya, 5000).

## 📊 Database Architecture

### 🔄 Entity Relationship Diagram (Conceptual)



### Model Mongoose Inti (Disederhanakan)

#### Pengguna (`User.js`)
Menangani akun pengguna, detail autentikasi, dan yang terpenting, menentukan kategori konten yang dapat diakses berdasarkan usia.
```javascript
{
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Di-hash
  age: { type: Number, required: true, min: 3, max: 120 },
  allowedCategories: { type: [String], default: [] }, // Diisi otomatis berdasarkan usia melalui pre-save hook
  role: { type: String, enum: [\'user\', \'admin\'], default: \'user\' },
  createdAt: { type: Date, default: Date.now }
}
```

#### Media (`Media.js`)
Mewakili item yang dapat dilacak seperti film atau buku, termasuk batasan usia.
```javascript
{
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: [\'Movie\', \'Book\'], required: true }, // Contoh tipe
  genre: { type: String },
  ageCategory: { type: String, enum: [\'kids\', \'teen\', \'adult\', \'all\'], required: true },
  posterUrl: { type: String },
  releaseDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: \'User\' },
  createdAt: { type: Date, default: Date.now }
}
```

#### Billboard (`Billboard.js`)
Menyimpan data peringkat mingguan yang diagregasi.
```javascript
{
  weekStartDate: { type: Date, required: true, unique: true },
  rankedMedia: [
    {
      mediaId: { type: mongoose.Schema.Types.ObjectId, ref: \'Media\' },
      score: { type: Number, default: 0 }
    }
  ],
  createdAt: { type: Date, default: Date.now }
}
```
*(Skema untuk `Ticket.js` dan `Venue.js` mengikuti pola serupa, mendefinisikan field untuk pembelian tiket dan detail venue masing-masing.)*

## 🌐 API Endpoints

Backend menyediakan API RESTful. Endpoint kunci meliputi:

### 🔐 Auth Routes (/api/auth)
*   `POST /register` — Mendaftarkan pengguna baru.
*   `POST /login` — Login pengguna yang sudah ada, mengembalikan JWT.
*   `GET /profile` — Mendapatkan profil pengguna yang sedang login saat ini (Memerlukan Autentikasi).

### 🎞️ Media Routes (/api/media)
*   `POST /` — Membuat media baru (Memerlukan Autentikasi, kategori usia pengguna membatasi `ageCategory` yang diizinkan untuk media).
*   `GET /` — Mendapatkan daftar media. Menyaring hasil berdasarkan `allowedCategories` pengguna yang login. Tamu hanya melihat media 'kids'.
*   `GET /:id` — Mendapatkan detail media spesifik (Memerlukan Autentikasi, memeriksa apakah `ageCategory` media berada dalam `allowedCategories` pengguna).
*   `PUT /:id` — Memperbarui media (Memerlukan Autentikasi, pengguna harus memiliki izin untuk `ageCategory` media).
*   `DELETE /:id` — Menghapus media (Memerlukan Autentikasi, pengguna harus memiliki izin untuk `ageCategory` media).

### 📊 Billboard Routes (/api/billboard)
*   `GET /weekly` — Mendapatkan peringkat billboard mingguan saat ini (Dapat diakses publik, menggunakan agregasi).

### 🎟️ Ticket & Venue Routes (Potential - /api/tickets, /api/venues)
*   Endpoint untuk membuat/melihat tiket dan venue kemungkinan akan ada di sini, memerlukan autentikasi untuk sebagian besar tindakan.

*(Catatan: Middleware autentikasi (`auth.js`) melindungi rute yang relevan dan memberlakukan kontrol akses berbasis usia.)*

## 🔑 Environment Variables

Buat file `.env` di direktori `server/` dengan variabel berikut (merujuk pada `.env.txt` Anda):

```bash
# Konfigurasi Server
PORT=5000 # Atau port lain yang Anda inginkan
NODE_ENV=development # \'production\' untuk deployment

# Konfigurasi Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority # String koneksi MongoDB Anda

# Autentikasi (JWT)
JWT_SECRET=KUNCI_RAHASIA_SUPER_ANDA_GANTI_SAYA # Kunci rahasia yang kuat dan acak
JWT_EXPIRES_IN=1d # Kedaluwarsa token (misalnya, 1d, 7d, 1h)

# Tambahkan variabel lain jika diperlukan (misalnya, kunci API Cloudinary untuk unggahan gambar)
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
```

## 🐳  Docker Deployment (Optional)

Sebuah `Dockerfile` disediakan untuk mengkontainerisasi aplikasi backend:

```dockerfile
# Gunakan runtime Node.js resmi sebagai image induk
FROM node:18-alpine

# Atur direktori kerja di dalam kontainer
WORKDIR /app/server

# Salin package.json dan package-lock.json (atau yarn.lock) terlebih dahulu
# untuk memanfaatkan cache Docker
COPY server/package*.json ./

# Instal dependensi aplikasi
RUN npm install

# Bundel sumber aplikasi di dalam image Docker
COPY server/ .

# Buat port tersedia untuk dunia luar kontainer ini
EXPOSE 5000 # Atau port yang ditentukan di .env Anda

# Tentukan variabel lingkungan (dapat diganti saat runtime)
ENV NODE_ENV=production

# Jalankan aplikasi saat kontainer diluncurkan
CMD ["node", "index.js"]
```
Bangun dan jalankan kontainer menggunakan perintah Docker standar.

## 🤝 Berkontribusi

Kontribusi sangat diterima! Silakan ikuti langkah-langkah ini:

1.  Fork repositori.
2.  Buat branch fitur Anda (`git checkout -b feature/FiturLuarBiasa`).
3.  Commit perubahan Anda (`git commit -m 'Tambah FiturLuarBiasa'`).
4.  Push ke branch (`git push origin feature/FiturLuarBiasa`).
5.  Buka Pull Request.

---
<div align="center">
Dibuat dengan MERN oleh [Nama Tim Anda/Nama Anda]
</div>

