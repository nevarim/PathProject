document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');

    const mapWidthInput = document.getElementById('map-width');
    const mapHeightInput = document.getElementById('map-height');
    const gridCellSizeInput = document.getElementById('grid-cell-size');
    const applyConfigBtn = document.getElementById('apply-config-btn');

    // Variabile globale per l'immagine caricata
    let currentImage = null;

    // Imposta dimensioni iniziali del canvas per adattarsi al container
    function setCanvasSize(width = canvas.offsetWidth, height = canvas.offsetHeight) {
        canvas.width = width;
        canvas.height = height;
    }
    setCanvasSize();

    // Funzione per disegnare la mappa caricata
    function drawMap(file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            currentImage = img; // Salva l'immagine globalmente
            redrawCanvas(gridCellSizeInput.value || 50); // Ridisegna il canvas con la griglia
        };
    }

    // Funzione per disegnare la griglia sopra la mappa
    function drawGrid(gridSize = 50) {
        ctx.strokeStyle = '#4caf50'; // Colore della griglia
        ctx.lineWidth = 0.5;

        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // Funzione per ridisegnare il canvas (immagine + griglia)
    function redrawCanvas(gridSize = 50) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Pulisce il canvas

        if (currentImage) {
            // Calcola il ridimensionamento proporzionale
            const scale = Math.min(canvas.width / currentImage.width, canvas.height / currentImage.height);
            const width = currentImage.width * scale;
            const height = currentImage.height * scale;
            const xOffset = (canvas.width - width) / 2;
            const yOffset = (canvas.height - height) / 2;

            ctx.drawImage(currentImage, xOffset, yOffset, width, height); // Disegna l'immagine
        }

        drawGrid(gridSize); // Disegna la griglia sopra l'immagine
    }

    // Gestione Drag-and-Drop per il caricamento della mappa
    canvas.addEventListener('dragover', (event) => {
        event.preventDefault();
        canvas.style.border = '2px dashed #4caf50'; // Indicazione visiva
    });

    canvas.addEventListener('dragleave', () => {
        canvas.style.border = 'none'; // Ripristina lo stile
    });

    canvas.addEventListener('drop', (event) => {
        event.preventDefault();
        canvas.style.border = 'none';

        const files = event.dataTransfer.files;
        if (files.length === 0) {
            alert('Non hai trascinato alcun file!');
            return;
        }

        const file = files[0]; // Accetta il primo file trascinato
        if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
            alert('Devi caricare solo file PNG o JPG!');
            return;
        }

        drawMap(file); // Disegna la mappa sul canvas
    });

    // Funzione per applicare la configurazione
    function applyConfiguration() {
        const mapWidth = parseInt(mapWidthInput.value, 10) || canvas.width;
        const mapHeight = parseInt(mapHeightInput.value, 10) || canvas.height;
        const gridSize = parseInt(gridCellSizeInput.value, 10) || 50;

        // Aggiorna dimensioni del canvas
        setCanvasSize(mapWidth, mapHeight);

        // Ridisegna il canvas con l'immagine e la nuova griglia
        redrawCanvas(gridSize);

        console.log(`✔ Configurazione applicata: Larghezza = ${mapWidth}px, Altezza = ${mapHeight}px, Cella Griglia = ${gridSize}px`);
    }

    // Event listener per il pulsante "Applica Configurazione"
    applyConfigBtn.addEventListener('click', applyConfiguration);

    // Assicurati che il canvas si ridimensioni se la finestra cambia dimensione
    window.addEventListener('resize', () => {
        setCanvasSize();
        redrawCanvas(gridCellSizeInput.value || 50); // Usa la dimensione della griglia corrente
    });

    // Disegna la griglia iniziale
    redrawCanvas(50); // Dimensione predefinita della griglia
});