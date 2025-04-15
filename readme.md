# 📘 API Documentation - Loki Backend

## 🧾 **Registrazione Utente**

**Metodo:** `POST`  
**URL:** `http://loki:3000/register`  
**Headers:**
```http
Content-Type: multipart/form-data
```

**Body (form-data):**

| Key      | Value         | Type  |
|----------|---------------|-------|
| username | testuser      | Text  |
| password | password123   | Text  |
| avatar   | profile.jpg   | File *(opzionale)* |

**Risposta Attesa:**
```json
{
  "message": "Utente registrato con successo!",
  "user": {
    "id": 1,
    "username": "testuser",
    "avatar": "http://loki:3000/images/avatars/resized-profile.jpg",
    "createdAt": "...",
    "updatedAt": "...",
    "isTemporary": true
  }
}
```

### ❗️Errori Possibili
- Utente esiste già
- Immagine non valida (solo JPG/PNG)
- Errore generico del server

---

## 🔐 **Login**

**Metodo:** `POST`  
**URL:** `http://localhost:3000/user/login`  
**Body:**
```json
{
  "message": "Login effettuato con successo.",
  "token": "<JWT>",
  "avatarUrl": "http://loki:3000/uploads/avatars/default-avatar.jpg"
}
```

---

## 🔓 **Logout**

**Metodo:** `POST`  
**URL:** `http://localhost:3000/user/logout`  
**Headers:**  
`Authorization: Bearer <token>`

---

## 🔑 **Get Token**

**Metodo:** `POST`  
**URL:** `http://localhost:3000/user/get-token`  
**Body:**
```json
{
  "username": "tuoUsername"
}
```

---

## 🧍‍♂️ **Info Utente**

**Metodo:** `GET`  
**URL:** `http://loki:3000/user/userInfo/<username>`

**Risposta:**
```json
{
  "message": "Informazioni utente recuperate con successo.",
  "user": {
    "id": 1,
    "username": "nevarim",
    ...
  }
}
```

---

## ✏️ **Update Profilo**

**Metodo:** `PUT`  
**URL:** `http://loki:3000/user/update-profile/:id`  
**Headers:**  
`Authorization: Bearer <token>`  
`Content-Type: application/json`

**Body:**
```json
{
  "username": "nuovo_username",
  "displayName": "Nuovo Nome",
  "biography": "Nuova bio",
  ...
}
```

---

## 🗑 **Eliminazione Utente**

**Metodo:** `DELETE`  
**URL:** `http://loki:3000/user/delete`

---

## 🎭 **Stanze**

### ✅ Crea Stanza
`POST /room`

### 🎨 Aggiorna Cover
`POST /room/:id/update-cover`

### ➕ Entra / ➖ Esci / ❌ Espelli
```http
POST    /room/:id/join  
DELETE  /room/:id/leave  
DELETE  /room/:id/kick/:userId
```

### 🧙 GM Rooms
`GET /room/gm`

### 🎮 Player Rooms
`GET /room/player`

### ✏️ Modifica Stanza
`PUT /room/:idroom/editRoom`

### 🔍 Carica Dati Stanza
`GET /room/:id/loadRoom`

---

## 💬 **Chat**

### 🗨️ Recupera Messaggi
`GET /chat/:roomId`

### ✍️ Invia Messaggio
`POST /chat`

---

## 🧿 **Token Management**

### 📤 Upload Token
`POST /tokenimages/upload`

### 📥 Lista Token Utente
`GET /tokenimages/user-tokens`

### 📄 Dettagli Token
`GET /tokenimages/:id`

### ✏️ Modifica Token
`PUT /tokenimages/:id`

### 🗑 Elimina Token
`DELETE /tokenimages/:id`

### 🔢 Conta Token
`GET /tokenimages/count`

### 🧩 Upload Multiplo
`POST /tokenimages/upload-multiple`

---

## 🗺️ **Gestione Mappe**

### 📤 Caricamento Mappa
`POST /map/upload`

### 📋 Lista Mappe per Stanza
`GET /map/list/:roomId`

### 🗑 Elimina Mappa
`DELETE /map/:mapName`

### ✏️ Annotazioni
`POST /map/annotate`

### 📖 Recupero Annotazioni
`GET /map/annotations/:mapName`

### 🌫 Fog of War
- `POST /map/fog`  
- `GET /map/fog/:mapName`

---

## 🧿📍 **Token su Mappa**

### ➕ Aggiungi Token
`POST /api/map-tokens/:mapId/add-token`

### 📥 Recupera Token su Mappa
`GET /api/map-tokens/:mapId/tokens`

### 🔁 Sposta Token
`PUT /api/map-tokens/:mapId/token/:mapTokenId/move`

### 💾 Salva Token su Mappa
`POST /map/token`

### 📤 Recupera Token Salvati
`GET /map/token/:mapName`