# API Utente – Loki Server

## 📌 Registrazione Utente

**Metodo:** `POST`  
**URL:** `http://loki:3000/register`  
**Headers:**
```
Content-Type: multipart/form-data
```

### Body (form-data):
| Key      | Value         | Type |
|----------|---------------|------|
| username | testuser      | Text |
| password | password123   | Text |
| avatar   | profile.jpg   | File (opzionale) |

### ✅ Risposta di Successo:
```json
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
```

### ❌ Errori Possibili:
- Utente già esistente:
```json
{ "error": "L'utente esiste già. Scegli un nome utente diverso." }
```
- Formato immagine non valido:
```json
{ "error": "Formato immagine non valido. Usa PNG o JPEG." }
```
- Errore generico:
```json
{
  "error": "Errore durante la registrazione.",
  "details": "Descrizione dell'errore specifico."
}
```

---

## 🔐 Login

**Metodo:** `POST`  
**URL:** `http://localhost:3000/user/login`  
**Headers:**
```
Content-Type: application/json
```

### Body:
```json
{
  "username": "testuser",
  "password": "password123"
}
```

### ✅ Risposta:
```json
{
  "message": "Login effettuato con successo.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "avatarUrl": "http://loki:3000/uploads/avatars/default-avatar.jpg"
}
```

---

## 🚪 Logout

**Metodo:** `POST`  
**URL:** `http://localhost:3000/user/logout`  
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

Body: _(vuoto)_

---

## 🔑 Richiesta Token

**Metodo:** `POST`  
**URL:** `http://localhost:3000/user/get-token`  
**Headers:**
```
Content-Type: application/json
```

### Body:
```json
{
  "username": "tuoUsername"
}
```

---

## 👤 Info Utente

**Metodo:** `GET`  
**URL:** `http://loki:3000/user/userInfo/nevarim`

### ✅ Risposta:
```json
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
      { "id": 3, "username": "friend1" }
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
```

---

## 📶 Status Utente

**Metodo:** `GET`  
**URL:** `http://localhost:3000/user/status/tuoUsername`  
**Headers:**
```
Authorization: Bearer <token>
```

### ✅ Risposta:
```json
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
```

---

## 🖼️ Aggiorna Avatar

**Metodo:** `PUT`  
**URL:** `http://localhost:3000/user/update-avatar`  
**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Body:
- `avatar`: File immagine

### ✅ Risposta:
```json
{
  "message": "Avatar aggiornato con successo.",
  "avatar": "http://localhost:3000/images/avatars/resized-123456789-avatar.png"
}
```

---

## 📝 Aggiorna Profilo

**Metodo:** `PUT`  
**URL:** `http://loki:3000/user/update-profile/:id`  
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body:
```json
{
  "username": "nuovo_username",
  "displayName": "Nuovo Nome",
  "biography": "Questa è la mia biografia aggiornata",
  "avatar": "avatars/1/new-avatar.png",
  "preferredLanguage": "it",
  "chatColor": "#FF5733",
  "theme": "light"
}
```

### ✅ Risposta:
```json
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
```

**Note:**
- I campi `email` e `id` **non sono modificabili**
- Solo i campi forniti verranno aggiornati

---

## ❌ Cancella Account

**Metodo:** `DELETE`  
**URL:** `http://loki:3000/user/delete`  
**Headers:**
```
Authorization: Bearer <token>
```

---

## 👥 Recupera Lista Amici

**Metodo:** `GET`  
**URL:** `http://loki:3000/user/friends`  
**Headers:**
```
Authorization: Bearer <token>
```

---

## 🎨 Aggiorna Tema Preferito

**Metodo:** `PUT`  
**URL:** `http://loki:3000/user/update-theme`  
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body:
```json
{
  "theme": "dark"
}
```

---

## 🚫 Controllo Stato Banned

**Metodo:** `GET`  
**URL:** `http://loki:3000/user/is-banned`  
**Headers:**
```
Authorization: Bearer <token>
```


# Creazione di una stanza
POST http://localhost:3000/room
Headers:
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body:
- name: nomeDellaStanza
- description: descrizioneDellaStanza
- cover: [file jpeg/png]

# Modifica della cover di una stanza
POST http://localhost:3000/room/:roomId/update-cover
Headers:
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body:
- cover: [file jpeg/png]

