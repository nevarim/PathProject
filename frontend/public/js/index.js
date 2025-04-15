// Variabili globali
console.log(`✔ Backend URL configurato: ${CONFIG.BACKEND_URL}`);

// Funzione per controllare lo stato utente
async function checkAuthStatus() {
    console.log('🔍 Inizio verifica dello stato utente...');

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const username = localStorage.getItem('username') || sessionStorage.getItem('username');

    // Verifica se token o username mancano
    if (!username || !token) {
        console.warn('⚠ Nessun utente loggato, procedura di logout avviata.');
        updateUI(false, null); // Imposta UI non autenticata
        return;
    }

    console.log('🔍 Credenziali trovate:');
    console.log(`   Username: ${username}`);
    console.log(`   Token: ${token}`);

    try {
        // Controllo stato utente tramite backend
        const url = `${CONFIG.BACKEND_URL}/user/status/${username}`;
        console.log(`🌐 Verifica stato utente: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log(`🔍 Risultato HTTP: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log('✔ Stato utente verificato con successo:', data);

            if (data.user && data.user.username) {
                console.log(`✔ Login confermato per l'utente: ${data.user.username}`);
                updateUI(true, data.user.username, data.user.avatarUrl); // UI autenticata

                // Caricamento delle stanze GM
                const gmRoomsResponse = await apiRequest(`${CONFIG.BACKEND_URL}/room/gm`, 'GET', null, token);
                const gmRooms = gmRoomsResponse.rooms || [];
                console.log('✔ Stanze GM recuperate:', gmRooms);
                populateRoomGrid(gmRooms, 'gm-room-grid'); // Riempie la sezione GM Rooms

                // Caricamento delle stanze Player
                const playerRoomsResponse = await apiRequest(`${CONFIG.BACKEND_URL}/room/player`, 'GET', null, token);
                const playerRooms = playerRoomsResponse.rooms || [];
                console.log('✔ Stanze Player recuperate:', playerRooms);
                populateRoomGrid(playerRooms, 'player-room-grid'); // Riempie la sezione Player Rooms
            } else {
                console.warn('⚠ Token valido, ma utente non trovato nel backend.');
                updateUI(false, null); // Imposta UI non autenticata
            }
        } else {
            console.warn('⚠ Token non valido o scaduto. Procedura di logout avviata.');
            clearAuthData();
            updateUI(false, null); // UI non autenticata
        }
    } catch (error) {
        console.error('❌ Errore durante la verifica dello stato utente:', error);
        alert('Errore durante la verifica dello stato utente. Riprova più tardi.');
        updateUI(false, null); // UI non autenticata
    }
}

// Funzione per pulire dati di autenticazione
function clearAuthData() {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('token');
}

// Funzione per aggiornare l'interfaccia
async function updateUI(isLoggedIn, username) {
    const loginSection = document.getElementById('login-section');
    const logoutSection = document.getElementById('logout-section');
    const userDisplayName = document.getElementById('user-display-name');
    const roomsContainer = document.getElementById('rooms-container');
    const createRoomButton = document.getElementById('create-room-button');
    const avatarDiv = document.getElementById('avatardiv');
    const tabPanel = document.getElementById('tab-panel'); // Elemento per il tab-panel

    if (isLoggedIn) {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                console.error('⚠ Token assente. Non è possibile recuperare l\'avatar.');
                return;
            }

            const url = `${CONFIG.BACKEND_URL}/user/status/${username}`;
            console.log(`🌐 Recupero stato utente da: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const avatarUrl = data.user ? data.user.avatar : null;

                // Debug per l'avatar
                console.log(`🔍 Recuperato avatarUrl: ${avatarUrl}`);

                // Aggiorna la UI
                if (loginSection) loginSection.style.display = 'none';
                if (logoutSection) logoutSection.style.display = 'flex';
                if (userDisplayName) userDisplayName.textContent = username;
                if (roomsContainer) roomsContainer.style.display = 'block';
                if (createRoomButton) createRoomButton.style.display = 'inline-block';
                if (tabPanel) tabPanel.style.display = 'block'; // Mostra il tab-panel quando loggato

                // Imposta avatar
                if (avatarDiv) {
                    if (avatarUrl) {
                        avatarDiv.innerHTML = `<img src="${avatarUrl}" alt="${username}" class="avatar-img" style="border-radius: 50%; width: 60px; height: 60px;" />`;
                        console.log(`👤 Avatar impostato con URL: ${avatarUrl}`);
                    } else {
                        avatarDiv.innerHTML = `<div class="default-avatar">Nessun avatar disponibile</div>`;
                        console.warn('⚠ Nessun avatar disponibile. Mostrato avatar di default.');
                    }
                } else {
                    console.error('⚠ Div avatarDiv non trovato.');
                }
            } else {
                console.error(`❌ Errore HTTP durante il recupero dello stato utente: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Errore durante la richiesta dello stato utente:', error);
        }
    } else {
        // Reimposta la UI quando non loggato
        if (loginSection) loginSection.style.display = 'block';
        if (logoutSection) logoutSection.style.display = 'none';
        if (userDisplayName) userDisplayName.textContent = '';
        if (roomsContainer) roomsContainer.style.display = 'none';
        if (createRoomButton) createRoomButton.style.display = 'none';
        if (avatarDiv) avatarDiv.innerHTML = ''; // Reset div avatar
        if (tabPanel) tabPanel.style.display = 'none'; // Nascondi il tab-panel quando non loggato
    }

    console.log(`✔ UI aggiornata per stato utente: ${isLoggedIn ? 'Loggato' : 'Non loggato'}`);
}

// Listener per caricamento iniziale
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌐 Pagina caricata: controllo stato utente...');
    await checkAuthStatus();
});