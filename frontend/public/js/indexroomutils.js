// Variabili globali
let roomsList = [];
console.log(`✔ Backend URL configurato: ${CONFIG.BACKEND_URL}`);

// Helper function for API requests
async function apiRequest(url, method, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
        method,
        headers,
    };

    // Aggiungi il corpo solo se non è GET o HEAD
    if (body && method !== 'GET' && method !== 'HEAD') {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// Funzione per caricare le stanze dell'utente
async function loadUserRooms() {
    console.log('🌐 Avvio caricamento stanze per l\'utente...');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
        console.error('⚠ Impossibile recuperare le stanze: token assente.');
        return;
    }

    try {
        const data = await apiRequest(`${CONFIG.BACKEND_URL}/room/gm`, 'GET', null, token);
        roomsList = data.rooms || [];
        console.log('✔ Stanze recuperate:', roomsList);

        populateRoomGrid(roomsList, 'room-grid');
        document.getElementById('rooms-container').style.display = 'block';
    } catch (error) {
        console.error('❌ Errore durante il caricamento delle stanze:', error);
        alert('Errore durante il caricamento delle stanze. Riprova!');
    }
}

// Funzione per salvare le modifiche della stanza
async function saveRoomChanges() {
    console.log('🔄 Salvataggio modifiche della stanza...');
    const roomId = document.getElementById('edit-room-name').dataset.roomId;
    const roomName = document.getElementById('edit-room-name').value.trim();
    const roomDescription = document.getElementById('edit-room-description').value.trim();
    const roomCover = document.getElementById('edit-room-cover').files[0];
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!roomId || !token) {
        console.error('⚠ Impossibile salvare: dati mancanti.');
        return;
    }

    try {
        const formData = new FormData();
        if (roomName) formData.append('name', roomName);
        if (roomDescription) formData.append('description', roomDescription);
        if (roomCover) formData.append('cover', roomCover);

        const data = await apiRequest(`${CONFIG.BACKEND_URL}/room/${roomId}/editRoom`, 'PUT', formData, token, true);
        refreshCard(roomId, data.room);

        alert('Modifiche salvate con successo!');
        document.getElementById('edit-room-popup').style.display = 'none';
    } catch (error) {
        console.error('❌ Errore durante il salvataggio:', error);
        alert('Errore durante il salvataggio. Riprova!');
    }
}

// Funzione per aggiornare una carta stanza
function refreshCard(roomId, updatedRoom) {
    const roomCard = document.querySelector(`[data-room-id="${roomId}"]`);
    if (!roomCard) {
        console.error('⚠ Carta stanza non trovata per aggiornamento.');
        return;
    }

    roomCard.querySelector('.room-name').textContent = updatedRoom.name;
    roomCard.querySelector('.room-description').textContent = updatedRoom.description;

    const roomCover = roomCard.querySelector('.room-cover');
    if (roomCover) roomCover.src = updatedRoom.resizedCover;

    console.log(`✔ Carta stanza aggiornata: ${roomId}`);
}

// Funzione per cambiare tab
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Funzione per caricare le stanze del GM e del Player
async function loadRooms() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
        console.error('⚠ Impossibile recuperare le stanze: token assente.');
        alert('Autenticazione necessaria. Effettua il login.');
        return;
    }

    try {
        // Carica le stanze del GM
        const gmData = await apiRequest(`${CONFIG.BACKEND_URL}/room/gm`, 'GET', null, token);
        const gmRooms = gmData.rooms || [];
        console.log('✔ Stanze GM recuperate:', gmRooms);

        populateRoomGrid(gmRooms, 'gm-rooms'); // Riempie la tab GM Rooms

        // Carica le stanze del Player
        const playerData = await apiRequest(`${CONFIG.BACKEND_URL}/room/player`, 'GET', null, token);
        const playerRooms = playerData.rooms || [];
        console.log('✔ Stanze Player recuperate:', playerRooms);

        populateRoomGrid(playerRooms, 'player-rooms'); // Riempie la tab Player Rooms
    } catch (error) {
        console.error('❌ Errore durante il caricamento delle stanze:', error);
        alert('Errore durante il caricamento delle stanze. Riprova più tardi.');
    }
}

// Funzione per riempire la griglia
function populateRoomGrid(rooms, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`⚠ Contenitore "${containerId}" non trovato nel DOM.`);
        return;
    }

    container.innerHTML = ''; // Pulisce il contenitore esistente

    // Recupera i dati dell'utente loggato
    const storedData = getStoredData();
    const currentUsername = storedData.username;

    rooms.forEach((room) => {
        const roomCard = document.createElement('div');
        roomCard.classList.add('room-card');
        roomCard.setAttribute('data-room-id', room.id); // Aggiunge l'attributo data-room-id

        // Genera la lista dei partecipanti con nome e ruolo separati
        const participants = room.participants
            .map(participant => `
                <div class="participant-row">
                    <span class="participant-name">${participant.username}</span>
                    <span class="participant-role">${participant.role}</span>
                </div>
            `)
            .join('');

        // Controlla se l'utente loggato è GM della stanza
        const isGM = room.participants.some(
            participant => participant.username === currentUsername && participant.role === 'gm'
        );

        roomCard.innerHTML = `
            <img src="${room.resizedCover}" alt="${room.name}" class="room-cover" />
            <h3 class="room-name">${room.name}</h3>
            <p class="room-description">${room.description}</p>
            <div class="room-buttons">
                <button class="btn-launch" onclick="launchRoom('${room.id}', '${room.createdBy}')">Launch</button>
                ${isGM ? `<button class="btn-edit" onclick="openEditRoomPopup('${room.id}')">Edit</button>` : ''}
            </div>
            <div class="room-participants">
                <p><strong>Partecipanti:</strong></p>
                ${participants}
            </div>
        `;

        container.appendChild(roomCard);
    });

    console.log(`✔ Griglia "${containerId}" aggiornata con ${rooms.length} stanze.`);
}

// Funzione per lanciare una stanza
function launchRoom(roomId, createdBy) {
    const username = localStorage.getItem('username') || sessionStorage.getItem('username');
    
    // Salva il roomId nel localStorage
    sessionStorage.setItem('roomId', roomId);
    console.log(`✔ Room ID salvato nel localStorage: ${roomId}`);
    
    const gameUrl = `/game`;
    window.location.href = gameUrl;
}

// Funzione per aprire il pop-up di modifica stanza (placeholder)
function openEditRoom(roomId) {
    //alert(`Modifica stanza con ID: ${roomId}`);
    //console.log(`✏ Apertura modifica stanza con ID: ${roomId}`);
    openEditRoomPopup(roomId);
}