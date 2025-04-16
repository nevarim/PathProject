document.addEventListener('DOMContentLoaded', () => {
    const mapIdInput = document.getElementById('map-id');
    const mapNameInput = document.getElementById('map-name');
    const mapDescriptionInput = document.getElementById('map-description');
    const mapSizeInput = document.getElementById('map-size');
    const gridSizeInput = document.getElementById('grid-size');
    const visibilitySelect = document.getElementById('visibility');
    const getMapBtn = document.getElementById('get-map-btn');
    const updateMapBtn = document.getElementById('update-map-btn');

    const backendUrl = window.CONFIG.BACKEND_URL; // Backend URL
    const userToken = getStoredData().token; // Recupera il token dell'utente

    // Funzione per recuperare i dettagli della mappa
    async function fetchMapDetails(mapId) {
        try {
            const response = await fetch(`${backendUrl}/map/${mapId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
            if (!response.ok) throw new Error(`Errore ${response.status}: ${await response.text()}`);

            const mapData = await response.json();
            console.log('✔ Dettagli Mappa Recuperati:', mapData);

            // Popola i campi con i dati ricevuti
            mapIdInput.value = mapData.id;
            mapNameInput.value = mapData.name;
            mapDescriptionInput.value = mapData.description;
            mapSizeInput.value = mapData.mapSize;
            gridSizeInput.value = mapData.gridSize;
            visibilitySelect.value = mapData.isVisibleToPlayers.toString();
        } catch (error) {
            console.error('❌ Errore durante il recupero dei dettagli della mappa:', error);
            alert(`Errore: ${error.message}`);
        }
    }

    // Funzione per aggiornare i dettagli della mappa
    async function updateMapDetails(mapId) {
        const updatedData = {
            name: mapNameInput.value.trim(),
            description: mapDescriptionInput.value.trim(),
            mapSize: mapSizeInput.value.trim(),
            gridSize: gridSizeInput.value.trim(),
            isVisibleToPlayers: visibilitySelect.value === 'true',
        };

        try {
            const response = await fetch(`${backendUrl}/map/${mapId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error(`Errore ${response.status}: ${await response.text()}`);

            const updatedMap = await response.json();
            console.log('✔ Mappa Aggiornata:', updatedMap);
            alert('Mappa aggiornata con successo!');
        } catch (error) {
            console.error('❌ Errore durante l\'aggiornamento della mappa:', error);
            alert(`Errore: ${error.message}`);
        }
    }

    // Gestione del clic su "Recupera Dettagli"
    getMapBtn.addEventListener('click', () => {
        const mapId = prompt('Inserisci l\'ID della mappa da recuperare:');
        if (mapId) fetchMapDetails(mapId);
    });

    // Gestione del clic su "Aggiorna Mappa"
    updateMapBtn.addEventListener('click', () => {
        const mapId = mapIdInput.value;
        if (mapId) updateMapDetails(mapId);
        else alert('Seleziona una mappa prima di aggiornarla!');
    });
});