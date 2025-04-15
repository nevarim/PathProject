document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Rimuovi la classe active da tutti i bottoni
            tabButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active'); // Aggiungi la classe active al tab corrente

            const selectedTab = button.getAttribute('data-tab');

            // Mostra il contenuto della tab selezionata
            tabContents.forEach((content) => {
                content.classList.remove('active');
                if (content.getAttribute('data-tab') === selectedTab) {
                    content.classList.add('active');
                }
            });
        });
    });
});