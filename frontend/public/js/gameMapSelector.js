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

            renderMaps(data.maps); // Mostra i riquadri delle mappe
        } catch (error) {
            console.error('❌ Errore durante il recupero delle mappe:', error);
            renderAddMapButton(); // Nessuna mappa trovata
        }
    }

    // Funzione per generare i riquadri delle mappe
    function renderMaps(maps) {
        mapsContainer.innerHTML = ''; // Pulizia container
        if (maps.length === 0) {
            renderAddMapButton(); // Mostra pulsante "Aggiungi Mappa" se non ci sono mappe
            return;
        }

        maps.forEach((map) => {
            const mapCard = document.createElement('div');
            mapCard.classList.add('map-card');

            const mapImage = document.createElement('img');
            mapImage.src = `${backendUrl}/${map.filePath}`;
            mapImage.alt = map.name;

            mapCard.appendChild(mapImage);

            mapCard.addEventListener('click', () => {
                alert(`Hai selezionato la mappa: ${map.name}`);
            });

            mapsContainer.appendChild(mapCard);
        });
    }

    // Funzione per aggiungere il pulsante "+" quando non ci sono mappe
    function renderAddMapButton() {
        mapsContainer.innerHTML = ''; // Pulizia container

        const addButton = document.createElement('div');
        addButton.classList.add('add-map-btn');
        addButton.textContent = '+';

        addButton.addEventListener('click', () => {
            alert('Aggiungi una nuova mappa qui!');
        });

        mapsContainer.appendChild(addButton);
    }

    // Recupera la lista delle mappe quando la pagina viene caricata
    fetchMaps(roomId);
});