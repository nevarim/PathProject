const express = require('express');
const router = express.Router();
const multer = require('multer'); // Per gestire l'upload delle immagini
const path = require('path');
const sharp = require('sharp'); // Per ridimensionare le immagini
const fs = require('fs'); // Per gestire il filesystem
const { authenticate } = require('../middlewares/auth');
const Room = require('../models/Room');
const RoomUser = require('../models/RoomUser');
const User = require('../models/User');

Room.hasMany(RoomUser, { foreignKey: 'roomId' });
RoomUser.belongsTo(Room, { foreignKey: 'roomId' });
User.hasMany(RoomUser, { foreignKey: 'userId' });
RoomUser.belongsTo(User, { foreignKey: 'userId' });

require('dotenv').config(); // Assicurati di caricare le variabili d'ambiente

const hostIp = process.env.HOSTIP; // Ottieni l'IP del server dal file .env
const port = process.env.PORT;    // Ottieni la porta dal file .env
const BASE_URL = `http://${hostIp}:${port}/images/`; // Costruisci dinamicamente BASE_URL

console.log(`BASE_URL configurato: ${BASE_URL}`);


const storage = multer.diskStorage(
    {
    destination: (req, file, cb) => {
        const userFolder = path.join('images/covers', `${req.user.id}`); // Sottocartella basata sull'ID dell'utente
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true }); // Crea la cartella se non esiste
        }
        cb(null, userFolder); // Usa la sottocartella come destinazione
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname); // Estrai l'estensione del file
        const uniqueName = `${Date.now()}-${req.body.name}${fileExtension}`; // Nome unico basato sul nome della stanza
        cb(null, uniqueName);
    }
    }
);

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite: 5MB per i file
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Formato immagine non valido. Usa PNG o JPEG.'));
        }
    }
});

router.post('/', authenticate, upload.single('cover'), async (req, res) => {
    console.log('Richiesta per creare una stanza ricevuta.');

    try {
        const { name, description } = req.body;

        // Creazione iniziale della stanza senza immagini
        const room = await Room.create({
            name,
            description,
            cover: null, // Placeholder per il percorso ridimensionato
            originalCover: null, // Placeholder per il percorso originale
            createdBy: req.user.id, // ID creatore
        });

        // Percorsi iniziali
        let originalCoverPath = null;
        let resizedCoverPath = null;

        if (req.file) {
            const userFolder = path.join('images/covers', `${req.user.id}`); // Cartella utente
            if (!fs.existsSync(userFolder)) {
                fs.mkdirSync(userFolder, { recursive: true }); // Crea la cartella se non esiste
            }

            // Ottieni estensione del file
            const fileExtension = path.extname(req.file.originalname);

            // Rinomina i file con room.id
            const originalFileName = `${room.id}_room${fileExtension}`;
            const resizedFileName = `${room.id}_room_resized${fileExtension}`;
            const originalPath = path.join(userFolder, originalFileName);
            const resizedPath = path.join(userFolder, resizedFileName);

            // Salva immagine originale
            await sharp(req.file.path)
                .toFile(originalPath);

            // Ridimensiona e salva la versione ridotta
            await sharp(req.file.path)
                .resize(600, 400, { fit: 'inside' }) // Dimensioni più piccole per la cover ridimensionata
                .toFile(resizedPath);

            // Aggiorna i percorsi relativi
            originalCoverPath = path.join('covers', `${req.user.id}`, originalFileName).replace(/\\/g, '/');
            resizedCoverPath = path.join('covers', `${req.user.id}`, resizedFileName).replace(/\\/g, '/');

            // Elimina il file originale caricato
            fs.unlinkSync(req.file.path);

            // Aggiorna il record della stanza con i percorsi delle immagini
            room.originalCover = originalCoverPath;
            room.cover = resizedCoverPath;
            await room.save();
        }

        await RoomUser.create({
            roomId: room.id,
            userId: req.user.id,
            role: 'gm', // Ruolo: Game Master
        });

        res.status(201).json({
            message: 'Stanza creata con successo!',
            room: {
                id: room.id,
                name: room.name,
                description: room.description,
                originalCover: originalCoverPath ? `${BASE_URL}${originalCoverPath}` : null, // URL completo immagine originale
                cover: resizedCoverPath ? `${BASE_URL}${resizedCoverPath}` : null, // URL completo immagine ridimensionata
                createdBy: req.user.id,
                createdAt: room.createdAt,
                updatedAt: room.updatedAt,
            },
            user: req.user.username,
        });
    } catch (err) {
        console.error('Errore durante la creazione della stanza:', err);
        res.status(500).json({
            error: 'Errore durante la creazione della stanza.',
            details: err.message,
        });
    }
});

