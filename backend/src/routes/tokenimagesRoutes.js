const express = require('express');
const router = express.Router();
const TokenImage = require('../models/TokenImage');
const TokenCategory = require('../models/TokenCategory'); // Importa il modello delle categorie
const { authenticate } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

require('dotenv').config(); // Carica le variabili d'ambiente
const BASE_URL = `http://${process.env.HOSTIP}:${process.env.PORT}/images/`;
console.log(`BASE_URL configurato: ${BASE_URL}`);




// Funzione per rimuovere caratteri speciali dal nome
const sanitizeName = (name) => {
    return name.replace(/[^a-zA-Z0-9]/g, '-'); // Sostituisce caratteri non alfanumerici con '-'
};




// **1. Creazione di una nuova categoria**
router.post('/categories', authenticate, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Il nome della categoria è obbligatorio.' });
        }

        const existingCategory = await TokenCategory.findOne({ where: { name } });
        if (existingCategory) {
            return res.status(400).json({ error: 'La categoria esiste già.' });
        }

        const category = await TokenCategory.create({ name });
        res.status(201).json({ message: 'Categoria creata con successo!', category });
    } catch (error) {
        console.error('Errore durante la creazione della categoria:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

// **2. Recupera tutte le categorie**
router.get('/categories', authenticate, async (req, res) => {
    try {
        const categories = await TokenCategory.findAll();
        res.status(200).json({ message: 'Categorie recuperate con successo!', categories });
    } catch (error) {
        console.error('Errore durante il recupero delle categorie:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

// **3. Aggiorna una categoria esistente**
router.put('/categories/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await TokenCategory.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Categoria non trovata.' });
        }

        if (name) category.name = name;
        await category.save();

        res.status(200).json({ message: 'Categoria aggiornata con successo!', category });
    } catch (error) {
        console.error('Errore durante l\'aggiornamento della categoria:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

// **4. Elimina una categoria**
router.delete('/categories/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const category = await TokenCategory.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Categoria non trovata.' });
        }

        await category.destroy();
        res.status(200).json({ message: 'Categoria eliminata con successo.' });
    } catch (error) {
        console.error('Errore durante l\'eliminazione della categoria:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

// **5. Recupera i token di una categoria specifica**
router.get('/categories/:id/tokens', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const category = await TokenCategory.findByPk(id, {
            include: [
                { model: TokenImage, as: 'tokens', attributes: ['id', 'name', 'url'] },
            ],
        });

        if (!category) {
            return res.status(404).json({ error: 'Categoria non trovata.' });
        }

        res.status(200).json({
            message: 'Token associati alla categoria recuperati con successo!',
            tokens: category.tokens,
        });
    } catch (error) {
        console.error('Errore durante il recupero dei token della categoria:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

router.get('/categories/:categoryId/users/:userId/tokens', authenticate, async (req, res) => {
    try {
        const { categoryId, userId } = req.params;

        const category = await TokenCategory.findByPk(categoryId, {
            include: [
                {
                    model: TokenImage,
                    as: 'tokens',
                    where: { userId }, // Filtra per ID utente
                    attributes: ['id', 'name', 'url'],
                },
            ],
        });

        if (!category) {
            return res.status(404).json({ error: 'Categoria non trovata.' });
        }

        const tokens = category.tokens;

        if (!tokens || tokens.length === 0) {
            return res.status(404).json({ error: 'Nessun token trovato per questa categoria e utente.' });
        }

        res.status(200).json({
            message: 'Token associati alla categoria e all\'utente recuperati con successo!',
            tokens,
        });
    } catch (error) {
        console.error('Errore durante il recupero dei token per categoria e utente:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userFolder = path.join('images/tokens', `${req.user.id}`);
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true }); // Crea la cartella se non esiste
        }
        cb(null, userFolder);
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname).toLowerCase(); // Mantieni l'estensione
        const uniqueFileName = `${Date.now()}-${sanitizeName(file.originalname.split('.')[0])}${fileExtension}`; // Nome temporaneo
        cb(null, uniqueFileName);
    },
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
    },
});

// **1. Caricamento singolo del token**
router.post('/upload', authenticate, upload.single('tokenImage'), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !req.file) {
            return res.status(400).json({ error: 'Nome del token o immagine mancante.' });
        }

        const fileExtension = path.extname(req.file.filename);
        const uniqueFileName = `${Date.now()}-${sanitizeName(name)}${fileExtension}`;
        const originalPath = path.join('images/tokens', `${req.user.id}`, req.file.filename);
        const resizedPath = path.join('images/tokens', `${req.user.id}`, uniqueFileName);

        // Ridimensiona l'immagine
        await sharp(originalPath)
            .resize(300, 300, { fit: 'inside' })
            .toFile(resizedPath);

        // Rimuovi l'immagine originale
        fs.unlinkSync(originalPath);

        // Salva il percorso relativo nel database
        const relativePath = `images/tokens/${req.user.id}/${uniqueFileName}`;
        const newToken = await TokenImage.create({ userId: req.user.id, url: relativePath, name: sanitizeName(name) });

        res.status(201).json({ message: 'Token caricato con successo!', token: newToken });
    } catch (error) {
        console.error('Errore durante il caricamento del token:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

// **2. Caricamento multiplo di token**
router.post('/upload-multiple', authenticate, upload.array('tokenImages', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Immagini mancanti.' });
        }

        const createdTokens = [];

        for (let file of req.files) {
            const originalPath = path.join('images/tokens', `${req.user.id}`, file.filename);
            const fileExtension = path.extname(file.filename);
            const uniqueFileName = `${Date.now()}-${sanitizeName(file.originalname.split('.')[0])}${fileExtension}`;
            const resizedPath = path.join('images/tokens', `${req.user.id}`, uniqueFileName);

            await sharp(originalPath)
                .resize(300, 300, { fit: 'inside' })
                .toFile(resizedPath);

            fs.unlinkSync(originalPath);

            const relativePath = `images/tokens/${req.user.id}/${uniqueFileName}`;
            const newToken = await TokenImage.create({
                userId: req.user.id,
                url: relativePath,
                name: `Temporary-${Date.now()}`
            });

            createdTokens.push(newToken);
        }

        res.status(201).json({ message: 'Token multipli caricati con successo!', tokens: createdTokens });
    } catch (error) {
        console.error('Errore durante il caricamento multiplo dei token:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

// **3. Modifica del nome del token**
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const token = await TokenImage.findOne({ where: { id, userId: req.user.id } });
        if (!token) {
            return res.status(404).json({ error: 'Token non trovato.' });
        }

        // Modifica: Usa direttamente il percorso salvato nel database senza duplicare "images/"
        const oldPath = path.join(token.url); // Percorso originale
        const fileExtension = path.extname(oldPath);
        const newFileName = `${id}-${sanitizeName(name)}${fileExtension}`;
        const newPath = path.join('images/tokens', `${req.user.id}`, newFileName);

        // Rinomina il file nel filesystem
        fs.renameSync(oldPath, newPath);

        // Aggiorna i valori nel database
        token.url = `images/tokens/${req.user.id}/${newFileName}`;
        token.name = sanitizeName(name);

        await token.save();

        res.status(200).json({ 
            message: 'Nome del token aggiornato con successo.', 
            token 
        });
    } catch (error) {
        console.error('Errore durante la modifica del nome del token:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

// **4. Ottenere la lista dei token dell'utente**
router.get('/user-tokens', authenticate, async (req, res) => {
    try {
        const tokens = await TokenImage.findAll({ where: { userId: req.user.id } });
        res.status(200).json(tokens);
    } catch (error) {
        console.error('Errore durante il recupero dei token:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

// **5. Ottenere informazioni su un token specifico**
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const token = await TokenImage.findOne({ where: { id, userId: req.user.id } });

        if (!token) {
            return res.status(404).json({ error: 'Token non trovato.' });
        }

        res.status(200).json(token);
    } catch (error) {
        console.error('Errore durante il recupero delle informazioni del token:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

// **6. Cancellazione di un token**
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const token = await TokenImage.findOne({ where: { id, userId: req.user.id } });
        if (!token) {
            return res.status(404).json({ error: 'Token non trovato.' });
        }

        const filePath = path.join('images', token.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await token.destroy();
        res.status(200).json({ message: 'Token eliminato con successo.' });
    } catch (error) {
        console.error('Errore durante l\'eliminazione del token:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

// **7. Contare il numero totale di token di un utente**
router.get('/count', authenticate, async (req, res) => {
    try {
        const tokenCount = await TokenImage.count({ where: { userId: req.user.id } });
        res.status(200).json({ count: tokenCount });
    } catch (error) {
        console.error('Errore durante il conteggio dei token:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});



// **Assegna una categoria a un token**
router.put('/:id/assign-category', authenticate, async (req, res) => {
    try {
        const { id } = req.params; // ID del token
        const { categoryId } = req.body; // ID della categoria da assegnare

        const token = await TokenImage.findOne({ where: { id, userId: req.user.id } });
        if (!token) {
            return res.status(404).json({ error: 'Token non trovato.' });
        }

        const category = await TokenCategory.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Categoria non trovata.' });
        }

        // Aggiorna il token con la categoria assegnata
        token.categoryId = categoryId;
        await token.save();

        res.status(200).json({
            message: 'Categoria assegnata al token con successo.',
            token,
        });
    } catch (error) {
        console.error('Errore durante l\'assegnazione della categoria al token:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});



module.exports = router;