Metodo: POST
URL: http://loki:3000/register
Headers:
Content-Type: multipart/form-data


Body: Imposta il corpo della richiesta come form-data con i seguenti campi:
- username: Inserisci il nome utente desiderato (ad esempio, testuser).
- password: Inserisci una password valida (ad esempio, password123).
- avatar: Carica un file immagine (ad esempio, profile.jpg). Questo campo è opzionale.


Esempio di Corpo della Richiesta
Quando invii la richiesta tramite Postman con i dati necessari, il corpo potrebbe apparire così (formattato come form-data):
| Key | Value | Type | 
| username | testuser | Text | 
| password | password123 | Text | 
| avatar | profile.jpg | File | 



Risposta Attesa
Se la registrazione ha successo, la risposta sarà simile a questa:
{
    "message": "Utente registrato con successo!",
    "user": {
        "id": 1,
        "username": "testuser",
        "avatar": "http://loki:3000/images/avatars/resized-profile.jpg",
        "createdAt": "2025-04-15T12:00:00.000Z",
        "updatedAt": "2025-04-15T12:00:00.000Z",
        "isTemporary": true
    }
}



Possibili Errori
- Se l'utente esiste già:{
    "error": "L'utente esiste già. Scegli un nome utente diverso."
}

- Errore durante il caricamento dell'immagine:{
    "error": "Formato immagine non valido. Usa PNG o JPEG."
}

- Errore generico del server:{
    "error": "Errore durante la registrazione.",
    "details": "Descrizione dell'errore specifico."
}




Metodo: GET
URL: http://loki:3000/user/userInfo/nevarim
Headers: Nessuno obbligatorio.

Esempio di Risposta JSON
{
    "message": "Informazioni utente recuperate con successo.",
    "user": {
        "id": 1,
        "username": "nevarim",
        "displayName": "Nevarim",
        "email": "nevarim@example.com",
        "avatar": "http://loki:3000/images/avatars/2/avatar-resized.png",
        "lastLogin": "2025-04-09T10:23:45Z",
        "preferredLanguage": "en",
        "chatColor": "#000000",
        "friendsList": [
            {
                "id": 3,
                "username": "friend1"
            }
        ],
        "blockedUsers": [],
        "biography": "Lorem ipsum dolor sit amet.",
        "theme": "dark",
        "xp": 1234,
        "achievements": ["First Login", "Master Explorer"],
        "twoFactorEnabled": true,
        "ipLog": [
            "192.168.0.1",
            "192.168.1.5"
        ],
        "isBanned": false,
        "createdAt": "2025-04-01T08:00:00Z",
        "updatedAt": "2025-04-09T10:23:45Z"
    }
}



Error Handling
- Utente Non Trovato:{
    "error": "Utente non trovato."
}

- Errore Interno al Server:{
    "error": "Errore durante il recupero delle informazioni utente.",
    "details": "Messaggio dell'errore specifico."
}







Login
Metodo: POST
URL: http://localhost:3000/user/login
Headers:
Content-Type: application/json
Body:
{
    "message": "Login effettuato con successo.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "avatarUrl": "http://loki:3000/uploads/avatars/default-avatar.jpg"
}

Logout
Metodo: POST
URL: http://localhost:3000/user/logout
Headers:
Authorization: Bearer ilTokenRicevutoDalLogin
Content-Type: application/json
Body:
Vuoto



Get Token
Metodo: POST
URL: http://localhost:3000/user/get-token
Headers:
Content-Type: application/json
Body:
{
"username": "tuoUsername"
}

Status dell Utente
Metodo: GET
URL: http://localhost:3000/user/status/tuoUsername
Headers:
Authorization: Bearer ilTokenRicevutoDalLogin
Body:
Vuoto
response
{
    "message": "Status dell'utente recuperato con successo.",
    "user": {
        "id": 2,
        "username": "nevarim",
        "avatar": "http://localhost:3000/images/avatars/resized-123456789-avatar.png",
        "isTemporary": false,
        "createdAt": "2025-04-05T00:30:02.000Z",
        "updatedAt": "2025-04-07T16:32:47.000Z"
    }
}


