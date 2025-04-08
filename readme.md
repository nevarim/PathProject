Registrazione
Metodo: POST
URL: http://localhost:3000/user/register
Headers:
Content-Type: application/json
Body:
{
"username": "nuovoUsername",
"password": "nuovaPassword"
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

Status dell Utente
Metodo: PUT
URL: http://localhost:3000/user/status/update-avatar
Headers:
Authorization: Bearer ilTokenRicevutoDalLogin
Body:
avatar formato File
response
{
    "message": "Avatar aggiornato con successo.",
    "avatar": "http://localhost:3000/images/avatars/resized-123456789-avatar.png"
}


















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

Richiesta GET per le stanze di cui l'utente è GM:
Metodo: GET
URL: http://localhost:3000/room/gm
Headers:
Authorization: Bearer token
response:
{
    "message": "Lista delle stanze di cui sei GM recuperata con successo.",
    "rooms": [
        {
            "id": 1,
            "name": "Stanza 1",
            "description": "Descrizione della stanza",
            "resizedCover": "http://localhost:3000/images/covers/2/resized-1744038994875-test1.jpg",
            "originalCover": "http://localhost:3000/images/covers/2/1744038994875-test1.jpg",
            "createdAt": "2025-04-07T10:00:00.000Z",
            "updatedAt": "2025-04-07T11:00:00.000Z"
        }
    ]
}

Richiesta GET per le stanze di cui l'utente è Player:
Metodo: GET
URL: http://localhost:3000/room/player
Headers:
Authorization: Bearer token
response:
{
    "message": "Lista delle stanze di cui sei Player recuperata con successo.",
    "rooms": [
        {
            "id": 2,
            "name": "Stanza 2",
            "description": "Descrizione della stanza",
            "resizedCover": "http://localhost:3000/images/covers/3/resized-1744038994875-test2.jpg",
            "originalCover": "http://localhost:3000/images/covers/3/1744038994875-test2.jpg",
            "createdAt": "2025-04-07T10:10:00.000Z",
            "updatedAt": "2025-04-07T11:10:00.000Z"
        }
    ]
}


Endpoint: PUT http://localhost:3000/:idroom/editRoom
Metodo: PUT
Headers:
Authorization: Bearer <your_token>

Body:
name(facoltativo): Nuovo nome della stanza.
description  (facoltativo): Nuova descrizione della stanza.
cover (facoltativo): Nuova immagine della cover.

risposta: dettagli aggiornati della camera







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