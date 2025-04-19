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

// Funzione per aprire il popup per creare una nuova mappa
async function onCreateMapPopup() {
    const storedData = getStoredData();
    const token = storedData.token;
    const roomId = storedData.roomId;

    if (!token) {
        alert('Token non trovato. Effettua il login.');
        return;
    }

    if (!roomId) {
        alert('ID della stanza non trovato. Seleziona una stanza valida.');
        return;
    }

    const title = 'Crea una Nuova Mappa';
    const bodyContent = `
        <form id="create-map-form" enctype="multipart/form-data">
            <!-- Nome Mappa -->
            <label for="map-name">Nome Mappa:</label>
            <input type="text" id="map-name" name="name" placeholder="Es. Dungeon" required />

            <!-- Descrizione Mappa -->
            <label for="map-description">Descrizione Mappa:</label>
            <textarea id="map-description" name="description" placeholder="Inserisci la descrizione" required></textarea>

            <!-- Dimensione della Mappa -->
            <label for="map-size">Dimensione della Mappa (Larghezza x Altezza):</label>
            <input type="text" id="map-size" name="mapSize" placeholder="Es. 1000x800" required />

            <!-- Dimensione della Griglia -->
            <label for="grid-size">Dimensione Cella Griglia (px):</label>
            <input type="number" id="grid-size" name="gridSize" placeholder="Es. 50" required />

            <!-- File della Mappa -->
            <label for="map-file">Carica File:</label>
            <input type="file" id="map-file" name="map" accept=".png,.jpg,.jpeg" required />

            <!-- Pulsante per inviare -->
            <button type="submit">Crea Mappa</button>
        </form>
    `;

    openPopup(title, bodyContent);

    // Gestione del submit del form
    const form = document.getElementById('create-map-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const mapName = document.getElementById('map-name').value.trim();
        const mapDescription = document.getElementById('map-description').value.trim();
        const mapSize = document.getElementById('map-size').value.trim();
        const gridSize = document.getElementById('grid-size').value.trim();
        const mapFile = document.getElementById('map-file').files[0];

        // Preparazione del corpo della richiesta
        const formData = new FormData();
        formData.append('name', mapName);
        formData.append('description', mapDescription);
        formData.append('mapSize', mapSize);
        formData.append('gridSize', gridSize);
        formData.append('map', mapFile);
        formData.append('roomId', roomId);

        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/map/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Dettaglio errore:', errorData);
                throw new Error(errorData.message || 'Errore durante il caricamento della mappa.');
            }

            const data = await response.json();
            console.log('✔ Mappa caricata con successo:', data.map);

            alert('La mappa è stata creata con successo!');
            closePopup(); // Chiudi il popup
        } catch (error) {
            console.error('❌ Errore durante la creazione della mappa:', error.message);
            alert(`Errore: ${error.message}. Riprova.`);
        }
    });
}
