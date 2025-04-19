document.addEventListener('DOMContentLoaded', async () => {
    const tokensList = document.getElementById('tokens-list');
    const tokenPreviewContainer = document.getElementById('preview-container');
    const tokenPreview = document.getElementById('token-preview');
    const assignCategoryContainer = document.getElementById('assign-category-container');
    const categorySelect = document.getElementById('category-select');
    const assignCategoryBtn = document.getElementById('assign-category-btn');
    const storedData = getStoredData();
    const userToken = storedData.token;
    let selectedTokenId = null; // Variabile per memorizzare l'ID del token selezionato
    // Variabile globale per memorizzare l'ID del token che viene draggato
    let draggedTokenId = null;

    async function fetchCategories() {
        try {
            const response = await fetch(`${BACKEND_URL}/tokenimages/categories`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`, // Potrebbe essere necessario per recuperare le categorie
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante il recupero delle categorie.');
            }

            const categoriesData = await response.json();
            return categoriesData.categories || [];
        } catch (error) {
            console.error('❌ Errore durante il recupero delle categorie:', error.message);
            return [];
        }
    }

    function populateCategoryDropdown(categories) {
        categorySelect.innerHTML = '<option value="">Seleziona una categoria</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    async function onTokenClick(token) {
        tokenPreview.src = `${BACKEND_URL}/${token.url}`;
        tokenPreview.style.display = 'block';
        tokenPreviewContainer.style.display = 'flex'; // Mostra il riquadro
        assignCategoryContainer.style.display = 'block'; // Mostra il contenitore per assegnare la categoria
        selectedTokenId = token.id; // Memorizza l'ID del token selezionato

        try {
            const tokenInfoResponse = await fetch(`${BACKEND_URL}/tokenimages/${selectedTokenId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!tokenInfoResponse.ok) {
                const errorData = await tokenInfoResponse.json();
                console.error('Errore durante il recupero delle informazioni del token:', errorData.error || `Errore HTTP: ${tokenInfoResponse.status}`);
                // Potresti voler mostrare un messaggio all'utente
                return;
            }

            const tokenInfo = await tokenInfoResponse.json();

            // Resetta il menu a tendina
            categorySelect.innerHTML = '<option value="">Seleziona una categoria</option>';

            // Recupera nuovamente tutte le categorie per popolare il dropdown
            const categories = await fetchCategories();
            populateCategoryDropdown(categories);

            // Se il token ha una categoria assegnata, selezionala nel dropdown
            if (tokenInfo.categoryId) {
                categorySelect.value = tokenInfo.categoryId;
            }
        } catch (error) {
            console.error('Errore durante il recupero delle informazioni del token:', error.message);
            // Potresti voler mostrare un messaggio all'utente
        }
    }

    async function assignCategoryToToken() {
        if (!selectedTokenId) {
            alert('Nessun token selezionato.');
            return;
        }
        const categoryId = categorySelect.value;
        if (!categoryId) {
            alert('Seleziona una categoria.');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/tokenimages/${selectedTokenId}/assign-category`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ categoryId: parseInt(categoryId) }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante l\'assegnazione della categoria.');
            }

            const result = await response.json();
            alert(result.message);
            renderTokens(); // Ricarica i token per aggiornare la visualizzazione
            assignCategoryContainer.style.display = 'none'; // Nascondi il contenitore dopo l'assegnazione
            selectedTokenId = null; // Resetta l'ID del token selezionato
        } catch (error) {
            console.error('❌ Errore durante l\'assegnazione della categoria:', error.message);
            alert('Errore durante l\'assegnazione della categoria.');
        }
    }

    async function renderTokens() {
        tokensList.innerHTML = '';
        const storedData = getStoredData();
        const userId = storedData.userId;

        try {
            const categoriesResponse = await fetch(`${BACKEND_URL}/tokenimages/categories`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!categoriesResponse.ok) {
                const errorData = await categoriesResponse.json();
                throw new Error(errorData.error || 'Errore durante il recupero delle categorie.');
            }

            const categoriesData = await categoriesResponse.json();
            const categories = categoriesData.categories;

            for (const category of categories) {
                const categoryTokensResponse = await fetch(`${BACKEND_URL}/tokenimages/categories/${category.id}/users/${userId}/tokens`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (categoryTokensResponse.ok) {
                    const categoryTokensData = await categoryTokensResponse.json();
                    const tokens = categoryTokensData.tokens;

                    if (tokens && tokens.length > 0) {
                        const categoryContainer = document.createElement('div');
                        categoryContainer.classList.add('category-token-container');

                        const categoryTitle = document.createElement('h3');
                        categoryTitle.textContent = category.name;
                        categoryTitle.classList.add('category-title');
                        categoryContainer.appendChild(categoryTitle);

                        const tokenGrid = document.createElement('div');
                        tokenGrid.classList.add('token-grid');
                        tokenGrid.style.display = 'none'; // Inizialmente chiuso

                        tokens.forEach((token) => {
                            const tokenItem = document.createElement('div');
                            tokenItem.classList.add('token-item');
                            tokenItem.dataset.id = token.id;
                            tokenItem.draggable = true; // Rendi l'elemento draggable

                            let tokenUrl = token.url;
                            if (!tokenUrl.startsWith('http') && !tokenUrl.startsWith('/')) {
                                tokenUrl = `${BACKEND_URL}/${token.url}`;
                            }

                            const tokenImg = document.createElement('img');
                            tokenImg.src = tokenUrl;
                            tokenImg.alt = token.name;

                            const tokenName = document.createElement('span');
                            tokenName.textContent = token.name;
                            tokenName.style.fontSize = '0.9em'; // Font più piccolo

                            const tokenActionsContainer = document.createElement('div'); // Nuovo contenitore per i bottoni
                            tokenActionsContainer.classList.add('token-actions-container');

                            const modifyButton = document.createElement('i');
                            modifyButton.classList.add('fas', 'fa-edit');
                            modifyButton.title = 'Modifica';
                            modifyButton.style.fontSize = '1em'; // Bottoni più piccoli
                            modifyButton.addEventListener('click', (event) => {
                                event.stopPropagation(); // Impedisce l'attivazione dell'onTokenClick sul token-item
                                modifyToken(token.id);
                            });

                            const deleteButton = document.createElement('i');
                            deleteButton.classList.add('fas', 'fa-trash');
                            deleteButton.title = 'Elimina';
                            deleteButton.style.fontSize = '1em'; // Bottoni più piccoli
                            deleteButton.addEventListener('click', (event) => {
                                event.stopPropagation(); // Impedisce l'attivazione dell'onTokenClick sul token-item
                                deleteToken(token.id);
                            });

                            tokenActionsContainer.appendChild(modifyButton);
                            tokenActionsContainer.appendChild(deleteButton);

                            tokenItem.appendChild(tokenImg);
                            tokenItem.appendChild(tokenName);
                            tokenItem.appendChild(tokenActionsContainer);

                            tokenItem.addEventListener('click', () => onTokenClick(token));

                            // In gameTokens.js, all'interno del ciclo forEach che crea i token:
                            tokenItem.addEventListener('dragstart', (event) => {
                                console.log('gameTokens.js: Drag start initiated for token ID:', token.id);
                                draggedTokenId = token.id; // Memorizza l'ID del token draggato
                                event.dataTransfer.setData('text/plain', token.id); // Passa l'ID come dato
                                console.log('gameTokens.js: DataTransfer set:', event.dataTransfer.getData('text/plain'));
                            });

                            tokenGrid.appendChild(tokenItem);
                        });
                        categoryContainer.appendChild(tokenGrid);
                        tokensList.appendChild(categoryContainer);

                        // Aggiungi la funzionalità di toggle al titolo della categoria
                        categoryTitle.addEventListener('click', () => {
                            tokenGrid.style.display = tokenGrid.style.display === 'grid' ? 'none' : 'grid';
                        });
                    }
                } else if (categoryTokensResponse.status === 404) {
                    // Nessun token trovato per questa categoria e utente, non fare nulla
                    console.warn(`Nessun token trovato per la categoria "${category.name}" e l'utente ${userId}.`);
                } else {
                    const errorData = await categoryTokensResponse.json();
                    console.error(`Errore durante il recupero dei token per la categoria "${category.name}" e l'utente ${userId}:`, errorData.error || `Errore HTTP: ${categoryTokensResponse.status}`);
                }
            }

        } catch (error) {
            console.error('❌ Errore durante il recupero e la visualizzazione dei token per categoria:', error.message);
            tokensList.innerHTML = '<p>Errore durante il caricamento dei token.</p>';
        }
    }

    async function deleteToken(tokenId) {
        if (!confirm('Sei sicuro di voler eliminare questo token?')) return;

        try {
            const response = await fetch(`${BACKEND_URL}/tokenimages/${tokenId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${userToken}` },
            });

            if (!response.ok) throw new Error((await response.json()).message);

            alert('Token eliminato con successo.');
            renderTokens(); // Ricarica i token per aggiornare la visualizzazione
        } catch (error) {
            console.error(error);
            alert('Errore durante l\'eliminazione del token.');
        }
    }

    async function modifyToken(tokenId) {
        const newName = prompt('Inserisci il nuovo nome per il token:');
        if (!newName) return;

        try {
            const response = await fetch(`${BACKEND_URL}/tokenimages/${tokenId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName }),
            });

            if (!response.ok) throw new Error((await response.json()).message);

            alert('Token modificato con successo!');
            renderTokens(); // Ricarica i token per aggiornare la visualizzazione
        } catch (error) {
            console.error(error);
            alert('Errore durante la modifica del token.');
        }
    }

    async function uploadSingleToken() {
        const name = document.getElementById('single-token-name').value.trim();
        const file = document.getElementById('single-token-file').files[0];
        if (!name || !file) return alert('Inserisci nome e file.');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('tokenImage', file);

        try {
            const response = await fetch(`${BACKEND_URL}/tokenimages/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${userToken}` },
                body: formData,
            });

            if (!response.ok) throw new Error((await response.json()).message);

            alert('Token caricato!');
            renderTokens(); // Ricarica i token per aggiornare la visualizzazione
        } catch (error) {
            console.error(error);
            alert('Errore durante il caricamento.');
        }
    }

    async function uploadMultipleTokens() {
        const files = document.getElementById('multiple-token-files').files;
        if (!files.length) return alert('Seleziona almeno un file.');

        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('tokenImages', file));

        try {
            const response = await fetch(`${BACKEND_URL}/tokenimages/upload-multiple`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${userToken}` },
                body: formData,
            });

            if (!response.ok) throw new Error((await response.json()).message);

            alert('Token multipli caricati!');
            renderTokens(); // Ricarica i token per aggiornare la visualizzazione
        } catch (error) {
            console.error(error);
            alert('Errore durante il caricamento multiplo.');
        }
    }

    document.getElementById('toggle-upload-single').addEventListener('click', () => {
        const container = document.getElementById('upload-single');
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('toggle-upload-multiple').addEventListener('click', () => {
        const container = document.getElementById('upload-multiple');
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('upload-single-btn').addEventListener('click', uploadSingleToken);
    document.getElementById('upload-multiple-btn').addEventListener('click', uploadMultipleTokens);

    // Inizializzazione: recupera le categorie e popola il dropdown
    fetchCategories().then(populateCategoryDropdown);
    renderTokens();

    // Event listener per il pulsante di assegnazione della categoria
    assignCategoryBtn.addEventListener('click', assignCategoryToToken);
});