require('dotenv').config(); // Carica variabili d'ambiente
const express = require('express');
const cors = require('cors');
const http = require('http'); // Modulo HTTP
const socketIo = require('socket.io'); // Modulo Socket.IO
const sequelize = require('./config/database'); // Configurazione Database
const path = require('path'); // Modulo Path

const app = express();

// Recupera variabili dal file .env
const hostIp = process.env.HOSTIP; 
const port = process.env.PORT || 3000;
const frontPort = process.env.FRONTPORT || 3001;

// URL dinamici
const serverUrl = `http://${hostIp}:${port}`;
const frontUrl = `http://${hostIp}:${frontPort}`;

console.log(`Backend configurato su: ${serverUrl}`);
console.log(`Frontend configurato su: ${frontUrl}`);

// Configura CORS globalmente per Express
app.use(cors({
    origin: `http://${hostIp}:${frontPort}`, // Permetti richieste dal frontend
    methods: ['GET', 'POST'], // Metodi permessi
    allowedHeaders: ['Content-Type', 'Authorization'], // Intestazioni consentite
    credentials: true, // Permetti invio di cookie e credenziali
}));

// Configurazione EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// Rotta di test
app.get('/', (req, res) => {
    res.send('Backend funzionante!');
});

// Importa le rotte
const diceRoutes = require('./routes/diceRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const mapRoutes = require('./routes/mapRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Monta le rotte
app.use('/chat', chatRoutes);
app.use('/dice', diceRoutes);
app.use('/user', userRoutes);
app.use('/room', roomRoutes);
app.use(mapRoutes);

// Sincronizzazione del database
sequelize.sync({ force: false })
    .then(() => console.log('Database connesso e sincronizzato.'))
    .catch(err => console.error('Errore durante la connessione al database:', err));

// Crea il server HTTP
const server = http.createServer(app);

// Configura Socket.IO con CORS
const io = socketIo(server, {
    cors: {
        origin: `http://${hostIp}:${frontPort}`, // Permetti l'origine del frontend
        methods: ['GET', 'POST'], // Metodi permessi
    },
});

// Gestione WebSocket
io.on('connection', (socket) => {
    console.log(`Un utente si è connesso con ID socket: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Utente disconnesso con ID socket: ${socket.id}`);
    });

    socket.on('chatMessage', (data) => {
        console.log(`Messaggio ricevuto dal client ${socket.id}:`, data);
        io.emit('chatMessage', data); // Invia a tutti i client
    });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`Utente ${socket.id} si è unito alla stanza ${roomId}`);
    });

    socket.on('messageToRoom', (data) => {
        console.log(`Messaggio inviato nella stanza ${data.roomId}:`, data.message);
        io.to(data.roomId).emit('chatMessage', data); // Invia messaggi solo alla stanza specifica
    });
});

// Avvia il server
server.listen(port, () => {
    console.log(`Server in ascolto su ${serverUrl}`);
});