# Modifica delle informazioni della stanza (nome, descrizione, cover)
PUT http://localhost:3000/room/:idroom/editRoom
Headers:
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body:
- name: nuovoNome (facoltativo)
- description: nuovaDescrizione (facoltativo)
- cover: nuovaCover (facoltativo)

# Entrare in una stanza
POST http://localhost:3000/room/:roomId/join
Headers:
Authorization: Bearer <token>
Content-Type: application/json
Body: {}

# Uscire da una stanza
DELETE http://localhost:3000/room/:roomId/leave
Headers:
Authorization: Bearer <token>
Content-Type: application/json
Body: {}

# Espellere un utente da una stanza
DELETE http://localhost:3000/room/:roomId/kick/:userId
Headers:
Authorization: Bearer <token>
Content-Type: application/json
Body: {}

# Caricamento dei dati di una singola stanza
GET http://loki:3000/room/:roomId/loadRoom
Headers:
Authorization: Bearer <token>

# Recupera tutte le stanze dove sei GM
GET http://loki:3000/room/gm
Headers:
Authorization: Bearer <token>

# Recupera tutte le stanze dove sei Player
GET http://loki:3000/room/player
Headers:
Authorization: Bearer <token>


chat:
  getMessages:
    method: GET
    url: http://localhost:3000/chat/:roomId
    description: Recupera i messaggi di una stanza specifica ordinati per data.
    exampleRequest: http://localhost:3000/chat/1
    responseExample:
      - id: 1
        roomId: 1
        userId: 2
        message: "Ciao a tutti!"
        createdAt: "2025-04-08T10:00:00.000Z"
      - id: 2
        roomId: 1
        userId: 3
        message: "Benvenuto!"
        createdAt: "2025-04-08T10:05:00.000Z"

  postMessage:
    method: POST
    url: http://localhost:3000/chat/
    description: Invia un nuovo messaggio nella chat della stanza.
    body:
      roomId: 1
      userId: 2
      message: "Ciao, come va"
    responseExample:
      id: 3
      roomId: 1
      userId: 2
      message: "Ciao, come va"
      createdAt: "2025-04-08T10:10:00.000Z"

  deleteMessage:
    method: DELETE
    url: http://localhost:3000/chat/:messageId
    headers:
      Authorization: "Bearer ilTuoToken"
    description: Cancella un messaggio specifico della chat. Solo il GM o l'autore del messaggio può eliminarlo.
    exampleRequest: http://localhost:3000/chat/3
    response:
      message: "Messaggio eliminato con successo."

  editMessage:
    method: PUT
    url: http://localhost:3000/chat/:messageId
    headers:
      Authorization: "Bearer ilTuoToken"
      Content-Type: "application/json"
    body:
      message: "Messaggio aggiornato"
    description: Modifica un messaggio inviato. Solo l'autore può modificarlo.
    exampleRequest: http://localhost:3000/chat/3
    response:
      id: 3
      roomId: 1
      userId: 2
      message: "Messaggio aggiornato"
      createdAt: "2025-04-08T10:10:00.000Z"
      updatedAt: "2025-04-08T10:20:00.000Z"





