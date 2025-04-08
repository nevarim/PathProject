const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs'); // Aggiunto per gestire file
const { authenticate } = require('../middlewares/auth');
const User = require('../models/User');

require('dotenv').config(); // Carica le variabili d'ambiente
const BASE_URL = `http://${process.env.HOSTIP}:${process.env.PORT}/images/`;
console.log(`BASE_URL configurato: ${BASE_URL}`);


const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const avatarFolder = path.join('images', 'avatars'); // Cartella avatar
        if (!fs.existsSync(avatarFolder)) {
            fs.mkdirSync(avatarFolder, { recursive: true }); // Crea la cartella se non esiste
        }
        cb(null, avatarFolder);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // Nome unico per il file
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite di 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Formato immagine non valido. Usa PNG o JPEG.'));
        }
    }
});

// **Rotta per registrazione utente**
router.post('/register', upload.single('avatar'), async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verifica se l'utente esiste già
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'L\'utente esiste già. Scegli un nome utente diverso.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let avatarPath = null;
        if (req.file) {
            const originalPath = path.join('images/avatars', req.file.filename);
            const resizedPath = path.join('images/avatars', `resized-${req.file.filename}`);
            await sharp(originalPath)
                .resize(300, 300, { fit: 'inside' }) // Ridimensiona a 300x300 massimo
                .toFile(resizedPath);
            avatarPath = path.join('avatars', `resized-${req.file.filename}`).replace(/\\/g, '/');
            fs.unlinkSync(originalPath); // Elimina il file originale
        }

        const user = await User.create({
            username,
            password: hashedPassword,
            avatar: avatarPath,
            isTemporary: true // Utente temporaneo
        });

        res.status(201).json({
            message: 'Utente registrato con successo!',
            user: {
                id: user.id,
                username: user.username,
                avatar: avatarPath ? `${BASE_URL}${avatarPath}` : null,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isTemporary: user.isTemporary,
            },
        });
    } catch (err) {
        console.error('Errore registrazione:', err);
        res.status(500).json({ error: 'Errore durante la registrazione.', details: err.message });
    }
});

// **Rotta per login**
router.post('/login', async (req, res) => {
    try {
        const { username, password, stayConnected } = req.body;

        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        if (user.isTemporary) {
            return res.status(403).json({ error: 'Utente non confermato. Completa la conferma via email per effettuare il login.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenziali non valide.' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            stayConnected ? {} : { expiresIn: '3h' }
        );

        if (stayConnected) {
            user.stayConnectedToken = token;
            await user.save();
        }

        // Costruisci l'URL completo per l'avatar
        const avatarUrl = user.avatar
            ? `http://${process.env.HOSTIP}:${process.env.PORT}/images/${user.avatar}`
            : `http://${process.env.HOSTIP}:${process.env.PORT}/images/avatars/default-avatar.png`;

        res.status(200).json({ 
            message: 'Login effettuato con successo.', 
            token, 
            avatarUrl // Restituisce l'URL funzionante dell'avatar
        });
    } catch (err) {
        console.error('Errore login:', err);
        res.status(500).json({ error: 'Errore durante il login.', details: err.message });
    }
});

// **Rotta per logout**
router.post('/logout', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        user.stayConnectedToken = null;
        await user.save();

        res.status(200).json({ message: 'Logout effettuato con successo.' });
    } catch (err) {
        console.error('Errore logout:', err);
        res.status(500).json({ error: 'Errore durante il logout.', details: err.message });
    }
});

// **Rotta per ottenere lo stato dell'utente tramite username**
router.get('/status/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        res.status(200).json({
            message: 'Status dell\'utente recuperato con successo.',
            user: {
                id: user.id,
                username: user.username,
                avatar: user.avatar ? `${BASE_URL}/images/${user.avatar}` : null,
                isTemporary: user.isTemporary,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (err) {
        console.error('Errore stato utente:', err);
        res.status(500).json({
            error: 'Errore durante il recupero dello stato dell\'utente.',
            details: err.message,
        });
    }
});

router.put('/update-avatar', authenticate, upload.single('avatar'), async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Nessun file fornito.' });
        }

        // Crea una sottocartella con l'ID dell'utente
        const userFolder = path.join('images/avatars', `${user.id}`);
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true }); // Crea la cartella se non esiste
        }

        // Percorso per il file ridimensionato (sovrascrive il file esistente se già presente)
        const resizedPath = path.join(userFolder, 'avatar-resized.png');

        // Ridimensiona e salva l'immagine
        await sharp(req.file.path)
            .resize(300, 300, { fit: 'inside' }) // Ridimensiona a 300x300
            .toFile(resizedPath);

        // Elimina il file originale dopo aver creato la versione ridimensionata
        fs.unlinkSync(req.file.path);

        // Salva il percorso relativo nel database
        const avatarPath = path.join('avatars', `${user.id}`, 'avatar-resized.png').replace(/\\/g, '/');
        user.avatar = avatarPath;
        await user.save();

        res.status(200).json({
            message: 'Avatar aggiornato con successo.',
            avatar: `${BASE_URL}${avatarPath}`, // URL completo dell'avatar
        });
    } catch (err) {
        console.error('Errore aggiornamento avatar:', err);
        res.status(500).json({
            error: 'Errore durante l\'aggiornamento dell\'avatar.',
            details: err.message,
        });
    }
});

// **Rotta per ottenere un token dato username**
router.post('/get-token', async (req, res) => {
    try {
        const { username } = req.body;

        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        if (user.stayConnectedToken) {
            return res.status(200).json({ message: 'Token generato con successo.', token: user.stayConnectedToken });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        res.status(200).json({ message: 'Token generato con successo.', token });
    } catch (err) {
        console.error('Errore generazione token:', err); // Debug
        res.status(500).json({ error: 'Errore durante la generazione del token.', details: err.message });
    }
});

module.exports = router;