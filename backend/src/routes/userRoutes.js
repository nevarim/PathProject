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


router.get('/userInfo/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Trova l'utente nel database
        const user = await User.findOne({ 
            where: { username }, 
            attributes: { 
                exclude: ['password'] // Escludi il campo "password"
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        // Costruisci la risposta con l'avatar completo
        const avatarUrl = user.avatar 
            ? `${BASE_URL}${user.avatar}` 
            : `${BASE_URL}avatars/default-avatar.png`;

        res.status(200).json({
            message: 'Informazioni utente recuperate con successo.',
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                avatar: avatarUrl,
                lastLogin: user.lastLogin,
                preferredLanguage: user.preferredLanguage,
                chatColor: user.chatColor,
                friendsList: user.friendsList || [],
                blockedUsers: user.blockedUsers || [],
                biography: user.biography,
                theme: user.theme,
                xp: user.xp,
                achievements: user.achievements || [],
                twoFactorEnabled: user.twoFactorEnabled,
                ipLog: user.ipLog || [],
                isBanned: user.isBanned,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (err) {
        console.error('Errore durante il recupero delle informazioni utente:', err);
        res.status(500).json({ 
            error: 'Errore durante il recupero delle informazioni utente.', 
            details: err.message 
        });
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
                avatar: user.avatar ? `${BASE_URL}${user.avatar}` : null, // Concatenazione corretta
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

// **Rotta per aggiornare il profilo dell'utente**
router.put('/update-profile/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params; // Recupera l'id dai parametri della richiesta
        const {
            username,
            displayName,
            biography,
            avatar,
            preferredLanguage,
            chatColor,
            theme
        } = req.body; // Parametri che possono essere aggiornati

        const user = await User.findByPk(id); // Recupera l'utente in base all'id
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        // Aggiorna i dettagli (tranne email e id)
        if (username) user.username = username;
        if (displayName) user.displayName = displayName;
        if (biography) user.biography = biography;
        if (avatar) user.avatar = avatar;
        if (preferredLanguage) user.preferredLanguage = preferredLanguage;
        if (chatColor) user.chatColor = chatColor;
        if (theme) user.theme = theme;

        await user.save();

        res.status(200).json({
            message: 'Profilo aggiornato con successo.',
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                biography: user.biography,
                avatar: user.avatar ? `${BASE_URL}${user.avatar}` : null,
                preferredLanguage: user.preferredLanguage,
                chatColor: user.chatColor,
                theme: user.theme,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
        });
    } catch (err) {
        console.error('Errore aggiornamento profilo:', err);
        res.status(500).json({
            error: 'Errore durante l\'aggiornamento del profilo.',
            details: err.message,
        });
    }
});

// **Rotta per cancellare l'account dell'utente**
router.delete('/delete', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        await user.destroy();

        res.status(200).json({ message: 'Account eliminato con successo.' });
    } catch (err) {
        console.error('Errore eliminazione account:', err);
        res.status(500).json({ error: 'Errore durante l\'eliminazione dell\'account.', details: err.message });
    }
});

// **Rotta per ottenere la lista amici**
router.get('/friends', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        res.status(200).json({ 
            message: 'Lista amici recuperata con successo.',
            friendsList: user.friendsList || [], 
        });
    } catch (err) {
        console.error('Errore recupero lista amici:', err);
        res.status(500).json({ error: 'Errore durante il recupero della lista amici.', details: err.message });
    }
});

// **Rotta per aggiornare il tema preferito**
router.put('/update-theme', authenticate, async (req, res) => {
    try {
        const { theme } = req.body;

        if (!['dark', 'light'].includes(theme)) {
            return res.status(400).json({ error: 'Tema non valido. Usa "dark" o "light".' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        user.theme = theme;
        await user.save();

        res.status(200).json({
            message: 'Tema aggiornato con successo.',
            theme: user.theme,
        });
    } catch (err) {
        console.error('Errore aggiornamento tema:', err);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento del tema.', details: err.message });
    }
});

// **Rotta per controllare se l'utente è bannato**
router.get('/is-banned', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        res.status(200).json({
            isBanned: user.isBanned,
            message: user.isBanned 
                ? 'L\'utente è bannato.' 
                : 'L\'utente non è bannato.',
        });
    } catch (err) {
        console.error('Errore controllo stato bannato:', err);
        res.status(500).json({ error: 'Errore durante il controllo dello stato bannato.', details: err.message });
    }
});





module.exports = router;