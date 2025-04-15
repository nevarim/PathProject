// Apri il popup
function openPopup(title, bodyContent) {
    const overlay = document.getElementById('popup-overlay');
    const titleElement = document.getElementById('popup-title');
    const bodyElement = document.getElementById('popup-body');

    if (overlay && titleElement && bodyElement) {
        titleElement.textContent = title; // Imposta il titolo
        bodyElement.innerHTML = bodyContent; // Inserisce il contenuto dinamico
        overlay.style.display = 'block'; // Mostra il popup
    }
}

// Chiudi il popup
function closePopup() {
    const overlay = document.getElementById('popup-overlay');
    if (overlay) {
        overlay.style.display = 'none'; // Nascondi il popup
    }
}

// Esempio di apertura popup per creazione stanza
function openCreateRoomPopup() {
    const title = 'Crea una Nuova Stanza';
    const bodyContent = `
        <form>
            <label for="room-name">Nome Stanza:</label>
            <input type="text" id="room-name" name="room-name" required />
            <label for="room-description">Descrizione Stanza:</label>
            <textarea id="room-description" name="room-description" required></textarea>
            <button type="submit">Crea Stanza</button>
        </form>
    `;
    openPopup(title, bodyContent);
}

async function openEditRoomPopup(roomId) {
    const storedData = getStoredData();
    const token = storedData.token;

    if (!token) {
        alert('Token non trovato. Effettua il login.');
        return;
    }

    try {
        // Recupera i dati della stanza
        const response = await fetch(`${CONFIG.BACKEND_URL}/room/${roomId}/loadRoom`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Errore durante il caricamento della stanza.');
        }

        const data = await response.json();
        const room = data.room;

        // Crea il contenuto del popup
        const title = 'Modifica Stanza';
        const bodyContent = `
            <form id="edit-room-form" enctype="multipart/form-data">
                <label for="edit-room-name">Nome Stanza (facoltativo):</label>
                <input type="text" id="edit-room-name" name="name" value="${room.name}" placeholder="Inserisci il nome della stanza" />

                <label for="edit-room-description">Descrizione Stanza (facoltativo):</label>
                <textarea id="edit-room-description" name="description" placeholder="Inserisci la descrizione della stanza">${room.description}</textarea>

                <label for="edit-room-cover">Cover (facoltativa):</label>
                <input type="file" id="edit-room-cover" name="cover" accept=".png,.jpg,.jpeg" />
                <div id="cover-preview-container">
                    <p>Anteprima Cover:</p>
                    <img id="cover-preview" src="${room.resizedCover}" alt="Anteprima cover" style="width: 150px; height: 150px; border-radius: 10px; border: 2px solid #4caf50;" />
                </div>

                <button type="submit">Salva Modifiche</button>
            </form>
        `;

        openPopup(title, bodyContent);

        // Gestione dell'anteprima della cover
        const coverInput = document.getElementById('edit-room-cover');
        const coverPreview = document.getElementById('cover-preview');
        coverInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    coverPreview.src = e.target.result;
                    console.log('✔ Anteprima aggiornata con il file scelto:', e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                coverPreview.src = room.resizedCover; // Ripristina la cover originale
                console.log('✔ Anteprima ripristinata con cover salvata:', room.resizedCover);
            }
        });

        // Gestione del submit del form
        const form = document.getElementById('edit-room-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const updatedName = document.getElementById('edit-room-name').value.trim();
            const updatedDescription = document.getElementById('edit-room-description').value.trim();
            const coverFile = document.getElementById('edit-room-cover').files[0];

            // Preparazione del corpo della richiesta
            const formData = new FormData();
            if (updatedName) formData.append('name', updatedName);
            if (updatedDescription) formData.append('description', updatedDescription);
            if (coverFile) formData.append('cover', coverFile);

            try {
                const editResponse = await fetch(`${CONFIG.BACKEND_URL}/room/${roomId}/editRoom`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (!editResponse.ok) {
                    const editErrorData = await editResponse.json();
                    console.error('❌ Dettaglio errore:', editErrorData);
                    throw new Error(editErrorData.error || 'Errore durante l\'aggiornamento della stanza.');
                }

                const updatedRoom = await editResponse.json();
                console.log('✔ Stanza aggiornata con successo:', updatedRoom);

                // Aggiorna la card della stanza
                refreshCard(roomId, updatedRoom.room);

                alert('La stanza è stata aggiornata con successo!');
                closePopup(); // Chiudi il popup dopo la modifica
            } catch (error) {
                console.error('❌ Errore durante la modifica della stanza:', error.message);
                alert(`Errore: ${error.message}. Riprova.`);
            }
        });
    } catch (error) {
        console.error('❌ Errore durante il caricamento della stanza:', error.message);
        alert('Errore durante il caricamento della stanza. Riprova.');
    }
}

