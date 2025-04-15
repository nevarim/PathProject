// Configurazione dal file config.js
const BACKEND_URL = window.CONFIG.BACKEND_URL;

// Inizializza la connessione Socket.IO
const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });

document.addEventListener('DOMContentLoaded', () => {
    // Recupera i dati salvati con getStoredData
    const storedData = getStoredData();
    const userName = storedData.username;
    const roomId = storedData.roomId;
    const chatColor = storedData.chatColor;

    if (!userName || !roomId) {
        console.error('❌ Errore: userName o roomId non definiti. Impossibile avviare la chat.');
        alert('Errore: userName o roomId non definiti. Effettua nuovamente il login o seleziona una stanza.');
        return;
    }

    console.log(`✅ Inizializzazione chat per Room ID: ${roomId} e Username: ${userName}, Colore: ${chatColor}`);

    // **Caricamento messaggi storici**
    fetchMessages(roomId, storedData.token);

    // **Connessione alla stanza tramite Socket.IO**
    socket.on('connect', () => {
        console.log('✅ Connessione a Socket.IO stabilita');
        socket.emit('joinRoom', roomId); // Unisci l'utente alla stanza
        console.log(`🔗 Utente unito alla stanza ${roomId}`);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ Errore di connessione Socket.IO:', error);
    });

    // **Ricezione messaggi in tempo reale**
    socket.on('chatMessage', (msg) => {
        console.log('📩 Messaggio ricevuto dal server:', msg);
        appendMessage(msg);
    });

    // **Invio messaggi**
    const chatForm = document.getElementById('chat-form');
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const chatInput = document.getElementById('chat-input').value.trim();

        if (chatInput) {
            const newMessage = { 
                roomId, 
                userId: storedData.userId, 
                userName: userName, 
                message: chatInput, 
                chatColor: chatColor // Include il colore nel messaggio
            };
            console.log('✉️ Invio messaggio:', newMessage);

            // Invia il messaggio in tempo reale tramite Socket.IO
            socket.emit('messageToRoom', newMessage);

            // Ripristina il campo input
            document.getElementById('chat-input').value = '';
        }
    });

    // **Logica del selettore Emoji**
    const emojiButton = document.getElementById('emoji-button');
    const emojiSelector = document.getElementById('emoji-selector');
    const emojiTabs = document.querySelectorAll('.emoji-tab');
    const emojiTabContents = document.querySelectorAll('.emoji-tab-content');

    // Mostra/nasconde il selettore emoji
    emojiButton.addEventListener('click', () => {
        emojiSelector.style.display = emojiSelector.style.display === 'none' ? 'block' : 'none';
    });

    // Cambia tab di emoji
    emojiTabs.forEach((tab) => {
        tab.addEventListener('click', (e) => {
            e.preventDefault(); // Previene comportamenti indesiderati
            emojiTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active'); // Aggiungi la classe active al tab corrente

            const selectedTab = tab.getAttribute('data-tab');
            emojiTabContents.forEach((content) => {
                content.style.display = content.getAttribute('data-tab') === selectedTab ? 'flex' : 'none';
            });
        });
    });

    // Aggiungi l'emoji al campo di input
    emojiSelector.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('emoji-tab')) {
            const emoji = e.target.textContent;
            const chatInput = document.getElementById('chat-input');
            chatInput.value += emoji; // Aggiungi l'emoji al campo input
        }
    });
});

// **Carica i messaggi storici**
async function fetchMessages(roomId, token) {
    try {
        const response = await fetch(`${BACKEND_URL}/chat/${roomId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Errore durante il caricamento dei messaggi.');
        }

        const messages = await response.json();
        console.log('📜 Messaggi storici caricati:', messages);

        // Aggiungi i messaggi storici alla chat
        messages.forEach((msg) => appendMessage(msg));
    } catch (error) {
        console.error('❌ Errore durante il caricamento dei messaggi storici:', error.message);
    }
}

// **Visualizza messaggi nella chat**
function appendMessage(msg) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) {
        console.error('⚠️ Elemento "chat-messages" non trovato');
        return;
    }

    const msgDiv = document.createElement('div');
    msgDiv.textContent = `(${msg.userName || msg.userId}): ${msg.message}`;
    msgDiv.style.color = msg.chatColor || '#fff'; // Applica il colore dal messaggio, usa un colore di default
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scorri automaticamente verso il basso
}