Metodo: PUT
URL: http://localhost:3000/user/update-avatar
Headers:
Authorization: Bearer ilTokenRicevutoDalLogin
Body:
avatar formato File
response
{
    "message": "Avatar aggiornato con successo.",
    "avatar": "http://localhost:3000/images/avatars/resized-123456789-avatar.png"
}


------------------------------

Metodo: PUT
URL: http://loki:3000/user/update-profile/:id
Headers:
Authorization: Bearer <token>
Content-Type: application/json


Body (JSON):
{
    "username": "nuovo_username",
    "displayName": "Nuovo Nome",
    "biography": "Questa è la mia biografia aggiornata",
    "avatar": "avatars/1/new-avatar.png",
    "preferredLanguage": "it",
    "chatColor": "#FF5733",
    "theme": "light"
}



Esempio di Risposta Attesa
{
    "message": "Profilo aggiornato con successo.",
    "user": {
        "id": 1,
        "username": "nuovo_username",
        "displayName": "Nuovo Nome",
        "biography": "Questa è la mia biografia aggiornata",
        "avatar": "http://loki:3000/images/avatars/1/new-avatar.png",
        "preferredLanguage": "it",
        "chatColor": "#FF5733",
        "theme": "light",
        "createdAt": "2025-04-15T12:00:00.000Z",
        "updatedAt": "2025-04-15T12:00:00.000Z"
    }
}



Note
- Campi Protetti: Gli unici campi non modificabili sono email e id.
- Autenticazione: Richiede un token JWT valido per garantire la sicurezza.
- Campi Opzionali: Solo i campi forniti nel corpo della richiesta saranno aggiornati.


-------------------------


- Cancella Account
Metodo: DELETE
URL: http://loki:3000/user/delete
Headers:
Authorization: Bearer il-tuo-token


- Recupera Lista di Amici
Metodo: GET
URL: http://loki:3000/user/friends
Headers:
Authorization: Bearer il-tuo-token


- Aggiorna Tema Preferito
Metodo: PUT
URL: http://loki:3000/user/update-theme
Headers:
Content-Type: application/json
Authorization: Bearer il-tuo-token
Body:
{
"theme": "dark"
}


- Controllo dello Stato di Banned
Metodo: GET
URL: http://loki:3000/user/is-banned
Headers:
Author

















Creazione di una stanza
Metodo: POST
URL: http://localhost:3000/room
Headers:
Authorization: Bearer ilTokenRicevutoDalLogin
Content-Type: multipart/form-data
Body:
name: nomeDellaStanza
description: descrizioneDellaStanza
cover: File immagine selezionato dal tuo computer (jpeg o png)

Aggiornamento della cover di una stanza
Metodo: POST
URL: http://localhost:3000/room/roomId/update-cover
Headers:
Authorization: Bearer ilTokenRicevutoDalLogin
Content-Type: multipart/form-data
Body:
cover: File immagine selezionato dal tuo computer (jpeg o png)

Entrare in una stanza
Metodo: POST
URL: http://localhost:3000/room/roomId/join
Headers:
Authorization: Bearer ilTokenRicevutoDalLogin
Content-Type: application/json
Body:
Vuoto

Uscire da una stanza
Metodo: DELETE
URL: http://localhost:3000/room/roomId/leave
Headers:
Authorization: Bearer ilTokenRicevutoDalLogin
Content-Type: application/json
Body:
Vuoto

Espellere un utente da una stanza
Metodo: DELETE
URL: http://localhost:3000/room/roomId/kick/userId
Headers:
Authorization: Bearer ilTokenRicevutoDalLogin
Content-Type: application/json
Body:
Vuoto


Rotta GM
Metodo: GET
URL: http://loki:3000/room/gm
Headers:
Authorization: Bearer il-tuo-token
Parametri: Nessuno nel corpo della richiesta. Il token di autenticazione è obbligatorio.

