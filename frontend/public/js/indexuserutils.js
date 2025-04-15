// Ensure CONFIG.BACKEND_URL is defined correctly
console.log(`✔ Backend URL configurato: ${CONFIG.BACKEND_URL}`);


// Function for user registration
async function register() {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    console.log('🔐 Tentativo di registrazione con credenziali:', { username });

    try {
        const data = await apiRequest(`${CONFIG.BACKEND_URL}/user/register`, 'POST', { username, password });
        console.log('✅ Registrazione avvenuta con successo:', data);

        alert('Registrazione completata! Ora puoi accedere.');
        document.getElementById('register-popup').style.display = 'none';
    } catch (error) {
        console.error('❌ Errore durante la registrazione:', error);
        alert('Errore durante la registrazione. Riprova!');
    }
}

function getStoredData() {
    const keys = ['username', 'token', 'userId', 'avatar', 'displayName', 'roomId', 'chatColor'];
    const data = {};

    keys.forEach((key) => {
        // Controlla prima nel localStorage
        const localValue = localStorage.getItem(key);
        if (localValue) {
            data[key] = localValue;
        } else {
            // Se non trovato nel localStorage, controlla nel sessionStorage
            const sessionValue = sessionStorage.getItem(key);
            if (sessionValue) {
                data[key] = sessionValue;
            } else {
                console.warn(`⚠ Dato "${key}" non trovato né in localStorage né in sessionStorage.`);
                data[key] = null; // Imposta null se il dato non è trovato
            }
        }
    });

    console.log('✔ Dati recuperati:', data);
    return data; // Restituisce un oggetto con i dati recuperati
}

// Function for user login
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const stayConnected = document.getElementById('stay-connected').checked;

    console.log('🔐 Tentativo di login con credenziali:', { username, stayConnected });

    try {
        // Effettua la richiesta di login
        const loginData = await apiRequest(`${CONFIG.BACKEND_URL}/user/login`, 'POST', { username, password });
        const token = loginData.token;
        console.log('✅ Login avvenuto con successo:', loginData);

        // Recupera informazioni utente
        console.log(`🔍 Recupero informazioni utente da: ${CONFIG.BACKEND_URL}/user/userInfo/${username}`);
        const userInfo = await apiRequest(`${CONFIG.BACKEND_URL}/user/userInfo/${username}`, 'GET');
        console.log('✔ Informazioni utente recuperate:', userInfo);

        // Estrai i dati necessari
        const id = userInfo.user.id;
        const avatar = userInfo.user.avatar;
        const chatColor = userInfo.user.chatColor; // Verifica il valore di chatColor
        const displayName = userInfo.user.displayName;

        if (stayConnected) {
            // Salvataggio in localStorage
            console.log('✔ Salvataggio credenziali persistenti in localStorage...');
            localStorage.setItem('username', username);
            localStorage.setItem('token', token);
            localStorage.setItem('userId', id);
            localStorage.setItem('avatar', avatar);
            localStorage.setItem('displayName', displayName);
            if (chatColor) {
                console.log('✔ Salvataggio chatColor:', chatColor);
                localStorage.setItem('chatColor', chatColor);
            }
        } else {
            // Salvataggio in sessionStorage
            console.log('✔ Salvataggio credenziali temporanee in sessionStorage...');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('userId', id);
            sessionStorage.setItem('avatar', avatar);
            sessionStorage.setItem('displayName', displayName);
            if (chatColor) {
                console.log('✔ Salvataggio chatColor:', chatColor);
                sessionStorage.setItem('chatColor', chatColor);
            }
        }

        // Aggiorna la UI con i dati dell'utente
        await updateUI(true, username, avatar);

    } catch (error) {
        console.error('❌ Errore durante il login:', error.message || error);
        alert('Errore durante il login. Controlla le tue credenziali e riprova.');

        // Reset della UI in caso di errore
        await updateUI(false, null);
    }
}

// Funzione per ottenere lo status dell'utente
async function getUserStatus(username) {
    console.log(`🔍 Recupero status dell'utente: ${username}`);

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('⚠ Token non trovato. Recupera prima il token.');
        throw new Error('Token assente. Effettua il login o richiedi il token.');
    }

    try {
        const response = await apiRequest(`${CONFIG.BACKEND_URL}/user/status/${username}`, 'GET', null, token);
        console.log('✔ Dati dell\'utente recuperati con successo:', response.user);
        return response.user; // Restituisce i dati dell'utente
    } catch (error) {
        console.error('❌ Errore durante il recupero dello status dell\'utente:', error);
        throw error;
    }
}

// Function for user logout
async function logout() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    console.log('🔐 Tentativo di logout...');

    try {
        if (token) {
            await apiRequest(`${CONFIG.BACKEND_URL}/user/logout`, 'POST', null, token);
            console.log('✅ Logout effettuato con successo.');
        }
    } catch (error) {
        console.warn('⚠ Errore durante il logout:', error);
    }

    // Reset delle credenziali e aggiornamento dell'interfaccia
    clearAuthData();
    await updateUI(false, null);
}

// Helper function to clear authentication data
function clearAuthData() {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('token');
}

function handleAvatarClick() {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (userId) {
        openEditUserPopup(userId);
    } else {
        console.error('⚠ userId non trovato. Assicurati che l\'utente sia loggato.');
    }
}

// Helper function per le API
async function apiRequest(url, method, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// Funzione per ottenere il token utente
async function getToken(username) {
    console.log(`🔑 Recupero token per l'utente: ${username}`);
    try {
        const data = await apiRequest(`${CONFIG.BACKEND_URL}/user/get-token`, 'POST', { username });
        const token = data.token;

        if (token) {
            console.log(`✔ Token ricevuto: ${token}`);
            localStorage.setItem('token', token); // Salva il token in localStorage
            return token;
        } else {
            throw new Error('Token non ricevuto dal backend.');
        }
    } catch (error) {
        console.error('❌ Errore durante il recupero del token:', error.message || error);
        throw error;
    }
}

// Funzione per ottenere lo status dell'utente




















// Attach functions to the global scope
window.register = register;
window.login = login;
window.logout = logout;