const express = require('express');
const path = require('path');
require('dotenv').config(); // Carica le variabili d'ambiente dal file .env

const app = express();

// Middleware per servire file statici (CSS, JS, immagini)
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images'))); // Sezione immagini statica

// Configurazione EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rotta per la pagina Game Room
app.get('/game', (req, res) => {
    const roomId = req.query.roomid; // Recupera roomid dalla query string
    const userId = req.query.userid; // Recupera userid dalla query string

    if (!roomId || !userId) {
        console.error('⚠ Parametri mancanti: roomid o userid.');
        return res.status(400).send('Errore: mancano roomid o userid.');
    }

    res.render('game', {
        title: `Game Room - Room ${roomId}`, // Passa un titolo dinamico
        roomId, // Passa l'ID stanza al template
        userId, // Passa l'ID utente al template
    });
});

// Rotta per la homepage
app.get('/', (req, res) => {
    res.render('index', {
        user: null, // Passa informazioni utente, se disponibili
        backendURL: process.env.BACKEND_URL || 'http://localhost:3000', // URL dinamica per il backend
        projectName: process.env.REACT_APP_PROJECT_NAME || 'Default Project', // Nome progetto dinamico
    });
});

// Avvia il server
const PORT = process.env.PORT || 3001;
const HOSTIP = process.env.HOSTIP || 'localhost';
const HOSTPORT = process.env.HOSTPORT || 3000;

app.listen(PORT, () => {
    console.log(`✨ Server in esecuzione su http://${HOSTIP}:${PORT}`);
});