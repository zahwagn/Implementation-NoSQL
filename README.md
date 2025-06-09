<div align="center">

# <span style="color: darkblue;">🎬 Media Tracker 📚</span>
### <span style="color: blue;">Track Your Movies & Books, See What's Trending!</span>


![Tech Stack](https://skillicons.dev/icons?i=mongodb,express,react,nodejs,docker)

</div>


## 🌟 <span style="color: darkblue;">Why</span> Media Tracker?

Pernah nggak sih, kamu hobi atau suka baca buku dan nonton film tapi sering lupa judulnya? Atau pengen bikin daftar yang udah kamu tonton atau baca, tapi nggak tahu simpan di mana? Terus, pengen juga kasih rekomendasi ke temen atau cari yang punya selera sama? Nah, **✨Media Tracker✨ hadir sebagai alat pencatat dan pelengkap digital** untuk hobi kamu!

## 🌟 <span style="color: darkblue;">What</span> is Media Tracker?

Media Tracker adalah **aplikasi Full Stack MERN (MongoDB, Express.js, React, Node.js)** yang dibuat untuk membantu pengguna *tracking* konsumsi media mereka seperti *Movie* dan *Book*. Pengguna dapat menyimpan daftar dari apa yang telah mereka tonton, baca, rencanakan, atau telah di selesaikan. Aplikasi ini memiliki kontrol akses berbasis ***role*** yang ditentukan oleh usia pengguna, memastikan visibilitas konten dan penggunaan yang sesuai. Selain itu, fitur **Billboard** dinamis menampilkan media yang sedang *trend* berdasarkan keterlibatan pengguna menggunakan statistik mingguan, bulan, dan tahun.

## 👥 Team <span style="color: darkblue;">Members</span>

| Peran            | Nama             | NPM        |
|------------------|------------------|------------|
| **Fullstack Lead** & Developer  | Dwigina Sitti **Zahwa**      | 2306250724 |
| Fullstack Developer| **Aliya** Rizqiningrum Salamun | 2306161813      |
| Fullstack Developer| Muhammad **Iqbal** Alfajri | 2306250705      |
| FullstackDeveloper   | **Raddief** Ezra Satrio Andaru | 2306250693      |

## ✨ Key <span style="color: darkblue;">Features</span>

1. **Tracking Media** 
Pengguna dapat: 
* Mencatat media seperti Movie dan Book.
* Dengan status seperti Watched, Read, Plan, dan Completed.
---
2. **Akses Berbasis Role & Kategori Usia**
Aplikasi terbagi antara *guest* dan *user* terdaftar dengan kontrol akses yang berbeda berdasarkan usia untuk pengguna terdaftar, pegguna dapat : 
* **Guest**: Hanya dapat melihat media yang ditujukan untuk kategori usia 'kids' dan tidak bisa menambahkan media.
* **User (Regist & Login)**: Dapat menambahkan (*Create*), melihat (*Read*), mengedit (*Update*), dan menghapus (*Delete*) pada media. Namun, dibatasi dengan kategori usia mereka yaitu,
    * **Anak-anak (Kids, Usia 3-12)**: Dapat melihat dan mengelola media yang ditandai sebagai 'kids'.
    *   **Remaja (Teens, Usia 13-19)**: Dapat melihat dan mengelola media yang ditandai sebagai 'kids' atau 'teen'.
    *   **Dewasa (Adults, Usia 20+)**: Dapat melihat dan mengelola media yang ditandai sebagai 'kids', 'teen', 'adult', atau 'all'.
---
3. **Statistik Billboard**
Fitur *billboard* dinamis yang memberikan peringkat media berdasarkan aktivitas mingguan (misalnya, dalam pembelian tiket). Dengan menggunakan pipeline agregasi MongoDB untuk menghitung peringkat berdasarkan data dalam seminggu terakhir. Pengguna dapat : 
* Melihat trending dan jenis Movie atau Book yang lagi viral saat itu.
---
4.  **Autentikasi Aman**
Fungsionalitas *register* dan *login* pengguna menggunakan JWT (JSON Web Tokens) untuk membuatnya lebih aman dan terverifikasi.
---
5. **Ticketing & Venue**
Fungsionalitas untuk mengelola tiket yang terkait dengan media (misalnya, pemutaran film) dan *venue* terkait. Pengguna dapat : 
* Melihat lokasi di mana media tersebut dapat diakses atau dibeli.
* Membeli tiket film atau buku.

## 📂 Project <span style="color: darkblue;">Structure</span>

Memiliki struktur ***backend dan frontend*** sebagai berikut:

```
project-root/
├── client/              # Folder untuk frontend (React)
│   ├── public/          # Folder untuk file statis seperti index.html
│   │   └── index.html   # File HTML utama
│   ├── src/             # Folder untuk file sumber aplikasi
│   │   ├── assets/      # Folder untuk file aset seperti gambar atau font
│   │   ├── components/  # Komponen-komponen React
│   │   ├── pages/       # Halaman utama aplikasi
│   │   ├── api.js       # Mengelola komunikasi dengan backend
│   │   ├── App.css      # Gaya CSS untuk aplikasi utama
│   │   ├── App.jsx      # Komponen utama React
│   │   ├── index.css    # Gaya CSS untuk elemen global
│   │   ├── main.jsx     # Titik masuk aplikasi React
│   ├── .gitignore       # File untuk menentukan file dan folder yang diabaikan oleh git
│   ├── eslint.config.js # Konfigurasi ESLint untuk linting kode
│   ├── index.html       # File HTML utama untuk penghubung
│   ├── package-lock.json# File yang mengunci versi dependensi
│   ├── package.json     # File konfigurasi proyek dengan dependensi
│   ├── postcss.config.js# Konfigurasi untuk PostCSS
│   ├── README.md        # Dokumentasi proyek
│   ├── tailwind.config.js# Konfigurasi untuk Tailwind CSS
│   └── vite.config.js   # Konfigurasi untuk Vite (build tool)
├── server/              # Folder untuk backend (Node.js)
│   ├── config/          # Folder untuk konfigurasi aplikasi
│   │   └── db.js        # Pengaturan koneksi database (MongoDB)
│   ├── controllers/     # Logika untuk menangani request
│   │   ├── auth.controller.js  # Menangani logika autentikasi
│   │   └── media.controller.js # Menangani logika media & billboard
│   ├── middlewares/     # Folder untuk middleware aplikasi
│   │   ├── auth.js      # Verifikasi JWT & pemeriksaan peran/usia
│   │   └── upload.js    # Menangani unggahan file (misalnya, poster)
│   ├── models/          # Skema MongoDB untuk aplikasi
│   │   ├── Billboard.js # Skema untuk data billboard mingguan
│   │   ├── Media.js     # Skema untuk item media (film, buku)
│   │   ├── Ticket.js    # Skema untuk tiket
│   │   ├── User.js      # Skema untuk akun pengguna
│   │   └── Venue.js     # Skema untuk venue
│   ├── node_modules/    # Dependensi proyek
│   ├── repositories/    # Folder untuk logika akses data
│   │   └── media.repository.js # Logika akses data untuk media
│   ├── routes/          # Endpoint API
│   │   ├── auth.route.js   # Endpoint autentikasi
│   │   └── media.route.js  # Endpoint Media dan Billboard
│   ├── uploads/         # Direktori untuk file yang diunggah
│   ├── .env             # Konfigurasi variabel lingkungan
│   ├── Dockerfile       # Konfigurasi Docker untuk backend
│   ├── package-lock.json # File yang mengunci versi dependensi
│   ├── package.json     # File konfigurasi proyek dengan dependensi
│   └── index.js         # Titik masuk server utama
├── docker-compose.yml   # Konfigurasi Docker Compose untuk menjalankan container
├── .gitignore           # Global gitignore untuk seluruh proyek
```

*(Catatan: Menggunakan pengaturan MERN standar dengan direktori `client/` untuk frontend React)*

## 🛠️ Quick <span style="color: darkblue;">Start</span>

[![Node.js](https://img.shields.io/badge/Node.js->=18-success?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB->=5.0-success?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![npm](https://img.shields.io/badge/npm->=8-red?logo=npm&logoColor=white)](https://www.npmjs.com)

### 📋 Prerequisites
*   Node.js (v18 atau lebih baru direkomendasikan)
*   npm atau yarn
*   MongoDB (Instance cloud Atlas atau instalasi lokal)
*   Docker (Opsional, untuk deployment terkontainerisasi)
---
### 🔧 Installation
1.  **Clone Repository**
    ```bash
    git clone <url-repositori-anda>
    cd <direktori-repositori>
    ```
2.  **Backend Setting**
    ```bash
    cd server
    npm install
    ```
    Buat file `.env` di direktori `server/` dengan menyalin `.env` lihat pada bagian [Environment Variables](#-Environment-Variables).

3.  **Frontend Setting**
    ```bash
    cd ../client
    npm install
    ```
    Konfigurasikan file `.env` *frontend* untuk *linking* ke URL API *backend* (misalnya, `VITE_API_URL=http://localhost:5000/api`).
---
### ▶️ Running the Application

1.  **Memulai Server Backend:**
    ```bash
    cd ../server
    npm run dev # atau npm run start
    ```

2.  **Memulai Server Frontend:**
    ```bash
    cd ../client
    npm run dev
    ```

Aplikasi ini dapat diakses, pada`http://localhost:3000` untuk *frontend* dengan *backend* berjalan pada *port* yang ditentukan dalam file `.env` (misalnya, 5000 atau 3000).

## 💻 Frontend <span style="color: darkblue;">Preview</span>

### **GUEST View**
* Hanya dapat melihat media yang ada atau GET Media
![image](https://hackmd.io/_uploads/H1Xkk7CGll.png)
---
### **Register and Login View**
* Dapat melakukan daftar akun dengan mengisi Name, Username, Age, Email, dan Password.
![image](https://hackmd.io/_uploads/BJtTAG0fee.png)

* Setelah mendaftar akun dapat masuk atau login ke dalam website dengan memasukkan Email dan Password yang telah didaftarkan pada Register.
![image](https://hackmd.io/_uploads/ByQBJQAGgl.png)
---
### **USER View**
**Movies Section**
* Dapat melihat **Movies Library** (Daftar film yang ada) atau GET Media. 
* Dapat melakukan "**Filters**" untuk mencari Movies yang ada pada Library sesuai dengan Rating, Status, Sort by (Newest, Highest Rating, Most Tickets). Serta Available at Venue.
![image](https://hackmd.io/_uploads/SkIUMQRMxx.png)
* Serta dapat **menambahkan Movies** yang diinginkan atau POST Media.
![image](https://hackmd.io/_uploads/ByFU470zlx.png)
* Dapat **melakukan edit** atau perubahan pada section Movies atau PUT Media.
* Dapat **menghapus media** Movies atau DELETE Media.
![image](https://hackmd.io/_uploads/rJwPN7AGex.png)
---
**Books Section**

* Dapat melihat **Books Library** (Daftar buku yang ada) atau POST Media.
* Dapat melakukan "**Filters**" untuk mencari Books yang ada pada Library sesuai dengan Rating, Status, Sort by (Newest, Highest Rating, Most Buys). Serta Available at Venue.
![image](https://hackmd.io/_uploads/Sy8XH7Azle.png)
* Dapat **menambahkan Books** yang diinginkan atau POST Media.
![image](https://hackmd.io/_uploads/ryjP7QAGxe.png)
* Dapat **menghapus media** Books atau DELETE Media.
![image](https://hackmd.io/_uploads/H1jdX70zee.png)
* Dapat **melakukan edit** atau perubahan pada detail Books dan Movies yang diinginkan atau PUT Media.
![image](https://hackmd.io/_uploads/HkD9XXAGlg.png)

## 📊 Database Architecture

### Model Mongoose

1. #### Pengguna (`User.js`)
    Menangani akun pengguna, detail autentikasi, dan yang terpenting menentukan kategori konten yang dapat diakses berdasarkan usia.
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
---
2. #### Media (`Media.js`)
    Mewakili item yang dapat dilacak seperti Movie atau Book, termasuk batasan usianya.
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
---
3. #### Billboard (`Billboard.js`)
    Menyimpan data peringkat dan rating mingguan, bulan, dan tahun yang diagregasi.
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

Backend menyediakan API RESTful. Dengan ***endpoint key*** sebagai berikut:

### 🔐 Auth Routes (/api/auth)
*   `POST /register` — Mendaftarkan pengguna baru.
*   `POST /login` — Login pengguna yang sudah ada, mengembalikan JWT.
*   `GET /profile` — Mendapatkan profil pengguna yang sedang login saat ini (Memerlukan Autentikasi).
---
### 🎞️ Media Routes (/api/media)
*   `POST /` — Membuat media baru (Memerlukan Autentikasi, kategori usia pengguna membatasi `ageCategory` yang diizinkan untuk media).
*   `GET /` — Mendapatkan daftar media. Menyaring hasil berdasarkan `allowedCategories` pengguna yang login. Guest hanya dapat melihat media 'kids'.
*   `GET /:id` — Mendapatkan detail media spesifik (Memerlukan Autentikasi, memeriksa apakah `ageCategory` media berada dalam `allowedCategories` pengguna).
*   `PUT /:id` — Memperbarui media (Memerlukan Autentikasi, pengguna harus memiliki izin untuk `ageCategory` media).
*   `DELETE /:id` — Menghapus media (Memerlukan Autentikasi, pengguna harus memiliki izin untuk `ageCategory` media).
---
### 📊 Billboard Routes (/api/billboard)
*   `GET /weekly` — Mendapatkan peringkat billboard mingguan saat ini (Dapat diakses publik, menggunakan agregasi).
---
### 🎟️ Ticket & Venue Routes (Potential - /api/tickets, /api/venues)
*   Endpoint untuk membuat/melihat tiket dan venue kemungkinan akan ada di sini, memerlukan autentikasi untuk sebagian besar tindakan.

*(Catatan: Middleware autentikasi (`auth.js`) akan melindungi rute yang relevan dan memberlakukan kontrol akses berbasis usia.)*

## 🔑 Environment Variables

Menambahkan file **env** yaitu `.env` di direktori `server/` dengan variabel sebagai berikut:

```bash
# Konfigurasi Server
PORT=5000             # Atau port lain yang diinginkan
NODE_ENV=development  # \'production\' untuk deployment

# Konfigurasi Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority # String koneksi MongoDB Anda

# Autentikasi (JWT)
JWT_SECRET=KUNCI_RAHASIA_HARAP_DIGANTI # Kunci rahasia (JWT Token) 
JWT_EXPIRES_IN=1d                      # Kedaluwarsa token (misalnya, 1d, 7d, 1h)
```
---
Menambahkan **JWT Token** pada `.env` sebagai berikut:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Jalankan pada terminal dan kemudian copy untuk dimasukkan ke .env
```

## 🐳 Docker Deployment

Menambahkan `Dockerfile` untuk mengkontainerisasi aplikasi *backend* dan *frontend* seperti berikut:

### 1. Struktur
```
Implementation-NoSQL/
├── docker-compose.yml           // Orchestration
├── client/
│   ├── Dockerfile              // Frontend container
│   ├── nginx.conf              // Web server config
│   └── src/App.jsx             // React app
└── server/
    ├── Dockerfile              // Backend container
    ├── init-mongo.js           // Database init
    └── [backend files]         // Node.js API
```

### 2. Client (Frontend)

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```
### 3. Server (Backend)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
```

## 🤝 Contributing

Kontribusi kamu sangat diterima! Silakan ikuti langkah-langkah berikut:

1.  *Fork* repositori.
2.  Buat *branch* fitur kamu (`git checkout -b feature/NewFeature`).
3.  *Commit* perubahan kamu (`git commit -m 'Tambah Fitur Baru'`).
4.  Push ke *branch* (`git push origin feature/NewFeature`).
5.  Buka *Pull Request*.

---
<div align="center">
⭐Dibuat dengan MERN oleh Kelompok 14 - Sistem Basis Data kelas 01⭐
</div>

