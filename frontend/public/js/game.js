function toggleGameMapSelector() {
    const gameMapSelector = document.getElementById('gameMapSelector');

    if (gameMapSelector.style.top === '0px') {
        gameMapSelector.style.top = '-400px'; // Nascondi il div
    } else {
        gameMapSelector.style.top = '0px'; // Mostra il div
    }
}