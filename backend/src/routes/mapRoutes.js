const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // Middleware per il caricamento file
const { authenticate } = require('../middlewares/auth'); // Middleware per autenticazione
const Map = require('../models/Map'); // Modello Sequelize per la tabella Maps
const fs = require('fs');
const path = require('path');

// Utility per creare directory, se non esistono
function ensureDirectoryExistence(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// **Caricamento delle mappe con informazioni JSON**
// **Caricamento o aggiornamento di una mappa**
router.post('/map/upload', authenticate, upload.single('map'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nessun file caricato.' });
        }

        const { name, description, roomId, mapSize, gridSize } = req.body;
        if (!name || !description || !roomId) {
            return res.status(400).json({ error: 'Il nome, la descrizione e il roomId della mappa sono obbligatori.' });
        }

        const userId = req.user.id;
        const ext = path.extname(req.file.originalname); // Estrai l'estensione del file
        const mapPath = `images/maps/${userId}/${roomId}/${name}${ext}`; // Percorso del file della mappa

        // Assicurati che la directory esista
        ensureDirectoryExistence(mapPath);

        // Controlla se la mappa esiste già per l'utente e la stanza
        const existingMap = await Map.findOne({
            where: {
                userId,
                roomId,
                name,
            },
        });

        if (existingMap) {
            // Se la mappa esiste, aggiorna il file e il record nel database
            const oldPath = existingMap.filePath;

            // Cancella il vecchio file, se diverso dal nuovo
            if (fs.existsSync(oldPath) && oldPath !== mapPath) {
                fs.unlinkSync(oldPath);
            }

            // Sposta il nuovo file nella posizione corretta
            fs.renameSync(req.file.path, mapPath);

            // Aggiorna il record nel database
            existingMap.filePath = mapPath;
            existingMap.description = description;
            existingMap.mapSize = mapSize;
            existingMap.gridSize = gridSize;
            await existingMap.save();

            return res.status(200).json({
                message: 'Mappa aggiornata con successo!',
                map: existingMap,
            });
        }

        // Se la mappa non esiste, crea una nuova
        fs.renameSync(req.file.path, mapPath);

        const newMap = await Map.create({
            userId,
            roomId,
            filePath: mapPath,
            name,
            description,
            isVisibleToPlayers: true,
            mapSize,
            gridSize,
        });

        res.status(201).json({
            message: 'Mappa caricata e registrata con successo!',
            map: newMap,
        });
    } catch (err) {
        console.error('Errore durante il salvataggio della mappa:', err.message);
        res.status(500).json({ error: 'Errore durante il caricamento della mappa.', details: err.message });
    }
});

// **Lista delle mappe caricate dall'utente**
router.get('/map/list/:roomId', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const roomId = req.params.roomId; // ID della stanza

        const maps = await Map.findAll({
            where: { userId, roomId },
            attributes: ['id', 'filePath', 'name', 'description', 'mapSize', 'gridSize', 'isVisibleToPlayers', 'createdAt', 'updatedAt'],
        });

        if (maps.length === 0) {
            return res.status(404).json({ message: 'Nessuna mappa trovata per questa stanza.' });
        }

        // Converte i percorsi assoluti dei file in URL relativi
        const mapsWithRelativeUrls = maps.map((map) => ({
            ...map.dataValues,
            filePath: path.relative('public', map.filePath).replace(/\\/g, '/'), // Percorso relativo alla cartella pubblica
        }));

        res.status(200).json({
            message: 'Elenco delle mappe recuperato con successo!',
            maps: mapsWithRelativeUrls,
        });
    } catch (err) {
        console.error('Errore durante il recupero delle mappe:', err.message);
        res.status(500).json({ error: 'Errore durante il recupero delle mappe.', details: err.message });
    }
});

// **Visualizza le informazioni di una mappa dato il suo ID**
router.get('/map/:mapId', authenticate, async (req, res) => {
    try {
        const { mapId } = req.params;

        const map = await Map.findByPk(mapId, {
            attributes: ['id', 'userId', 'roomId', 'filePath', 'name', 'description', 'mapSize', 'gridSize', 'isVisibleToPlayers', 'createdAt', 'updatedAt'],
        });

        if (!map) {
            return res.status(404).json({ message: 'Mappa non trovata.' });
        }

        res.status(200).json({ 
            message: 'Informazioni della mappa recuperate con successo!', 
            map 
        });
    } catch (err) {
        console.error('Errore durante il recupero delle informazioni della mappa:', err.message);
        res.status(500).json({ error: 'Errore durante il recupero della mappa.', details: err.message });
    }
});

// **Modifica le informazioni di una mappa dato il suo ID**
router.put('/map/:mapId', authenticate, async (req, res) => {
    try {
        const { mapId } = req.params;
        const { name, description, mapSize, gridSize, isVisibleToPlayers } = req.body;

        const map = await Map.findByPk(mapId);

        if (!map) {
            return res.status(404).json({ message: 'Mappa non trovata.' });
        }

        // Aggiorna le informazioni della mappa
        if (name) map.name = name;
        if (description) map.description = description;
        if (mapSize) map.mapSize = mapSize;
        if (gridSize) map.gridSize = gridSize;
        if (isVisibleToPlayers !== undefined) map.isVisibleToPlayers = isVisibleToPlayers;

        await map.save();

        res.status(200).json({ 
            message: 'Mappa aggiornata con successo!', 
            map 
        });
    } catch (err) {
        console.error('Errore durante la modifica delle informazioni della mappa:', err.message);
        res.status(500).json({ error: 'Errore durante la modifica della mappa.', details: err.message });
    }
});


// **Cancellazione di una mappa**
router.delete('/map/:mapName', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { roomId } = req.body;
        const mapPath = `images/maps/${userId}/${roomId}/${req.params.mapName}`;

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

// **Annotazioni sulla mappa**
router.post('/map/annotate', authenticate, async (req, res) => {
    try {
        const { mapName, annotations, roomId } = req.body;
        if (!mapName || !annotations || !roomId) {
            return res.status(400).json({ error: 'Dati incompleti. Fornisci mapName, annotations e roomId.' });
        }

        const annotationPath = `images/maps/${req.user.id}/${roomId}/${mapName}-annotations.json`;
        ensureDirectoryExistence(annotationPath);
        fs.writeFileSync(annotationPath, JSON.stringify(annotations));

        res.status(200).json({ message: 'Annotazioni salvate con successo!', annotationPath });
    } catch (err) {
        res.status(500).json({ error: 'Errore durante il salvataggio delle annotazioni.', details: err.message });
    }
});

// **Recupero delle annotazioni**
router.get('/map/annotations/:roomId/:mapName', authenticate, async (req, res) => {
    try {
        const annotationPath = `images/maps/${req.user.id}/${req.params.roomId}/${req.params.mapName}-annotations.json`;

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

// Aggiungi altre rotte necessarie come per il Fog of War, gestione dei token, ecc.

// Esportazione del router
module.exports = router;