async function openEditUserPopup() {
    const storedData = getStoredData();
    const username = storedData.username;
    const token = storedData.token;

    if (!username || !token) {
        alert('Errore: Username o token non trovato. Effettua il login.');
        return;
    }

    const title = 'Modifica Profilo Utente';

    try {
        // Recupera informazioni utente dal backend
        const response = await fetch(`${CONFIG.BACKEND_URL}/user/userInfo/${username}`);
        if (!response.ok) {
            throw new Error('Errore durante il recupero delle informazioni utente.');
        }

        const data = await response.json();
        const user = data.user;

        // Genera il contenuto del popup
        const bodyContent = `
            <form id="edit-user-form">
                <label for="edit-user-name">Nome Utente:</label>
                <input type="text" id="edit-user-name" name="username" value="${user.username}" required />

                <label for="edit-user-display-name">Nome Visualizzato:</label>
                <input type="text" id="edit-user-display-name" name="displayName" value="${user.displayName}" required />

                <label for="edit-user-biografia">Biografia:</label>
                <textarea id="edit-user-biografia" name="biografia">${user.biography || ''}</textarea>

                <label for="edit-user-chat-color">Colore Chat:</label>
                <input type="color" id="edit-user-chat-color" name="chatColor" value="${user.chatColor}" />

                <label for="edit-user-theme">Tema:</label>
                <select id="edit-user-theme" name="theme">
                    <option value="light" ${user.theme === 'light' ? 'selected' : ''}>Chiaro</option>
                    <option value="dark" ${user.theme === 'dark' ? 'selected' : ''}>Scuro</option>
                </select>

                <label for="edit-user-avatar">Avatar (opzionale):</label>
                <input type="file" id="edit-user-avatar" name="avatar" accept=".png,.jpg,.jpeg" />
                <div id="avatar-preview-container">
                    <p>Anteprima Avatar:</p>
                    <img id="avatar-preview" src="" alt="Anteprima avatar" style="width: 100px; height: 100px; border-radius: 50%; border: 2px solid #4caf50;" />
                </div>

                <button type="submit">Salva Modifiche</button>
            </form>
        `;

        openPopup(title, bodyContent);

        // Assicurati che l'immagine venga caricata nel DOM
        const avatarPreview = document.getElementById('avatar-preview');
        avatarPreview.src = user.avatar;
        avatarPreview.onload = () => {
            console.log(`✔ Avatar iniziale caricato correttamente: ${avatarPreview.src}`);
            avatarPreview.style.display = 'block'; // Mostra l'immagine
        };

        // Gestione anteprima avatar al cambio del file
        const avatarInput = document.getElementById('edit-user-avatar');
        avatarInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatarPreview.src = e.target.result; // Imposta la sorgente per l'anteprima
                    avatarPreview.style.display = 'block'; // Mostra l'immagine
                    console.log('✔ Anteprima aggiornata con il file scelto:', e.target.result);
                };
                reader.readAsDataURL(file); // Legge il contenuto del file
            } else {
                avatarPreview.src = user.avatar; // Ripristina l'avatar salvato se il file non è selezionato
                console.log('✔ Anteprima ripristinata con avatar salvato:', user.avatar);
            }
        });

        // Salvataggio modifiche al profilo
        const form = document.getElementById('edit-user-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const updatedData = {
                username: document.getElementById('edit-user-name').value.trim(),
                displayName: document.getElementById('edit-user-display-name').value.trim(),
                biography: document.getElementById('edit-user-biografia').value.trim(),
                chatColor: document.getElementById('edit-user-chat-color').value,
                theme: document.getElementById('edit-user-theme').value,
            };

            try {
                // Salva modifiche al profilo
                const profileResponse = await fetch(`${CONFIG.BACKEND_URL}/user/update-profile/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updatedData),
                });

                if (!profileResponse.ok) {
                    const profileErrorData = await profileResponse.json();
                    throw new Error(profileErrorData.error || 'Errore durante l\'aggiornamento del profilo.');
                }

                console.log('✔ Profilo aggiornato con successo.');

                // Aggiorna separatamente l'avatar se selezionato
                const avatarFile = avatarInput.files[0];
                if (avatarFile) {
                    const avatarFormData = new FormData();
                    avatarFormData.append('avatar', avatarFile);

                    const avatarResponse = await fetch(`${CONFIG.BACKEND_URL}/user/update-avatar`, {
                        method: 'PUT',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: avatarFormData,
                    });

                    if (!avatarResponse.ok) {
                        const avatarErrorData = await avatarResponse.json();
                        throw new Error(avatarErrorData.error || 'Errore durante l\'aggiornamento dell\'avatar.');
                    }

                    const avatarData = await avatarResponse.json();
                    console.log('✔ Avatar aggiornato con successo:', avatarData.avatar);

                    // Usa la funzione updateUI per aggiornare l'interfaccia
                    await updateUI(true, username);
                }

                alert('Profilo e avatar aggiornati con successo!');
                closePopup();
            } catch (error) {
                console.error('❌ Errore durante l\'aggiornamento:', error.message);
                alert(`Errore: ${error.message}`);
            }
        });
    } catch (error) {
        console.error('❌ Errore durante il recupero delle informazioni utente:', error.message);
        alert('Errore durante il recupero delle informazioni utente. Riprova.');
    }
}

function openCreateRegisterPopup() {
    const title = 'Registrazione Nuovo Utente';
    const bodyContent = `
        <form id="register-user-form" enctype="multipart/form-data">
            <label for="register-username">Nome Utente:</label>
            <input type="text" id="register-username" name="username" placeholder="Inserisci il nome utente" required />

            <label for="register-password">Password:</label>
            <input type="password" id="register-password" name="password" placeholder="Inserisci la password" required />

            <label for="register-confirm-password">Conferma Password:</label>
            <input type="password" id="register-confirm-password" placeholder="Conferma la password" required />

            <label for="register-avatar">Avatar (opzionale):</label>
            <input type="file" id="register-avatar" name="avatar" accept=".png,.jpg,.jpeg" />
            <div id="avatar-preview-container">
                <p>Anteprima Avatar:</p>
                <img id="avatar-preview" src="" alt="Anteprima avatar" />
            </div>

            <button type="submit">Registrati</button>
        </form>
    `;

    openPopup(title, bodyContent);

    // Aggiungi un listener per l'anteprima dell'immagine
    const avatarInput = document.getElementById('register-avatar');
    const avatarPreview = document.getElementById('avatar-preview');

    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
                avatarPreview.style.display = 'block'; // Mostra l'anteprima
            };
            reader.readAsDataURL(file);
        } else {
            avatarPreview.src = ''; // Resetta l'anteprima
            avatarPreview.style.display = 'none'; // Nascondi l'anteprima
        }
    });

    // Aggiungi un listener al form per la registrazione
    const form = document.getElementById('register-user-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previene il comportamento predefinito del form

        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const avatar = document.getElementById('register-avatar').files[0]; // File avatar

        if (password !== confirmPassword) {
            alert('Le password non corrispondono. Riprova.');
            return;
        }

        console.log('🔄 Registrazione utente in corso:', { username, password, avatar });

        // Preparazione dei dati per multipart/form-data
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        if (avatar) formData.append('avatar', avatar);

        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/register`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante la registrazione.');
            }

            const responseData = await response.json();
            console.log('✔ Registrazione completata con successo:', responseData);
            alert('Registrazione completata con successo!');
            closePopup(); // Chiudi il popup
        } catch (error) {
            console.error('❌ Errore durante la registrazione:', error.message);
            alert(`Errore: ${error.message}. Riprova.`);
        }
    });
}


