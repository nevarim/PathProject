//diceroutes.js
const express = require('express');
const router = express.Router();
const rollDice = require('../utils/diceRoll');
const { authenticate } = require('../middlewares/auth');

router.post('/roll', authenticate, (req, res) => {
    try {
        const { sides, times } = req.body; // Esempio: { sides: 20, times: 2 }
        if (!sides || sides < 1) {
            return res.status(400).json({ error: 'Specificare il numero di facce del dado (es. d20).' });
        }
        const result = rollDice(sides, times);
        res.status(200).json({ message: 'Tiro di dado eseguito con successo.', result });
    } catch (err) {
        res.status(500).json({ error: 'Errore durante il tiro dei dadi.', details: err.message });
    }
});

module.exports = router;