Risposta:
Esempio di risposta JSON:
{
    "message": "Lista delle stanze di cui sei GM recuperata con successo.",
    "rooms": [
        {
            "id": 1,
            "name": "Stanza GM",
            "description": "Descrizione della stanza GM",
            "cover": "images/covers/room1-cover.png",
            "originalCover": "images/covers/room1-original.png",
            "createdBy": 2,
            "createdAt": "2025-04-09T12:00:00Z",
            "updatedAt": "2025-04-09T12:00:00Z",
            "resizedCover": "http://loki:3000/images/covers/room1-cover.png",
            "originalCover": "http://loki:3000/images/covers/room1-original.png",
            "participants": [
                {
                    "id": 3,
                    "username": "player1",
                    "role": "player"
                },
                {
                    "id": 4,
                    "username": "player2",
                    "role": "gm"
                }
            ]
        }
    ]
}

Rotta Player
Metodo: GET
URL: http://loki:3000/room/player
Headers:
Authorization: Bearer il-tuo-token
Parametri: Nessuno nel corpo della richiesta. Il token di autenticazione è obbligatorio.

Risposta:
Esempio di risposta JSON:
{
    "message": "Lista delle stanze di cui sei Player recuperata con successo.",
    "rooms": [
        {
            "id": 2,
            "name": "Stanza Player",
            "description": "Descrizione della stanza Player",
            "cover": "images/covers/room2-cover.png",
            "originalCover": "images/covers/room2-original.png",
            "createdAt": "2025-04-09T14:00:00Z",
            "updatedAt": "2025-04-09T14:00:00Z",
            "resizedCover": "http://loki:3000/images/covers/room2-cover.png",
            "originalCover": "http://loki:3000/images/covers/room2-original.png",
            "participants": [
                {
                    "id": 5,
                    "username": "player3",
                    "role": "player"
                },
                {
                    "id": 6,
                    "username": "player4",
                    "role": "player"
                }
            ]
        }
    ]
}






























Endpoint: PUT http://localhost:3000/room/:idroom/editRoom
Metodo: PUT
Headers:
Authorization: Bearer <your_token>

Body:
name(facoltativo): Nuovo nome della stanza.
description  (facoltativo): Nuova descrizione della stanza.
cover (facoltativo): Nuova immagine della cover.

risposta: dettagli aggiornati della camera




Metodo: GET
URL: http://loki:3000/room/1/loadRoom
Headers:
Authorization: Bearer <token>



Esempio di Risposta JSON
{
    "message": "Dati della stanza recuperati con successo.",
    "room": {
        "id": 1,
        "name": "Stanza Test",
        "description": "Questa è una stanza di esempio.",
        "originalCover": "http://loki:3000/images/covers/1_room.jpg",
        "resizedCover": "http://loki:3000/images/covers/1_room_resized.jpg",
        "createdBy": 1,
        "createdAt": "2025-04-15T10:00:00.000Z",
        "updatedAt": "2025-04-15T11:00:00.000Z"
    }
}



Gestione degli Errori
- Stanza Non Trovata:{
    "error": "Stanza non trovata."
}

- Accesso Negato:{
    "error": "Accesso negato alla stanza."
}

- Errore Interno al Server:{
    "error": "Errore durante il caricamento della stanza.",
    "details": "Messaggio dell'errore specifico."
}







gestione chat

GET Request
Metodo: GET
URL: http://localhost:3000/chat/:roomId
Sostituisci :roomId con l'ID della stanza, ad esempio 1
Esempio:
URL: http://localhost:3000/chat/1
Risultato atteso:
Un array di messaggi ordinati per data:
[id: 1, roomId: 1, userId: 2, message: Ciao a tutti!, createdAt: 2025-04-08T10:00:00.000Z]
[id: 2, roomId: 1, userId: 3, message: Benvenuto!, createdAt: 2025-04-08T10:05:00.000Z]

POST Request
Metodo: POST
URL: http://localhost:3000/chat/
Body:
roomId: 1,
userId: 2,
message: Questo è un nuovo messaggio.
Esempio Body:
roomId: 1,
userId: 2,
message: Ciao, come va
Risultato atteso:
[id: 3, roomId: 1, userId: 2, message: Ciao, come va, createdAt: 2025-04-08T10:10:00.000Z]





