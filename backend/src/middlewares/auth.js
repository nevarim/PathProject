const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Ottieni il token dagli headers
        if (!token) {
            console.log('Errore: Token non fornito.'); // Debug
            return res.status(401).json({ error: 'Token non fornito.' });
        }

        // Verifica il token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificato:', decoded); // Debug

        // Trova l'utente associato
        const user = await User.findByPk(decoded.id); // Usa `decoded.id` per trovare l'utente
        console.log('Utente trovato:', user); // Debug

        if (!user) {
            console.log('Errore: Utente non trovato.'); // Debug
            return res.status(401).json({ error: 'Utente non trovato.' });
        }

        // Aggiorna il controllo sul token salvato nel database (se necessario)
        if (user.stayConnectedToken && user.stayConnectedToken !== token) {
            return res.status(401).json({ error: 'Token non valido o scaduto.' });
        }

        // Salva i dettagli dell'utente nella richiesta
        req.user = { id: user.id, username: user.username };
        console.log('Utente autenticato:', req.user); // Debug
        next(); // Passa al prossimo middleware o handler
    } catch (err) {
        console.error('Errore durante l\'autenticazione:', err.message); // Debug
        res.status(401).json({
            error: 'Autenticazione fallita.',
            details: err.message,
        });
    }
};

module.exports = { authenticate };