token:
  uploadToken:
    method: POST
    url: http://loki:3000/tokenimages/upload
    headers:
      Authorization: Bearer <token>
      Content-Type: multipart/form-data
    body:
      form-data:
        - name: "Nome del Token"
          type: Text
        - tokenImage: "immagine.png/jpg"
          type: File
    responseExample:
      message: "Token caricato con successo!"
      token:
        id: 1
        url: "tokens/2/resized-immagine.png"
        name: "Nome-del-Token"
        createdAt: "2025-04-15T12:00:00.000Z"
        updatedAt: "2025-04-15T12:00:00.000Z"
        userId: 2

  getUserTokens:
    method: GET
    url: http://loki:3000/tokenimages/user-tokens
    headers:
      Authorization: Bearer <token>
    responseExample:
      - id: 1
        url: "tokens/2/resized-immagine.png"
        name: "Nome-del-Token"
        createdAt: "2025-04-15T12:00:00.000Z"
        updatedAt: "2025-04-15T12:00:00.000Z"
        userId: 2

  getTokenDetails:
    method: GET
    url: http://loki:3000/tokenimages/1
    headers:
      Authorization: Bearer <token>
    responseExample:
      id: 1
      url: "tokens/2/resized-immagine.png"
      name: "Nome-del-Token"
      createdAt: "2025-04-15T12:00:00.000Z"
      updatedAt: "2025-04-15T12:00:00.000Z"
      userId: 2

  updateToken:
    method: PUT
    url: http://loki:3000/tokenimages/1
    headers:
      Authorization: Bearer <token>
      Content-Type: application/json
    body:
      json:
        name: "Nuovo-Nome-del-Token"
    responseExample:
      message: "Token aggiornato con successo."
      token:
        id: 1
        url: "tokens/2/resized-immagine.png"
        name: "Nuovo-Nome-del-Token"
        createdAt: "2025-04-15T12:00:00.000Z"
        updatedAt: "2025-04-15T12:30:00.000Z"
        userId: 2

  deleteToken:
    method: DELETE
    url: http://loki:3000/tokenimages/1
    headers:
      Authorization: Bearer <token>
    responseExample:
      message: "Token eliminato con successo."

  countUserTokens:
    method: GET
    url: http://loki:3000/tokenimages/count
    headers:
      Authorization: Bearer <token>
    responseExample:
      count: 1

  uploadMultipleTokens:
    method: POST
    url: http://loki:3000/tokenimages/upload-multiple
    headers:
      Authorization: Bearer <token>
      Content-Type: multipart/form-data
    body:
      form-data:
        - tokenImages: "immagine1.png/jpg"
          type: File
        - tokenImages: "immagine2.png/jpg"
          type: File
        - tokenImages: "immagine3.png/jpg"
          type: File
    responseExample:
      message: "Token multipli caricati con successo!"
      tokens:
        - id: 1
          url: "http://loki:3000/images/tokens/2/1678900000-immagine1.png"
          name: "Temporary-1678900000"
          createdAt: "2025-04-15T12:00:00.000Z"
          updatedAt: "2025-04-15T12:00:00.000Z"
          userId: 2
        - id: 2
          url: "http://loki:3000/images/tokens/2/1678900100-immagine2.jpg"
          name: "Temporary-1678900100"
          createdAt: "2025-04-15T12:01:00.000Z"
          updatedAt: "2025-04-15T12:01:00.000Z"
          userId: 2
        - id: 3
          url: "http://loki:3000/images/tokens/2/1678900200-immagine3.png"
          name: "Temporary-1678900200"
          createdAt: "2025-04-15T12:02:00.000Z"
          updatedAt: "2025-04-15T12:02:00.000Z"
          userId: 2



# API Documentation

## 1. Aggiungi un Token a una Mappa
**Metodo:** POST  
**URL:** http://<tuo_server>/api/map-tokens/:mapId/add-token  
**Headers:**  
Authorization: Bearer <token>  
Content-Type: application/json  