router.post('/:roomId/updatecover', authenticate, upload.single('cover'), async (req, res) => {
    console.log('Richiesta per aggiornare la cover ricevuta.');

    try {
        const { roomId } = req.params;

        const room = await Room.findByPk(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Stanza non trovata.' });
        }

        if (room.createdBy !== req.user.id) {
            return res.status(403).json({ error: 'Solo il creatore della stanza può aggiornare la cover.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Nessun file fornito.' });
        }

        const inputPath = path.join('images/covers', `${req.user.id}`, req.file.filename);
        const outputPath = path.join('images/covers', `${req.user.id}`, `resized-${req.file.filename}`);

        await sharp(inputPath)
            .resize(1800, 900, { fit: 'inside' }) // Ridimensiona l'immagine
            .toFile(outputPath);

        room.cover = path.join('covers', `${req.user.id}`, `resized-${req.file.filename}`).replace(/\\/g, '/'); // Percorso relativo con separatori corretti
        await room.save();

        res.status(200).json({
            message: 'Cover aggiornata con successo.',
            cover: `${BASE_URL}${room.cover}`, // URL completo della cover
        });
    } catch (err) {
        console.error('Errore durante l\'aggiornamento della cover:', err);
        res.status(500).json({
            error: 'Errore durante l\'aggiornamento della cover.',
            details: err.message,
        });
    }
});

// **Rotta per ottenere tutte le stanze di cui l'utente è GM**
router.get('/gm', authenticate, async (req, res) => {
    try {
        const gmRooms = await Room.findAll({
            where: { createdBy: req.user.id },
            attributes: ['id', 'name', 'description', 'cover', 'originalCover', 'createdBy', 'createdAt', 'updatedAt'],
        });

        const gmRoomsWithDetails = await Promise.all(
            gmRooms.map(async (room) => {
                const participants = await RoomUser.findAll({
                    where: { roomId: room.id },
                    include: {
                        model: User,
                        attributes: ['id', 'username'],
                    },
                    attributes: ['role'],
                });

                const formattedParticipants = participants.map((participant) => ({
                    id: participant.User.id,
                    username: participant.User.username,
                    role: participant.role,
                }));

                return {
                    ...room.toJSON(),
                    resizedCover: room.cover ? `${BASE_URL}${room.cover}` : null,
                    originalCover: room.originalCover ? `${BASE_URL}${room.originalCover}` : null,
                    participants: formattedParticipants,
                };
            })
        );

        res.status(200).json({
            message: 'Lista delle stanze di cui sei GM recuperata con successo.',
            rooms: gmRoomsWithDetails,
        });
    } catch (err) {
        console.error('Errore durante il recupero delle stanze GM:', err);
        res.status(500).json({
            error: 'Errore durante il recupero delle stanze GM.',
            details: err.message,
        });
    }
});

// **Rotta per ottenere tutte le stanze di cui l'utente è Player**
router.get('/player', authenticate, async (req, res) => {
    try {
        const playerRooms = await Room.findAll({
            include: {
                model: RoomUser,
                where: { userId: req.user.id, role: 'player' },
                attributes: [],
            },
            attributes: ['id', 'name', 'description', 'cover', 'originalCover', 'createdAt', 'updatedAt'],
        });

        const playerRoomsWithDetails = await Promise.all(
            playerRooms.map(async (room) => {
                const participants = await RoomUser.findAll({
                    where: { roomId: room.id },
                    include: {
                        model: User,
                        attributes: ['id', 'username'],
                    },
                    attributes: ['role'],
                });

                const formattedParticipants = participants.map((participant) => ({
                    id: participant.User.id,
                    username: participant.User.username,
                    role: participant.role,
                }));

                return {
                    ...room.toJSON(),
                    resizedCover: room.cover ? `${BASE_URL}${room.cover}` : null,
                    originalCover: room.originalCover ? `${BASE_URL}${room.originalCover}` : null,
                    participants: formattedParticipants,
                };
            })
        );

        res.status(200).json({
            message: 'Lista delle stanze di cui sei Player recuperata con successo.',
            rooms: playerRoomsWithDetails,
        });
    } catch (err) {
        console.error('Errore durante il recupero delle stanze Player:', err);
        res.status(500).json({
            error: 'Errore durante il recupero delle stanze Player.',
            details: err.message,
        });
    }
});


router.post('/:roomId/join', authenticate, async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findByPk(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Stanza non trovata.' });
        }

        const existingMembership = await RoomUser.findOne({
            where: { roomId, userId: req.user.id },
        });

        if (existingMembership) {
            return res.status(400).json({ error: 'Sei già membro di questa stanza.' });
        }

        await RoomUser.create({
            roomId,
            userId: req.user.id,
            role: 'player',
        });

        res.status(200).json({ message: 'Sei entrato nella stanza!', room });
    } catch (err) {
        console.error('Errore durante l\'accesso alla stanza:', err);
        res.status(500).json({ error: 'Errore durante l\'accesso alla stanza.', details: err.message });
    }
});

router.delete('/:roomId/leave', authenticate, async (req, res) => {
    try {
        const { roomId } = req.params;

        const membership = await RoomUser.findOne({
            where: { roomId, userId: req.user.id },
        });

        if (!membership) {
            return res.status(400).json({ error: 'Non sei membro di questa stanza.' });
        }

        if (membership.role !== 'player') {
            return res.status(403).json({ error: 'Solo i player possono uscire dalla stanza.' });
        }

        await membership.destroy();

        res.status(200).json({ message: 'Sei uscito dalla stanza con successo.' });
    } catch (err) {
        console.error('Errore durante l\'uscita dalla stanza:', err);
        res.status(500).json({ error: 'Errore durante l\'uscita dalla stanza.', details: err.message });
    }
});

