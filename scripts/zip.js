const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const srcDir = process.argv[2] || 'static';
const outZip = process.argv[3] || 'MikrotixUI.zip';

(async function main() {
    try {
        const srcPath = path.resolve(srcDir);
        const outPath = path.resolve(outZip);

        if (!fs.existsSync(srcPath)) {
            console.error(`Error: sumber folder tidak ditemukan: ${srcPath}`);
            process.exit(2);
        }

        // Jika file zip sudah ada -> hapus (overwrite)
        if (fs.existsSync(outPath)) {
            try {
                fs.unlinkSync(outPath);
                console.log(`Info: file zip lama dihapus: ${outPath}`);
            } catch (e) {
                console.error(
                    `Error menghapus file zip lama (${outPath}):`,
                    e.message,
                );
                process.exit(3);
            }
        }

        // Buat write stream untuk output zip
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', function () {
            console.log(
                `Sukses: ${outPath} dibuat (${archive.pointer()} total bytes)`,
            );
        });

        output.on('end', function () {
            console.log('Data drained');
        });

        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                console.warn('Warning archiver:', err.message);
            } else {
                throw err;
            }
        });

        archive.on('error', function (err) {
            throw err;
        });

        archive.pipe(output);

        // Tambahkan isi folder (tanpa root folder) agar konten berada di root zip
        archive.directory(srcPath, false);

        await archive.finalize();
    } catch (err) {
        console.error(
            'Compress gagal:',
            err && err.message ? err.message : err,
        );
        process.exit(1);
    }
})();