***************************************************


token


1. Caricamento del Token
Metodo: POST
URL: http://loki:3000/tokenimages/upload
Headers:
Authorization: Bearer <token>
Content-Type: multipart/form-data


Body (form-data): | Key         | Value               | Type  | |-------------|---------------------|-------| | name        | Nome del Token      | Text  | | tokenImage  | immagine.png/jpg    | File  |
Risposta Attesa:
{
    "message": "Token caricato con successo!",
    "token": {
        "id": 1,
        "url": "tokens/2/resized-immagine.png",
        "name": "Nome-del-Token",
        "createdAt": "2025-04-15T12:00:00.000Z",
        "updatedAt": "2025-04-15T12:00:00.000Z",
        "userId": 2
    }
}



2. Ottenere la Lista dei Token dell'Utente
Metodo: GET
URL: http://loki:3000/tokenimages/user-tokens
Headers:
Authorization: Bearer <token>


Risposta Attesa:
[
    {
        "id": 1,
        "url": "tokens/2/resized-immagine.png",
        "name": "Nome-del-Token",
        "createdAt": "2025-04-15T12:00:00.000Z",
        "updatedAt": "2025-04-15T12:00:00.000Z",
        "userId": 2
    }
]



3. Ottenere Dettagli di un Token
Metodo: GET
URL: http://loki:3000/tokenimages/1
Headers:
Authorization: Bearer <token>


Risposta Attesa:
{
    "id": 1,
    "url": "tokens/2/resized-immagine.png",
    "name": "Nome-del-Token",
    "createdAt": "2025-04-15T12:00:00.000Z",
    "updatedAt": "2025-04-15T12:00:00.000Z",
    "userId": 2
}



4. Modificare un Token
Metodo: PUT
URL: http://loki:3000/tokenimages/1
Headers:
Authorization: Bearer <token>
Content-Type: application/json


Body (JSON):
{
    "name": "Nuovo-Nome-del-Token"
}


Risposta Attesa:
{
    "message": "Token aggiornato con successo.",
    "token": {
        "id": 1,
        "url": "tokens/2/resized-immagine.png",
        "name": "Nuovo-Nome-del-Token",
        "createdAt": "2025-04-15T12:00:00.000Z",
        "updatedAt": "2025-04-15T12:30:00.000Z",
        "userId": 2
    }
}



5. Cancellare un Token
Metodo: DELETE
URL: http://loki:3000/tokenimages/1
Headers:
Authorization: Bearer <token>


Risposta Attesa:
{
    "message": "Token eliminato con successo."
}



6. Contare i Token dell'Utente
Metodo: GET
URL: http://loki:3000/tokenimages/count
Headers:
Authorization: Bearer <token>


Risposta Attesa:
{
    "count": 1
}




Metodo: POST
URL: http://loki:3000/tokenimages/upload-multiple

Headers:
Authorization: Bearer <token>
Content-Type: multipart/form-data



Body (form-data): | Key       | Value             | Type | |----------------|-----------------------|----------| | tokenImages    | immagine1.png/jpg     | File     | | tokenImages    | immagine2.png/jpg     | File     | | tokenImages    | immagine3.png/jpg     | File     |

Risultato Atteso
Se il caricamento ha successo, la risposta sarà simile a questa:
{
    "message": "Token multipli caricati con successo!",
    "tokens": [
        {
            "id": 1,
            "url": "http://loki:3000/images/tokens/2/1678900000-immagine1.png",
            "name": "Temporary-1678900000",
            "createdAt": "2025-04-15T12:00:00.000Z",
            "updatedAt": "2025-04-15T12:00:00.000Z",
            "userId": 2
        },
        {
            "id": 2,
            "url": "http://loki:3000/images/tokens/2/1678900100-immagine2.jpg",
            "name": "Temporary-1678900100",
            "createdAt": "2025-04-15T12:01:00.000Z",
            "updatedAt": "2025-04-15T12:01:00.000Z",
            "userId": 2
        },
        {
            "id": 3,
            "url": "http://loki:3000/images/tokens/2/1678900200-immagine3.png",
            "name": "Temporary-1678900200",
            "createdAt": "2025-04-15T12:02:00.000Z",
            "updatedAt": "2025-04-15T12:02:00.000Z",
            "userId": 2
        }
    ]
}