router.delete('/:roomId/kick/:userId', authenticate, async (req, res) => {
    try {
        const { roomId, userId } = req.params;

        const room = await Room.findByPk(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Stanza non trovata.' });
        }

        if (room.createdBy !== req.user.id) {
            return res.status(403).json({ error: 'Solo il GM può espellere utenti da questa stanza.' });
        }

        const membership = await RoomUser.findOne({
            where: { roomId, userId },
        });

        if (!membership) {
            return res.status(400).json({ error: 'L\'utente non è membro di questa stanza.' });
        }

        if (membership.role !== 'player') {
            return res.status(403).json({ error: 'Puoi espellere solo i player dalla stanza.' });
        }

        await membership.destroy();

        res.status(200).json({ message: 'Utente espulso con successo.' });
    } catch (err) {
        console.error('Errore durante l\'espulsione dell\'utente:', err);
        res.status(500).json({
            error: 'Errore durante l\'espulsione dell\'utente.',
            details: err.message,
        });
    }
});

router.put('/:roomId/editRoom', authenticate, upload.single('cover'), async (req, res) => {
    console.log('Richiesta per modificare una stanza ricevuta.');

    try {
        const { roomId } = req.params;
        const { name, description } = req.body;

        const room = await Room.findByPk(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Stanza non trovata.' });
        }

        if (room.createdBy !== req.user.id) {
            return res.status(403).json({ error: 'Solo il creatore della stanza può modificarla.' });
        }

        let originalCoverPath = room.originalCover;
        let resizedCoverPath = room.cover;

        if (req.file) {
            const userFolder = path.join('images/covers', `${req.user.id}`);
            if (!fs.existsSync(userFolder)) {
                fs.mkdirSync(userFolder, { recursive: true });
            }

            const fileExtension = path.extname(req.file.originalname);
            const originalFileName = `${roomId}_room${fileExtension}`;
            const resizedFileName = `${roomId}_room_resized${fileExtension}`;
            const originalPath = path.join(userFolder, originalFileName);
            const resizedPath = path.join(userFolder, resizedFileName);

            await sharp(req.file.path).toFile(originalPath);
            await sharp(req.file.path)
                .resize(600, 400, { fit: 'inside' })
                .toFile(resizedPath);

            originalCoverPath = path.join('covers', `${req.user.id}`, originalFileName).replace(/\\/g, '/');
            resizedCoverPath = path.join('covers', `${req.user.id}`, resizedFileName).replace(/\\/g, '/');

            if (fs.existsSync(req.file.path)) {
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error(`Errore durante l'eliminazione del file: ${err.message}`);
                    } else {
                        console.log(`File eliminato con successo: ${req.file.path}`);
                    }
                });
            } else {
                console.warn(`File non trovato: ${req.file.path}`);
            }
        }

        room.name = name || room.name;
        room.description = description || room.description;
        room.originalCover = originalCoverPath;
        room.cover = resizedCoverPath;

        await room.save();

        res.status(200).json({
            message: 'Stanza modificata con successo!',
            room: {
                id: room.id,
                name: room.name,
                description: room.description,
                originalCover: `${BASE_URL}${originalCoverPath}`,
                resizedCover: `${BASE_URL}${resizedCoverPath}`,
                createdBy: room.createdBy,
                createdAt: room.createdAt,
                updatedAt: room.updatedAt,
            },
        });
    } catch (err) {
        console.error('Errore durante la modifica della stanza:', err);
        res.status(500).json({
            error: 'Errore durante la modifica della stanza.',
            details: err.message,
        });
    }
});

router.get('/:roomId/loadRoom', authenticate, async (req, res) => {
    console.log('Richiesta per caricare i dati della stanza ricevuta.');

    try {
        const { roomId } = req.params; // Recupera il roomId dai parametri

        // Recupera la stanza dal database
        const room = await Room.findByPk(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Stanza non trovata.' });
        }

        // Verifica se l'utente ha accesso alla stanza
        const isParticipant = await RoomUser.findOne({
            where: { roomId, userId: req.user.id }
        });

        if (!isParticipant) {
            return res.status(403).json({ error: 'Accesso negato alla stanza.' });
        }

        // Rispondi con i dettagli completi della stanza
        res.status(200).json({
            message: 'Dati della stanza recuperati con successo.',
            room: {
                id: room.id,
                name: room.name,
                description: room.description,
                originalCover: room.originalCover ? `${BASE_URL}${room.originalCover}` : null,
                resizedCover: room.cover ? `${BASE_URL}${room.cover}` : null,
                createdBy: room.createdBy,
                createdAt: room.createdAt,
                updatedAt: room.updatedAt,
            },
        });
    } catch (err) {
        console.error('Errore durante il caricamento della stanza:', err);
        res.status(500).json({
            error: 'Errore durante il caricamento della stanza.',
            details: err.message,
        });
    }
});

module.exports = router;



