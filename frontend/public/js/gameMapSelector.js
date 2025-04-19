document.addEventListener('DOMContentLoaded', () => {
    const mapsContainer = document.getElementById('maps-container');
    const backendUrl = window.CONFIG.BACKEND_URL; // Backend URL
    const userToken = getStoredData().token; // Recupera il token dell'utente
    const roomId = getStoredData().roomId; // ID della stanza corrente

    // Funzione per recuperare la lista delle mappe
    async function fetchMaps(roomId) {
        try {
            const response = await fetch(`${backendUrl}/map/list/${roomId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
            if (!response.ok) throw new Error(`Errore ${response.status}: ${await response.text()}`);

            const data = await response.json();
            console.log('✔ Mappe Recuperate:', data.maps);

            renderMaps(data.maps); // Mostra mappe e il tasto "+"
        } catch (error) {
            console.error('❌ Errore durante il recupero delle mappe:', error);
            renderAddMapButton(); // Mostra solo il tasto "+" in caso di errore
        }
    }

    // Funzione per generare la griglia di mappe
    function renderMaps(maps) {
        mapsContainer.innerHTML = ''; // Pulisce il contenitore

        if (maps.length === 0) {
            renderAddMapButton(); // Mostra solo il pulsante "+" se non ci sono mappe
            return;
        }

        // Genera un riquadro per ogni mappa
        maps.forEach((map) => {
            const mapCard = document.createElement('div');
            mapCard.classList.add('map-card');

            const mapImage = document.createElement('img');
            mapImage.src = `${backendUrl}/${map.filePath}`;
            mapImage.alt = map.name;

            mapCard.appendChild(mapImage);

            // Aggiungi comportamento al click della mappa
            mapCard.addEventListener('click', async () => {
                alert(`Hai selezionato la mappa: ${map.name}`);
                sessionStorage.setItem('mapId', map.id);
            
                // Pulisci la mappa precedente
                window.clearMap(); // Assumendo che clearMap sia globale
            
                const mapId = map.id; // Recupera l'ID della mappa
                const backendUrl = window.CONFIG.BACKEND_URL; // Backend URL
                const userToken = getStoredData().token; // Recupera il token dell'utente
            
                try {
                    // Effettua la richiesta per ottenere i dettagli della mappa
                    const response = await fetch(`${backendUrl}/map/${mapId}`, { // URL CORRETTO
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${userToken}`,
                        },
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('❌ Errore durante il recupero dei dettagli della mappa:', errorData);
                        throw new Error(errorData.message || 'Errore durante il recupero della mappa.');
                    }
            
                    const mapData = await response.json(); // Ottieni i dati della mappa
                    console.log('✔ Dettagli Mappa Recuperati:', mapData);
            
                    // Chiama la funzione per compilare dinamicamente i dettagli
                    chargeMapDetails(mapData.map);
            
                    // Carica i token per la nuova mappa
                    window.loadMapTokens(mapId); // Assumendo che loadMapTokens sia globale
            
                } catch (error) {
                    console.error('❌ Errore durante il caricamento dei dettagli della mappa:', error.message);
                    alert(`Errore: ${error.message}. Riprova.`);
                }
            });


            mapsContainer.appendChild(mapCard);
        });

        // Aggiungi il pulsante "+" come ultimo elemento
        renderAddMapButton();
    }

    // Funzione per creare il pulsante "+"
    function renderAddMapButton() {
        const addButton = document.createElement('div');
        addButton.classList.add('add-map-btn');
        addButton.textContent = '+';

        // Al click sul tasto "+", richiama la funzione esterna
        addButton.addEventListener('click', onCreateMapPopup);

        mapsContainer.appendChild(addButton);
    }

    // Recupera la lista delle mappe al caricamento della pagina
    fetchMaps(roomId);
});

function chargeMapDetails(map) {
    // Compila la schermata dei dettagli della mappa
    document.getElementById('map-id').value = map.id || '';
    document.getElementById('map-name').value = map.name || '';
    document.getElementById('map-description').value = map.description || '';
    document.getElementById('map-size').value = map.mapSize || '';
    document.getElementById('grid-size').value = map.gridSize || '';
    document.getElementById('visibility').value =
        map.isVisibleToPlayers !== undefined ? map.isVisibleToPlayers.toString() : 'false';
}