// Configurazione dal file config.js
// const BACKEND_URL = window.CONFIG.BACKEND_URL;

document.addEventListener('DOMContentLoaded', async () => {
    const tokensList = document.getElementById('tokens-list');
    const storedData = getStoredData(); // Recupera i dati salvati
    const userToken = storedData.token; // Recupera il token di autorizzazione

    // Funzione per recuperare la lista dei token dell'utente
    async function fetchUserTokens() {
        try {
            const response = await fetch(`${BACKEND_URL}/tokenimages/user-tokens`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante il recupero dei token.');
            }

            const tokens = await response.json();
            console.log('✔ Lista dei token recuperata:', tokens);
            return tokens;
        } catch (error) {
            console.error('❌ Errore durante il recupero dei token:', error.message);
            return [];
        }
    }

    // Funzione per generare e mostrare i token
    function renderTokens(tokens) {
        tokensList.innerHTML = ''; // Resetta la lista
    
        tokens.forEach((token) => {
            const tokenItem = document.createElement('div');
            tokenItem.classList.add('token-item');
            tokenItem.dataset.id = token.id;
    
            // Determina l'URL corretto senza duplicazioni
            let tokenUrl = token.url;
            if (!tokenUrl.startsWith('http') && !tokenUrl.startsWith('/')) {
                tokenUrl = `${BACKEND_URL}/${token.url}`;
            }
    
            // Immagine del token
            const tokenImg = document.createElement('img');
            tokenImg.src = tokenUrl;
            tokenImg.alt = token.name;
    
            // Nome del token
            const tokenName = document.createElement('span');
            tokenName.textContent = token.name;
    
            // Azioni (modifica e cancellazione)
            const tokenActions = document.createElement('div');
            tokenActions.classList.add('token-actions');
    
            const modifyButton = document.createElement('i');
            modifyButton.classList.add('fas', 'fa-edit');
            modifyButton.title = 'Modifica';
            modifyButton.addEventListener('click', () => modifyToken(token.id));
    
            const deleteButton = document.createElement('i');
            deleteButton.classList.add('fas', 'fa-trash');
            deleteButton.title = 'Elimina';
            deleteButton.addEventListener('click', () => deleteToken(token.id));
    
            tokenActions.appendChild(modifyButton);
            tokenActions.appendChild(deleteButton);
    
            // Combinazione degli elementi
            tokenItem.appendChild(tokenImg);
            tokenItem.appendChild(tokenName);
            tokenItem.appendChild(tokenActions);
            tokensList.appendChild(tokenItem);
        });
    }
    // Funzione per eliminare un token
    async function deleteToken(tokenId) {
        const confirmDelete = confirm('Sei sicuro di voler eliminare questo token?');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${BACKEND_URL}/tokenimages/${tokenId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Errore durante l\'eliminazione del token.');
            }

            const result = await response.json();
            alert(result.message || 'Token eliminato con successo.');
            console.log('✔ Token eliminato:', result.message);
            // Aggiorna la lista dei token
            const userTokens = await fetchUserTokens();
            renderTokens(userTokens);
        } catch (error) {
            console.error('❌ Errore durante l\'eliminazione del token:', error.message);
            alert('Errore durante l\'eliminazione del token.');
        }
    }

    // Funzione per modificare un token
    async function modifyToken(tokenId) {
        const newName = prompt('Inserisci il nuovo nome per il token:');
        if (!newName) {
            alert('Nome non valido!');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/tokenimages/${tokenId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Errore durante la modifica del token.');
            }

            const result = await response.json();
            alert('Token modificato con successo!');
            console.log('✔ Token modificato:', result.token);
            // Aggiorna la lista dei token
            const userTokens = await fetchUserTokens();
            renderTokens(userTokens);
        } catch (error) {
            console.error('❌ Errore durante la modifica del token:', error.message);
            alert('Errore durante la modifica del token.');
        }
    }

    // Funzione per caricare un singolo token
    async function uploadSingleToken() {
        const name = document.getElementById('single-token-name').value.trim();
        const file = document.getElementById('single-token-file').files[0];

        if (!name || !file) {
            alert('Devi inserire un nome e selezionare un file per caricare un token!');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('tokenImage', file);

        try {
            const response = await fetch(`${BACKEND_URL}/tokenimages/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Errore durante il caricamento del token.');
            }

            const result = await response.json();
            alert('Token caricato con successo!');
            console.log('✔ Token caricato:', result.token);
            // Aggiorna la lista dei token
            const userTokens = await fetchUserTokens();
            renderTokens(userTokens);
        } catch (error) {
            console.error('❌ Errore durante il caricamento del token:', error.message);
            alert('Errore durante il caricamento del token.');
        }
    }

    // Funzione per caricare token multipli
    async function uploadMultipleTokens() {
        const files = document.getElementById('multiple-token-files').files;

        if (!files.length) {
            alert('Devi selezionare almeno un file per caricare i token!');
            return;
        }

        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('tokenImages', file));

        try {
            const response = await fetch(`${BACKEND_URL}/tokenimages/upload-multiple`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Errore durante il caricamento di token multipli.');
            }

            const result = await response.json();
            alert('Token multipli caricati con successo!');
            console.log('✔ Token multipli caricati:', result.tokens);
            // Aggiorna la lista dei token
            const userTokens = await fetchUserTokens();
            renderTokens(userTokens);
        } catch (error) {
            console.error('❌ Errore durante il caricamento di token multipli:', error.message);
            alert('Errore durante il caricamento di token multipli.');
        }
    }

    // Div a scomparsa per upload singolo
    const toggleUploadSingle = document.getElementById('toggle-upload-single');
    const uploadSingleContainer = document.getElementById('upload-single');
    toggleUploadSingle.addEventListener('click', () => {
        uploadSingleContainer.style.display =
            uploadSingleContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Div a scomparsa per upload multiplo
    const toggleUploadMultiple = document.getElementById('toggle-upload-multiple');
    const uploadMultipleContainer = document.getElementById('upload-multiple');
    toggleUploadMultiple.addEventListener('click', () => {
        uploadMultipleContainer.style.display =
            uploadMultipleContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Listener per il pulsante di upload singolo
    const uploadSingleBtn = document.getElementById('upload-single-btn');
    uploadSingleBtn.addEventListener('click', uploadSingleToken);

    // Listener per il pulsante di upload multiplo
    const uploadMultipleBtn = document.getElementById('upload-multiple-btn');
    uploadMultipleBtn.addEventListener('click', uploadMultipleTokens);

    // Recupera e mostra i token iniziali
    const userTokens = await fetchUserTokens();
    renderTokens(userTokens);
});