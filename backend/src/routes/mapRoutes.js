//maproutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // Middleware per il caricamento file
const { authenticate } = require('../middlewares/auth'); // Middleware per autenticazione
const Map = require('../models/Map'); // Modello Sequelize per la tabella Maps
const fs = require('fs');



// **Caricamento delle mappe con informazioni JSON**
router.post('/map/upload', authenticate, upload.single('map'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nessun file caricato.' });
        }

        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ error: 'Il nome e la descrizione della mappa sono obbligatori.' });
        }

        const userId = req.user.id;
        const filePath = `uploads/${req.file.filename}`;
        
        // Log dei dati da salvare
        console.log('Dati da salvare nel database:', { userId, filePath, name, description });

        // Salvataggio nel database
        const newMap = await Map.create({
            userId,
            filePath,
            name,
            description,
            isVisibleToPlayers: true,
        });

        res.status(200).json({
            message: 'Mappa caricata e registrata con successo!',
            filePath,
            map: newMap,
        });
    } catch (err) {
        console.error('Errore durante il salvataggio della mappa:', err.message);
        res.status(500).json({ error: 'Errore durante il caricamento della mappa.', details: err.message });
    }
});


// **Lista delle mappe caricate dall'utente**
router.get('/map/list', authenticate, async (req, res) => {
    try {
        const userId = req.user.id; // Recupera l'ID dell'utente autenticato

        // Recupera le mappe dal database associate all'utente
        const maps = await Map.findAll({
            where: { userId },
            attributes: ['id', 'filePath', 'name', 'description', 'isVisibleToPlayers', 'createdAt', 'updatedAt'], // Campi da includere nella risposta
        });

        // Controlla se l'utente non ha mappe
        if (maps.length === 0) {
            return res.status(404).json({ message: 'Nessuna mappa trovata per questo utente.' });
        }

        res.status(200).json({
            message: 'Elenco delle mappe recuperato con successo!',
            maps,
        });
    } catch (err) {
        console.error('Errore durante il recupero delle mappe:', err.message);
        res.status(500).json({ error: 'Errore durante il recupero delle mappe.', details: err.message });
    }
});
// **3. Cancellazione di una mappa**
router.delete('/map/:mapName', authenticate, async (req, res) => {
    try {
        const mapPath = `uploads/${req.params.mapName}`;

        if (fs.existsSync(mapPath)) {
            fs.unlinkSync(mapPath);
            res.status(200).json({ message: 'Mappa eliminata con successo!' });
        } else {
            res.status(404).json({ error: 'Mappa non trovata.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Errore durante l\'eliminazione della mappa.', details: err.message });
    }
});

// **4. Annotazioni sulla mappa**
router.post('/map/annotate', authenticate, async (req, res) => {
    try {
        const { mapName, annotations } = req.body;
        if (!mapName || !annotations) {
            return res.status(400).json({ error: 'Dati incompleti. Fornisci mapName e annotations.' });
        }

        const annotationPath = `uploads/${mapName}.json`;
        fs.writeFileSync(annotationPath, JSON.stringify(annotations));

        res.status(200).json({ message: 'Annotazioni salvate con successo!', annotationPath });
    } catch (err) {
        res.status(500).json({ error: 'Errore durante il salvataggio delle annotazioni.', details: err.message });
    }
});

// **5. Recupero delle annotazioni**
router.get('/map/annotations/:mapName', authenticate, async (req, res) => {
    try {
        const annotationPath = `uploads/${req.params.mapName}.json`;

        if (fs.existsSync(annotationPath)) {
            const annotations = JSON.parse(fs.readFileSync(annotationPath, 'utf-8'));
            res.status(200).json({ annotations });
        } else {
            res.status(404).json({ error: 'Annotazioni non trovate per questa mappa.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Errore durante il recupero delle annotazioni.', details: err.message });
    }
});

// **6. Fog of War**
router.post('/map/fog', authenticate, async (req, res) => {
    try {
        const { mapName, hiddenAreas } = req.body;
        if (!mapName || !hiddenAreas) {
            return res.status(400).json({ error: 'Dati incompleti. Fornisci mapName e hiddenAreas.' });
        }

        const fogPath = `uploads/${mapName}-fog.json`;
        fs.writeFileSync(fogPath, JSON.stringify({ hiddenAreas }));

        res.status(200).json({ message: 'Fog of War salvato con successo!', fogPath });
    } catch (err) {
        res.status(500).json({ error: 'Errore durante il salvataggio del Fog of War.', details: err.message });
    }
});

// **7. Recupero Fog of War**
router.get('/map/fog/:mapName', authenticate, async (req, res) => {
    try {
        const fogPath = `uploads/${req.params.mapName}-fog.json`;

        if (fs.existsSync(fogPath)) {
            const fogData = JSON.parse(fs.readFileSync(fogPath, 'utf-8'));
            res.status(200).json({ fog: fogData });
        } else {
            res.status(404).json({ error: 'Fog of War non trovato per questa mappa.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Errore durante il recupero del Fog of War.', details: err.message });
    }
});

// **8. Token sulla mappa**
router.post('/map/token', authenticate, async (req, res) => {
    try {
        const { mapName, tokens } = req.body;
        if (!mapName || !tokens) {
            return res.status(400).json({ error: 'Dati incompleti. Fornisci mapName e tokens.' });
        }

        const tokenPath = `uploads/${mapName}-tokens.json`;
        fs.writeFileSync(tokenPath, JSON.stringify(tokens));

        res.status(200).json({ message: 'Tokens salvati con successo!', tokenPath });
    } catch (err) {
        res.status(500).json({ error: 'Errore durante il salvataggio dei tokens.', details: err.message });
    }
});

// **9. Recupero dei token**
router.get('/map/token/:mapName', authenticate, async (req, res) => {
    try {
        const tokenPath = `uploads/${req.params.mapName}-tokens.json`;

        if (fs.existsSync(tokenPath)) {
            const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
            res.status(200).json({ tokens });
        } else {
            res.status(404).json({ error: 'Tokens non trovati per questa mappa.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Errore durante il recupero dei tokens.', details: err.message });
    }
});

// Esportazione del router
module.exports = router;








