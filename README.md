## MikrotixUI - MAHMETT

<center>

![Banner](https://github.com/MAHMETT/mikrotix-ui/blob/main/static/assets/images/Banner.webp)

</center>
<center>
<a href="https://github.com/MAHMETT/mikrotix-ui/blob/main/build/Mikrotix-UI.zip" download style="display:inline-block;background:#15B0FE;color:#fff;font-weight: bold;padding:0.75rem;border-radius:0.75rem;text-decoration:none;">
  Download File
</a>
</center>

---

<details>
<summary>🇮🇩 Bahasa Indonesian</summary>

### Deskripsi singkat

Project ini adalah template untuk hotspot di mikrotik , menggunakan bahasa pemrograman dasara sederhana (HTML, CSS, JS). Project ini dirancang supaya mudah dikembangkan dan kamu dapat fork repository ini dan melakukan perubahan dan pull ke repository ini untuk meminta perubahan, rapi strukturnya, dan mudah dideploy ke server statis.

### Fitur utama

- Struktur file sederhana & modular
- Header / Footer global (inject via `global.js`)
- Build & Dev
- Formatting otomatis (Prettier)

### Struktur direktori

```
static

├─ assets/
│     ├─ favicon.js
│     └─ images/
├─ src/
│  ├─ js/
│  │  ├─ global.js
│  │  └─ jquery/
│  │      └─ global.js
│  └─ css/
│     └─ styles.css
├─ *.html       # Page
└─ md5.js
```

### Persyaratan

- Node.js (opsional, untuk workflow dev/build)
- Browser modern/old (untuk produksi HTML/CSS/JS murni)

---

### Cara pakai (Run / Usage)

#### A. Tanpa Node (static)

1. Buka `login.html` di browser.
   - Untuk hasil terbaik gunakan server lokal (bukan `file://`) , bisa menggunakan extension VSCODE yaitu LiveServer.

#### B. Dengan Node (recommended untuk development dan build)

1. Install dependensi:

```bash
# npm
npm install

# pnpm
pnpm install
```

1. Jalankan mode development:

```bash
# npmu
npm run dev

# pnpm
pnpm run dev

# -> buka http://127.0.0.1:8080 (atau alamat yang ditampilkan)
```

3. Build untuk produksi:

```bash
# npm
npm run build

# pnpm
pnpm run build
```

Bisa dicompress ke zip ( lokasi: build/\*.zip ) lalu di ekstrak kemudian bisa diaplikasikan ke mikrotiknya

```bash
# npm
npm run compress

# pnpm
pnpm run compress
```

---

### Pengembangan & Kontribusi

1. Fork → branch fitur (`feature/your-name`) → commit → PR.
2. Ikuti gaya kode: jalankan `npm run format` sebelum commit.
3. Bila menambahkan dependency baru, update `README` & `package.json`.

---

### Troubleshooting (masalah umum)

- `global.js` tidak melakukan inject header/footer:
  - Pastikan `global.js` dimuat setelah DOM (`defer` atau sebelum `</body>`).
  - Cek `console` di DevTools untuk error.
  - Jika template memakai placeholder MikroTik `$(...)`, jangan masukkan placeholder ke `global.js` eksternal — inject melalui inline bootstrap di HTML (mis. `window.SHELL = {...}`).

- CHAP / MikroTik captive-portal:
  - Pastikan `md5.js` dimuat sebelum kode yang memanggil `hexMD5`.
  - Pastikan form `name="login"` & hidden `name="sendin"` ada.

---

### Lisensi

- Lisensi: MIT

---

</details>

<details>

<summary>🇬🇧 English Leanguage </summary>

### Brief description

This project is a template for hotspots on Mikrotik, using simple basic programming languages (HTML, CSS, JS). This project is designed to be easy to develop. You can fork this repository, make changes, and pull them into this repository to request changes. It has a neat structure and is easy to deploy to a static server.

### Key Features

- Simple & modular file structure
- Global header/footer (injected via `global.js`)
- Build & Dev
- Automatic formatting (Prettier)

### Directory Structure

```
/
├─ index.html
├─ about.html
├─ src/
│  ├─ js/
│  │  ├─ global.js
│  │  └─ main.js
│  ├─ css/
│  │  └─ styles.css
│  └─ assets/
│     └─ images/
├─ includes/          # (optional) header/footer for fetch()
├─ public/            # build output (if any)
├─ package.json
├─ .prettierrc
└─ README.md
```

### Requirements

- Node.js (optional, for dev/build workflow)
- Modern/old browser (for pure HTML/CSS/JS production)

---

### How to use (Run / Usage)

#### A. Without Node (static)

1. Open `login.html` in your browser.
   - For best results, use a local server (not `file://`) , you can use the VSCODE extension LiveServer.

#### B. With Node (recommended for development and build)

1. Install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install
```

1. Run development mode:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# -> open http://127.0.0.1:8080 (or the address displayed)
```

3. Build for production:

```bash
# npm
npm run build

# pnpm
pnpm run build
```

Can be compressed into a zip file (location: build/\*.zip), then extracted and applied to the Mikrotik

```bash
# npm
npm run compress

# pnpm
pnpm run compress
```

---

### Development & Contributions

1. Fork → feature branch (`feature/your-name`) → commit → PR.
2. Follow coding style: run `npm run format` before committing.
3. When adding new dependencies, update `README` & `package.json`.

---

### Troubleshooting (common issues)

- `global.js` does not inject header/footer:
  - Ensure `global.js` is loaded after the DOM (`defer` or before `</body>`).
  - Check the `console` in DevTools for errors.
  - If the template uses MikroTik placeholders `$(...)`, do not include placeholders in external `global.js` — inject them via inline bootstrap in HTML (e.g., `window.SHELL = {...}`).

- CHAP / MikroTik captive-portal:
  - Ensure `md5.js` is loaded before the code that calls `hexMD5`.
  - Ensure the `name=“login”` form & hidden `name=“sendin”` exist.

---

### License

- License: MIT
  </details>
