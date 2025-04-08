const multer = require('multer');
const path = require('path');

// Configura lo storage per i file caricati
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Cartella in cui salvare i file
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName); // Nome file unico
    }
});

// Configura Multer con filtro per i tipi di file supportati
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/; // Formati supportati (immagini)
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extname && mimeType) {
            cb(null, true); // File valido
        } else {
            cb(new Error('Solo immagini JPEG, JPG e PNG sono permesse.')); // File non supportato
        }
    }
});

module.exports = upload;