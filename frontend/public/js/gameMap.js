document.addEventListener('DOMContentLoaded', () => 
    {
        const canvas = document.getElementById('map-canvas');
        const mapWrapper = document.getElementById('map-wrapper');
        const ctx = canvas.getContext('2d');

        const gridSize = 50; // Dimensione della cella della griglia
        let isDraggingMap = false; // Stato del trascinamento della mappa
        let dragMapStartX = 0; // Posizione iniziale X del drag della mappa
        let dragMapStartY = 0; // Posizione iniziale Y del drag della mappa
        let scale = 1; // Scala dello zoom
        const tokensOnMap = []; // Array per tenere traccia dei token sulla mappa
        //const mapId = sessionStorage.getItem('mapId'); // Ottieni l'ID della mappa dalla session storage
        let draggedToken = null; // Oggetto del token attualmente draggato sulla mappa (per spostamento singolo)
        let dragTokenOffsetX = 0; // Offset X del drag del token
        let dragTokenOffsetY = 0; // Offset Y del drag del token
        let isSelecting = false; // Stato della selezione multipla
        let selectStartX = 0; // Inizio X della selezione
        let selectStartY = 0; // Inizio Y della selezione
        let selectionRect = null; // Rettangolo di selezione
        let selectedTokens = []; // Array per tenere traccia dei token selezionati

        // Funzione per recuperare le informazioni di un token dal server
        async function fetchTokenDetails(tokenId) {
            const storedData = getStoredData();
            const userToken = storedData.token;
            try {
                const response = await fetch(`${BACKEND_URL}/tokenimages/${tokenId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Errore HTTP: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Errore durante il recupero dei dettagli del token:', error.message);
                return null;
            }
        }

        // Funzione per aggiungere un token alla mappa sul server
        async function addTokenToMap(tokenId, gridX, gridY) {
            const storedData = getStoredData();
            const userToken = storedData.token;
            const mapId = sessionStorage.getItem('mapId');
            try {
                const response = await fetch(`${BACKEND_URL}/maptokens/${mapId}/add-token`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tokenId: parseInt(tokenId),
                        x: gridX,
                        y: gridY,
                        width: 1, // Assumi larghezza 1 per ora
                        height: 1, // Assumi altezza 1 per ora
                        isVisible: true,
                    }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Errore HTTP: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Errore durante l\'aggiunta del token alla mappa:', error.message);
                return null;
            }
        }

        // Funzione per spostare un token sulla mappa sul server
        async function moveTokenOnMap(mapTokenId, gridX, gridY) {
            const storedData = getStoredData();
            const userToken = storedData.token;
            const mapId = sessionStorage.getItem('mapId');
            try {
                const response = await fetch(`${BACKEND_URL}/maptokens/${mapId}/token/${mapTokenId}/move`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        x: gridX,
                        y: gridY,
                    }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Errore HTTP: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Errore durante lo spostamento del token sulla mappa:', error.message);
                return null;
            }
        }

        function drawGrid() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            // La scala è già applicata dal wheel event
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1 / scale; // Adatta la larghezza della linea allo zoom

            for (let x = 0; x <= canvas.width; x += gridSize) { // Usa gridSize base
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            for (let y = 0; y <= canvas.height; y += gridSize) { // Usa gridSize base
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            ctx.restore();
        }

        function drawTokensOnMap() {
            // La scala è già applicata dal wheel event
            tokensOnMap.forEach(mapToken => {
                console.log('Disegno token in:', mapToken.x, mapToken.y);
        
                // Evidenzia la cella del token
                ctx.fillStyle = 'rgba(255, 255, 0, 0.3)'; // Giallo semitrasparente
                ctx.fillRect(mapToken.x * gridSize, mapToken.y * gridSize, gridSize, gridSize);
        
                const img = new Image();
                img.src = `${BACKEND_URL}/${mapToken.url}`; // Correzione qui
                img.onload = () => {
                    // Calcola un offset per centrare l'immagine (prova questi valori)
                    const offsetX = gridSize * 0.1; // 10% della dimensione della cella
                    const offsetY = gridSize * 0.1;
                    const scaledSize = gridSize * 0.8; // Riduci la dimensione dell'immagine
        
                    ctx.drawImage(
                        img,
                        mapToken.x * gridSize + offsetX,
                        mapToken.y * gridSize + offsetY,
                        scaledSize,
                        scaledSize
                    );
                };
        
                // Disegna un bordo di selezione
                if (mapToken.selected) {
                    ctx.strokeStyle = 'yellow';
                    ctx.lineWidth = 3 / scale; // Adatta la larghezza della linea allo zoom
                    ctx.strokeRect(
                        mapToken.x * gridSize,
                        mapToken.y * gridSize,
                        gridSize,
                        gridSize
                    );
                }
            });
        }

        function getGridCoordinates(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            // Ottieni le coordinate del mouse relative al viewport *meno* lo scroll del wrapper
            const scrollLeft = mapWrapper.scrollLeft;
            const scrollTop = mapWrapper.scrollTop;
            const canvasX = clientX - rect.left + scrollLeft;
            const canvasY = clientY - rect.top + scrollTop;
            // Applica l'inverso della scala per ottenere le coordinate nel sistema non scalato
            const worldX = canvasX / scale;
            const worldY = canvasY / scale;
            return {
                x: Math.floor(worldX / gridSize),
                y: Math.floor(worldY / gridSize),
            };
        }

        function getCanvasCoordinates(gridX, gridY) {
            return {
                x: gridX * gridSize * scale,
                y: gridY * gridSize * scale,
            };
        }

        function handleMapMouseMove(event) {
            if (!isDraggingMap) return;

            const deltaX = dragMapStartX - event.clientX;
            const deltaY = dragMapStartY - event.clientY;

            mapWrapper.scrollLeft += deltaX;
            mapWrapper.scrollTop += deltaY;

            dragMapStartX = event.clientX;
            dragMapStartY = event.clientY;

            drawGrid(); // Forza il ridisegno della griglia
        }

        canvas.addEventListener('mousedown', (event) => {
            if (event.button === 2) { // Tasto destro per il drag della mappa
                isDraggingMap = true;
                dragMapStartX = event.clientX;
                dragMapStartY = event.clientY;
                canvas.style.cursor = 'grabbing';
                isSelecting = false; // Annulla la selezione se si inizia a draggare la mappa
            } else if (event.button === 0) { // Tasto sinistro per selezione o drag singolo
                const gridCoords = getGridCoordinates(event.clientX, event.clientY);
                const clickedToken = tokensOnMap.find(
                    token => token.x === gridCoords.x && token.y === gridCoords.y
                );

                if (clickedToken && !isSelecting) {
                    // Inizia il drag di un singolo token
                    draggedToken = clickedToken;
                    canvas.style.cursor = 'grab';
                    const canvasCoords = getCanvasCoordinates(clickedToken.x, clickedToken.y);
                    const rect = canvas.getBoundingClientRect();
                    dragTokenOffsetX = (event.clientX - rect.left) - canvasCoords.x;
                    dragTokenOffsetY = (event.clientY - rect.top) - canvasCoords.y;
                } else {
                    // Inizia la selezione multipla
                    isSelecting = true;
                    selectStartX = event.clientX;
                    selectStartY = event.clientY;
                    selectionRect = { x: selectStartX, y: selectStartY, width: 0, height: 0 };
                    // Deseleziona i token precedenti se non si tiene premuto Shift (opzionale)
                    if (!event.shiftKey) {
                        tokensOnMap.forEach(token => token.selected = false);
                        selectedTokens = [];
                    }
                }
            }
        });

        document.addEventListener('mouseup', async (event) => {
            isDraggingMap = false;
            canvas.style.cursor = 'grab';

            if (draggedToken) {
                const gridCoords = getGridCoordinates(event.clientX, event.clientY);
                if (draggedToken.x !== gridCoords.x || draggedToken.y !== gridCoords.y) {
                    const movedToken = await moveTokenOnMap(draggedToken.mapTokenId, gridCoords.x, gridCoords.y);
                    if (movedToken) {
                        draggedToken.x = gridCoords.x;
                        draggedToken.y = gridCoords.y;
                        drawGrid();
                        drawTokensOnMap();
                    }
                }
                draggedToken = null;
            }

            if (isSelecting) {
                isSelecting = false;
                if (selectionRect && (selectionRect.width !== 0 || selectionRect.height !== 0)) {
                    const rect = canvas.getBoundingClientRect();
                    const startX = Math.min(selectStartX, event.clientX) - rect.left;
                    const startY = Math.min(selectStartY, event.clientY) - rect.top;
                    const endX = Math.max(selectStartX, event.clientX) - rect.left;
                    const endY = Math.max(selectStartY, event.clientY) - rect.top;

                    tokensOnMap.forEach(token => {
                        const tokenCanvasX = token.x * gridSize * scale;
                        const tokenCanvasY = token.y * gridSize * scale;

                        if (
                            tokenCanvasX < endX &&
                            tokenCanvasX + gridSize * scale > startX &&
                            tokenCanvasY < endY &&
                            tokenCanvasY + gridSize * scale > startY
                        ) {
                            token.selected = true;
                            if (!selectedTokens.includes(token)) {
                                selectedTokens.push(token);
                            }
                        } else if (!event.shiftKey) {
                            token.selected = false;
                            selectedTokens = selectedTokens.filter(t => t !== token);
                        }
                    });
                    selectionRect = null;
                    drawGrid();
                    drawTokensOnMap();
                }
            }
        });

        document.addEventListener('mousemove', (event) => {
            handleMapMouseMove(event);

            if (draggedToken) {
                const rect = canvas.getBoundingClientRect();
                const mouseCanvasX = event.clientX - rect.left;
                const mouseCanvasY = event.clientY - rect.top;

                // Calcola la nuova posizione del token in pixel basandosi sull'offset
                const tokenCanvasX = mouseCanvasX - dragTokenOffsetX;
                const tokenCanvasY = mouseCanvasY - dragTokenOffsetY;

                // Converti queste coordinate in coordinate della griglia
                const newGridX = Math.floor(tokenCanvasX / (gridSize * scale));
                const newGridY = Math.floor(tokenCanvasY / (gridSize * scale));

                // Aggiorna la posizione del draggedToken per il rendering visivo
                draggedToken.x = newGridX;
                draggedToken.y = newGridY;

                drawGrid();
                drawTokensOnMap();
                canvas.style.cursor = 'grabbing'; // Cambia l'icona del cursore durante il drag
            } else if (isSelecting && selectionRect) {
                selectionRect.width = event.clientX - selectStartX;
                selectionRect.height = event.clientY - selectStartY;
                drawGrid();
                drawTokensOnMap();
                // Disegna il rettangolo di selezione
                ctx.save();
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    selectionRect.x - canvas.getBoundingClientRect().left,
                    selectionRect.y - canvas.getBoundingClientRect().top,
                    selectionRect.width,
                    selectionRect.height
                );
                ctx.restore();
            } else {
                canvas.style.cursor = 'grab'; // Imposta il cursore predefinito se non si sta draggando o selezionando
            }
        });

        document.addEventListener('mouseleave', () => {
            isDraggingMap = false;
            canvas.style.cursor = 'grab';
            draggedToken = null;
            isSelecting = false;
            selectionRect = null;
        });

        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });

        mapWrapper.addEventListener('wheel', (event) => {
            event.preventDefault();

            const zoomStep = 0.1;
            const mouseX = event.clientX - mapWrapper.offsetLeft + mapWrapper.scrollLeft;
            const mouseY = event.clientY - mapWrapper.offsetTop + mapWrapper.scrollTop;

            const preScale = scale;

            if (event.deltaY < 0) {
                scale = Math.min(scale + zoomStep, 3);
            } else {
                scale = Math.max(scale - zoomStep, 0.5);
            }

            const scaleFactor = scale / preScale;

            // Calcola la nuova posizione del canvas per mantenere il punto sotto il mouse fermo
            const offsetX = (mouseX / scaleFactor) - mouseX;
            const offsetY = (mouseY / scaleFactor) - mouseY;

            // Applica la trasformazione
            ctx.translate(offsetX, offsetY);
            ctx.scale(scaleFactor, scaleFactor);

            drawGrid();
            drawTokensOnMap();
        });

        // Drag and drop dalla lista dei token
        canvas.addEventListener('dragover', (event) => {
            event.preventDefault(); // Permette di fare il drop
        });

        canvas.addEventListener('drop', async (event) => {
            event.preventDefault();
            const tokenId = event.dataTransfer.getData('text/plain');
            if (tokenId) {
                const gridCoords = getGridCoordinates(event.clientX, event.clientY);

                const addedTokenData = await addTokenToMap(tokenId, gridCoords.x, gridCoords.y);

                if (addedTokenData && addedTokenData.mapToken && addedTokenData.mapToken.id) {
                    const tokenDetails = await fetchTokenDetails(tokenId);
                    if (tokenDetails && tokenDetails.url) {
                        tokensOnMap.push({
                            mapTokenId: addedTokenData.mapToken.id,
                            tokenId: parseInt(tokenId),
                            url: tokenDetails.url,
                            x: gridCoords.x,
                            y: gridCoords.y,
                            selected: false // Inizialmente non selezionato
                        });
                        drawGrid();
                        drawTokensOnMap();
                    } else {
                        console.log('gameMap.js: fetchTokenDetails failed or missing url.');
                    }
                } else {
                    console.log('gameMap.js: addTokenToMap failed or missing mapToken.id.');
                }
            }
        });
        // Nuovo event listener per il click sul canvas
        canvas.addEventListener('click', (event) => {
            // Ottieni le coordinate della griglia al momento del click
            const gridCoords = getGridCoordinates(event.clientX, event.clientY);
            // Mostra un alert con le coordinate della cella
            alert(`Hai cliccato sulla cella: X = ${gridCoords.x}, Y = ${gridCoords.y}`);
        });

        // Drag and drop dalla lista dei token
        canvas.addEventListener('dragover', (event) => {
            event.preventDefault(); // Permette di fare il drop
        });

        canvas.addEventListener('drop', async (event) => {
            event.preventDefault();
            const tokenId = event.dataTransfer.getData('text/plain');
            if (tokenId) {
                const gridCoords = getGridCoordinates(event.clientX, event.clientY);

                const addedTokenData = await addTokenToMap(tokenId, gridCoords.x, gridCoords.y);

                if (addedTokenData && addedTokenData.mapToken && addedTokenData.mapToken.id) {
                    const tokenDetails = await fetchTokenDetails(tokenId);
                    if (tokenDetails && tokenDetails.url) {
                        tokensOnMap.push({
                            mapTokenId: addedTokenData.mapToken.id,
                            tokenId: parseInt(tokenId),
                            url: tokenDetails.url,
                            x: gridCoords.x,
                            y: gridCoords.y,
                            selected: false // Inizialmente non selezionato
                        });
                        drawGrid();
                        drawTokensOnMap();
                    } else {
                        console.log('gameMap.js: fetchTokenDetails failed or missing url.');
                    }
                } else {
                    console.log('gameMap.js: addTokenToMap failed or missing mapToken.id.');
                }
            }
        });

        // Spostamento dei token con le frecce
        document.addEventListener('keydown', async (event) => {
            if (selectedTokens.length > 0) {
                let moved = false;
                const deltaX = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
                const deltaY = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;

                if (deltaX !== 0 || deltaY !== 0) {
                    moved = true;
                    await Promise.all(selectedTokens.map(async (token) => {
                        const newX = token.x + deltaX;
                        const newY = token.y + deltaY;
                        const movedToken = await moveTokenOnMap(token.mapTokenId, newX, newY);
                        if (movedToken) {
                            token.x = newX;
                            token.y = newY;
                        }
                    }));
                    if (moved) {
                        drawGrid();
                        drawTokensOnMap();
                    }
                }
            }
        });
        // In gameMap.js
        function clearMap() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            tokensOnMap.length = 0;
        }
        // Funzione per caricare i token esistenti sulla mappa
        async function loadMapTokens(currentMapId) {
            console.log('gameMap.js: loadMapTokens chiamata con mapId:', currentMapId);
            if (!currentMapId) {
                console.warn('gameMap.js: loadMapTokens chiamata senza mapId.');
                return;
            }
            const storedData = getStoredData();
            const userToken = storedData.token;
            try {
                const response = await fetch(`${BACKEND_URL}/maptokens/${currentMapId}/tokens`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.tokens) {
                        const detailedTokens = await Promise.all(data.tokens.map(async (mapToken) => {
                            const tokenDetails = await fetchTokenDetails(mapToken.tokenId);
                            if (tokenDetails) {
                                return {
                                    mapTokenId: mapToken.id,
                                    tokenId: mapToken.tokenId,
                                    url: tokenDetails.url,
                                    x: mapToken.x,
                                    y: mapToken.y,
                                    selected: false // Inizialmente non selezionato
                                };
                            }
                            return null;
                        }));
                        tokensOnMap.length = 0; // Pulisci l'array dei token esistenti
                        tokensOnMap.push(...detailedTokens.filter(token => token !== null));
                        drawGrid();
                        drawTokensOnMap();
                    }
                } else {
                    console.error('gameMap.js: Errore durante il caricamento dei token della mappa:', response.status);
                }
            } catch (error) {
                console.error('gameMap.js: Errore durante il caricamento dei token della mappa:', error.message);
            }
        }

        window.clearMap = clearMap;
        window.loadMapTokens = loadMapTokens;
        // Inizializza il canvas
        canvas.width = 5000;
        canvas.height = 5000;
        drawGrid();

        // Carica i token   esistenti sulla mappa all'avvio
        // In fondo a gameMap.js
        if (sessionStorage.getItem('mapId')) {
            loadMapTokens(sessionStorage.getItem('mapId'));
        }
    }
);