Punti Importanti
- Numero di File: Puoi caricare fino a 10 file contemporaneamente.
- Header Authorization: Il token è essenziale per autenticare la richiesta.
- Nome Temporaneo: I token ricevono un nome temporaneo (es. Temporary-<timestamp>).


------------------------------------------


1. Aggiungi un Token a una Mappa
Metodo: POST
URL: http://<tuo_server>/api/map-tokens/:mapId/add-token
Headers:
Authorization: Bearer <token>
Content-Type: application/json


Body (JSON):
{
    "tokenId": 1,
    "x": 3,
    "y": 5,
    "width": 1,
    "height": 1,
    "isVisible": true
}


Risultato Atteso:
- Token aggiunto alla mappa con successo.
- Il server risponde con i dettagli del token aggiunto.


2. Recupera i Token di una Mappa
Metodo: GET
URL: http://<tuo_server>/api/map-tokens/:mapId/tokens
Headers:
Authorization: Bearer <token>


Risultato Atteso:
- Elenco di tutti i token associati alla mappa specificata.
- La risposta include informazioni come id, url, name, e posizione.


3. Sposta un Token sulla Griglia
Metodo: PUT
URL: http://<tuo_server>/api/map-tokens/:mapId/token/:mapTokenId/move
Headers:
Authorization: Bearer <token>
Content-Type: application/json


Body (JSON):
{
    "x": 7,
    "y": 9
}




Aggiunta o Aggiornamento di una Mappa
Metodo: POST
URL: /map/upload
Headers:
Authorization: Bearer <token>
Content-Type: multipart/form-data


Body (form-data):
map: [file] (scegli un file da caricare)
name: Nome della mappa (es. "Dungeon 1")
description: Descrizione della mappa (es. "Una mappa del dungeon sotterraneo")
roomId: ID della stanza (es. "1")
mapSize: Dimensione della mappa (es. "1000x800")
gridSize: Dimensione della griglia (es. "50x50")



Esempio di Risultato Atteso
Mappa Nuova
{
    "message": "Mappa caricata e registrata con successo!",
    "map": {
        "id": 1,
        "userId": 2,
        "roomId": 1,
        "filePath": "images/maps/2/1/Dungeon.png",
        "name": "Dungeon",
        "description": "Una mappa del dungeon sotterraneo",
        "mapSize": "1000x800",
        "gridSize": "50x50",
        "isVisibleToPlayers": true,
        "createdAt": "2025-04-15T10:00:00.000Z",
        "updatedAt": "2025-04-15T10:00:00.000Z"
    }
}


Mappa Esistente Aggiornata
{
    "message": "Mappa aggiornata con successo!",
    "map": {
        "id": 1,
        "userId": 2,
        "roomId": 1,
        "filePath": "images/maps/2/1/Dungeon.png",
        "name": "Dungeon",
        "description": "Descrizione aggiornata",
        "mapSize": "1200x900",
        "gridSize": "60x60",
        "isVisibleToPlayers": true,
        "createdAt": "2025-04-15T10:00:00.000Z",
        "updatedAt": "2025-04-15T10:20:00.000Z"
    }
}






3. Recupero dei dettagli di una mappa
Metodo: GET
URL: /map/:mapId
Headers:
Authorization: Bearer <token>



4. Modifica delle informazioni di una mappa
Metodo: PUT
URL: /map/:mapId
Headers:
Authorization: Bearer <token>
Content-Type: application/json


Body (JSON):
{
    "name": "Nome aggiornato",
    "description": "Descrizione aggiornata",
    "mapSize": "Nuova dimensione della mappa (es. 1200x900)",
    "gridSize": "Nuova dimensione della griglia (es. 60x60)",
    "isVisibleToPlayers": true
}







