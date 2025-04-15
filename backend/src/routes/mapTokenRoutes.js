const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const MapToken = require('../models/mapToken');
const TokenImage = require('../models/TokenImage');
const Map = require('../models/Map');

// **Aggiungi un token a una mappa**
router.post('/:mapId/add-token', authenticate, async (req, res) => {
    try {
        const { mapId } = req.params;
        const { tokenId, x, y, width, height, isVisible } = req.body;

        const map = await Map.findByPk(mapId);
        if (!map) {
            return res.status(404).json({ error: 'Mappa non trovata.' });
        }

        const token = await TokenImage.findByPk(tokenId);
        if (!token) {
            return res.status(404).json({ error: 'Token non trovato.' });
        }

        const mapToken = await MapToken.create({
            mapId,
            tokenId,
            x,
            y,
            width,
            height,
            isVisible,
        });

        res.status(200).json({ message: 'Token aggiunto alla mappa con successo!', mapToken });
    } catch (err) {
        console.error('Errore durante l\'aggiunta del token:', err.message);
        res.status(500).json({ error: 'Errore durante l\'aggiunta del token.', details: err.message });
    }
});

// **Recupera tutti i token di una mappa**
router.get('/:mapId/tokens', authenticate, async (req, res) => {
    try {
        const { mapId } = req.params;

        const mapTokens = await MapToken.findAll({
            where: { mapId },
            include: [
                { model: TokenImage, as: 'token', attributes: ['id', 'url', 'name'] },
            ],
        });

        res.status(200).json({ message: 'Token recuperati con successo!', mapTokens });
    } catch (err) {
        console.error('Errore durante il recupero dei token:', err.message);
        res.status(500).json({ error: 'Errore durante il recupero dei token.', details: err.message });
    }
});

// **Sposta un token sulla griglia**
router.put('/:mapId/token/:mapTokenId/move', authenticate, async (req, res) => {
    try {
        const { mapTokenId } = req.params;
        const { x, y } = req.body;

        const mapToken = await MapToken.findByPk(mapTokenId);
        if (!mapToken) {
            return res.status(404).json({ error: 'Associazione token-mappa non trovata.' });
        }

        mapToken.x = x;
        mapToken.y = y;
        await mapToken.save();

        res.status(200).json({ message: 'Token spostato con successo!', mapToken });
    } catch (err) {
        console.error('Errore durante lo spostamento del token:', err.message);
        res.status(500).json({ error: 'Errore durante lo spostamento del token.', details: err.message });
    }
});

module.exports = router;