**Body (JSON):**
```json
{
    "tokenId": 1,
    "x": 3,
    "y": 5,
    "width": 1,
    "height": 1,
    "isVisible": true
}
Risultato Atteso:

Token aggiunto alla mappa con successo.

Il server risponde con i dettagli del token aggiunto.

2. Recupera i Token di una Mappa
Metodo: GET
URL: http://<tuo_server>/api/map-tokens/:mapId/tokens
Headers:
Authorization: Bearer <token>

Risultato Atteso:

Elenco di tutti i token associati alla mappa specificata.

La risposta include informazioni come id, url, name, e posizione.

3. Sposta un Token sulla Griglia
Metodo: PUT
URL: http://<tuo_server>/api/map-tokens/:mapId/token/:mapTokenId/move
Headers:
Authorization: Bearer <token>
Content-Type: application/json

Body (JSON):

json
Copia
Modifica
{
    "x": 7,
    "y": 9
}
Risultato Atteso:

Token spostato con successo.

La risposta include le nuove coordinate del token.

Test su Postman
Aggiunta di Token
Seleziona POST e inserisci l'URL.

Inserisci mapId nell'URL e compila il Body.

Verifica che il token venga aggiunto correttamente.

Recupero dei Token
Seleziona GET, sostituisci mapId nell'URL.

Conferma che i token associati alla mappa vengano restituiti.

Movimento Token
Seleziona PUT, sostituisci mapId e mapTokenId nell'URL.

Compila il Body con le nuove coordinate.

1. Caricamento di una Mappa
Metodo: POST
URL: http://<tuo_server>/map/upload
Headers:
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (form-data):

map: [file] (scegli un file da caricare)

name: Nome della mappa (es. "Dungeon 1")

description: Descrizione della mappa (es. "Mappa del dungeon sotterraneo")

roomId: ID della stanza (es. 1)

mapSize: Dimensioni della mappa (es. "1000x800")

gridSize: Dimensioni della griglia (es. "50x50")

Risultato Atteso:

Risposta di successo con dettagli della mappa caricata:

json
Copia
Modifica
{
    "message": "Mappa caricata e registrata con successo!",
    "map": {
        "id": 1,
        "name": "Dungeon 1",
        "description": "Mappa del dungeon sotterraneo",
        "roomId": 1,
        "mapSize": "1000x800",
        "gridSize": "50x50",
        "filePath": "uploads/filename.png"
    }
}
2. Recupero delle Mappe per una Stanza
Metodo: GET
URL: http://<tuo_server>/map/list/:roomId
Headers:
Authorization: Bearer <token>

Risultato Atteso:

Lista delle mappe associate alla stanza specificata:

json
Copia
Modifica
{
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

Risposta di successo se la mappa è eliminata:

json
Copia
Modifica
{
    "message": "Mappa eliminata con successo!"
}
4. Annotazioni sulla Mappa
Metodo: POST
URL: http://<tuo_server>/map/annotate
Headers:
Authorization: Bearer <token>
Content-Type: application/json

Body (JSON):

json
Copia
Modifica
{
    "mapName": "Dungeon 1",
    "annotations": [
        { "x": 1, "y": 1, "note": "Ingresso" },
        { "x": 5, "y": 3, "note": "Tesoro nascosto" }
    ]
}
Risultato Atteso:

Risposta di successo con il percorso delle annotazioni salvate:

json
Copia
Modifica
{
    "message": "Annotazioni salvate con successo!",
    "annotationPath": "uploads/Dungeon 1.json"
}
5. Recupero delle Annotazioni
Metodo: GET
URL: http://<tuo_server>/map/annotations/:mapName
Headers:
Authorization: Bearer <token>

Risultato Atteso:

Lista delle annotazioni associate alla mappa:

json
Copia
Modifica
{
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

json
Copia
Modifica
{
    "mapName": "Dungeon 1",
    "hiddenAreas": [
        { "x": 2, "y": 2 },
        { "x": 3, "y": 4 }
    ]
}
Risultato Atteso:

Risposta di successo con il percorso del Fog of War salvato:

json
Copia
Modifica
{
    "message": "Fog of War salvato con successo!",
    "fogPath": "uploads/Dungeon 1-fog.json"
}
7. Recupero del Fog of War
Metodo: GET
URL: http://<tuo_server>/map/fog/:mapName
Headers:
Authorization: Bearer <token>

Risultato Atteso:

Dettagli delle aree nascoste:

json
Copia
Modifica
{
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

json
Copia
Modifica
{
    "mapName": "Dungeon 1",
    "tokens": [
        { "id": 1, "x": 2, "y": 3, "width": 1, "height": 1, "isVisible": true },
        { "id": 2, "x": 4, "y": 6, "width": 2, "height": 2, "isVisible": false }
    ]
}
Risultato Atteso:

Risposta di successo con il percorso dei token salvati:

json
Copia
Modifica
{
    "message": "Tokens salvati con successo!",
    "tokenPath": "uploads/Dungeon 1-tokens.json"
}
9. Recupero dei Token sulla Mappa
Metodo: GET
URL: http://<tuo_server>/map/token/:mapName
Headers:
Authorization: Bearer <token>

Risultato Atteso:

Lista dei token salvati per la mappa:

json
Copia
Modifica
{
    "tokens": [
        { "id": 1, "x": 2, "y": 3, "width": 1, "height": 1, "isVisible": true },
        { "id": 2, "x": 4, "y": 6, "width": 2, "height": 2, "isVisible": false }
    ]
}
Copia
Modifica