2. Recupero delle Mappe per una Stanza
Metodo: GET
URL: http://<tuo_server>/map/list/:roomId
Headers:
Authorization: Bearer <token>


Risultato Atteso:
- Lista delle mappe associate alla stanza specificata:{
    "message": "Elenco delle mappe recuperato con successo!",
    "maps": [
        {
            "id": 1,
            "name": "Dungeon 1",
            "description": "Mappa del dungeon sotterraneo",
            "roomId": 1,
            "mapSize": "1000x800",
            "gridSize": "50x50",
            "filePath": "uploads/filename.png"
        }
    ]
}



3. Eliminazione di una Mappa
Metodo: DELETE
URL: http://<tuo_server>/map/:mapName
Headers:
Authorization: Bearer <token>


Risultato Atteso:
- Risposta di successo se la mappa è eliminata:{
    "message": "Mappa eliminata con successo!"
}



4. Annotazioni sulla Mappa
Metodo: POST
URL: http://<tuo_server>/map/annotate
Headers:
Authorization: Bearer <token>
Content-Type: application/json


Body (JSON):
{
    "mapName": "Dungeon 1",
    "annotations": [
        { "x": 1, "y": 1, "note": "Ingresso" },
        { "x": 5, "y": 3, "note": "Tesoro nascosto" }
    ]
}


Risultato Atteso:
- Risposta di successo con il percorso delle annotazioni salvate:{
    "message": "Annotazioni salvate con successo!",
    "annotationPath": "uploads/Dungeon 1.json"
}



5. Recupero delle Annotazioni
Metodo: GET
URL: http://<tuo_server>/map/annotations/:mapName
Headers:
Authorization: Bearer <token>


Risultato Atteso:
- Lista delle annotazioni associate alla mappa:{
    "annotations": [
        { "x": 1, "y": 1, "note": "Ingresso" },
        { "x": 5, "y": 3, "note": "Tesoro nascosto" }
    ]
}



6. Salvataggio del Fog of War
Metodo: POST
URL: http://<tuo_server>/map/fog
Headers:
Authorization: Bearer <token>
Content-Type: application/json


Body (JSON):
{
    "mapName": "Dungeon 1",
    "hiddenAreas": [
        { "x": 2, "y": 2 },
        { "x": 3, "y": 4 }
    ]
}


Risultato Atteso:
- Risposta di successo con il percorso del Fog of War salvato:{
    "message": "Fog of War salvato con successo!",
    "fogPath": "uploads/Dungeon 1-fog.json"
}



7. Recupero del Fog of War
Metodo: GET
URL: http://<tuo_server>/map/fog/:mapName
Headers:
Authorization: Bearer <token>


Risultato Atteso:
- Dettagli delle aree nascoste:{
    "fog": {
        "hiddenAreas": [
            { "x": 2, "y": 2 },
            { "x": 3, "y": 4 }
        ]
    }
}



8. Salvataggio dei Token sulla Mappa
Metodo: POST
URL: http://<tuo_server>/map/token
Headers:
Authorization: Bearer <token>
Content-Type: application/json


Body (JSON):
{
    "mapName": "Dungeon 1",
    "tokens": [
        { "id": 1, "x": 2, "y": 3, "width": 1, "height": 1, "isVisible": true },
        { "id": 2, "x": 4, "y": 6, "width": 2, "height": 2, "isVisible": false }
    ]
}


Risultato Atteso:
- Risposta di successo con il percorso dei token salvati:{
    "message": "Tokens salvati con successo!",
    "tokenPath": "uploads/Dungeon 1-tokens.json"
}



9. Recupero dei Token sulla Mappa
Metodo: GET
URL: http://<tuo_server>/map/token/:mapName
Headers:
Authorization: Bearer <token>


Risultato Atteso:
- Lista dei token salvati per la mappa:{
    "tokens": [
        { "id": 1, "x": 2, "y": 3, "width": 1, "height": 1, "isVisible": true },
        { "id": 2, "x": 4, "y": 6, "width": 2, "height": 2, "isVisible": false }
    ]
}




