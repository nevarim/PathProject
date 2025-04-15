const express = require('express');
const router = express.Router();
const Chatlogs = require('../models/Chatlogs');
const User = require('../models/User'); // Importa il modello User
const Room = require('../models/Room'); // Importa il modello Room


// Recupera tutti i messaggi di una stanza
router.get('/:roomId', async (req, res) => {
    const roomId = req.params.roomId;

    try {
        const messages = await Chatlogs.findAll({
            where: { roomId },
            order: [['createdAt', 'ASC']], // Ordina per data
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Errore durante il recupero dei messaggi:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});


// Crea un nuovo messaggio di chat
router.post('/', async (req, res) => {
    const { roomId, userId, message } = req.body;

    if (!roomId || !userId || !message) {
        return res.status(400).json({ error: 'Parametri mancanti.' });
    }

    try {
        // Verifica se la stanza esiste
        const roomExists = await Room.findByPk(roomId);
        if (!roomExists) {
            return res.status(400).json({ error: 'La stanza specificata non esiste.' });
        }

        // Verifica se l'utente esiste
        const userExists = await User.findByPk(userId);
        if (!userExists) {
            return res.status(400).json({ error: 'L\'utente specificato non esiste.' });
        }

        // Crea il nuovo messaggio
        const newMessage = await Chatlogs.create({ roomId, userId, message });
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Errore durante la creazione del messaggio:', error);
        res.status(500).json({ error: 'Errore interno al server.' });
    }
});

module.exports = router;








