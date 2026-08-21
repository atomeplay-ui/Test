# 🖥️ BACKEND SERVEUR - EXPLICATION DÉTAILLÉE

## 📌 C'est Quoi Un Backend ?

Un **backend serveur** est un ordinateur distant qui :
1. **Reçoit** les photos/vidéos de votre application
2. **Les stocke** sur son disque dur
3. **Les récupère** quand vous en avez besoin
4. **Les protège** avec sécurité

### Analogie Simple :

```
AVANT (localStorage) :
┌─────────────────┐
│    Votre PC     │
│  ├─ Photos      │ ← Perdues au refresh
│  ├─ Vidéos      │ ← Perdues au refresh
│  └─ Audios      │ ← Perdues au refresh
└─────────────────┘

AVEC BACKEND :
┌─────────────────┐         ┌──────────────────┐
│    Votre PC     │  ────>  │  Serveur Distant │
│  Application    │         │  ├─ Photos       │ ← Sauvegardés
│  (frontend)     │         │  ├─ Vidéos       │ ← Sauvegardés
│                 │  <────  │  └─ Audios       │ ← Sauvegardés
└─────────────────┘         └──────────────────┘
        (Client)                   (Serveur)
```

---

## 🏗️ Architecture Backend

### Composants Nécessaires :

```
┌───────────────────────────────────────┐
│         APPLICATION WEB               │
│  (Ce que vous avez déjà)              │
│  - Capture photos/vidéos              │
│  - Interface iPhone                   │
└────────┬────────────────────────────┘
         │
         │ HTTP Requests
         ↓
┌───────────────────────────────────────┐
│      BACKEND SERVER (Node.js)         │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  API REST                       │  │
│  │  - POST /upload (upload fichier)│  │
│  │  - GET /files (récupérer liste) │  │
│  │  - GET /file/:id (télécharger) │  │
│  │  - DELETE /file/:id (supprimer)│  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  Système de Fichiers            │  │
│  │  /uploads/                      │  │
│  │  ├─ photo-1234.jpg              │  │
│  │  ├─ video-5678.webm             │  │
│  │  └─ audio-9012.webm             │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  Base de Données (optionnel)    │  │
│  │  - Métadonnées des fichiers     │  │
│  │  - Utilisateurs                 │  │
│  │  - Droits d'accès               │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

---

## 💻 Technologies Backend

### Option 1 : **Node.js + Express** (RECOMMANDÉE) ⭐

```javascript
// Installation
npm install express multer cors dotenv

// Code minimal
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Upload un fichier
app.post('/api/upload', upload.single('file'), (req, res) => {
  const fileId = Date.now().toString();
  const filePath = path.join('uploads', fileId);
  
  fs.rename(req.file.path, filePath, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ fileId, url: `/files/${fileId}` });
  });
});

// Récupérer un fichier
app.get('/files/:id', (req, res) => {
  const filePath = path.join('uploads', req.params.id);
  res.download(filePath);
});

// Lister les fichiers
app.get('/api/files', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ files });
  });
});

// Supprimer un fichier
app.delete('/api/files/:id', (req, res) => {
  const filePath = path.join('uploads', req.params.id);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Fichier supprimé' });
  });
});

app.listen(3000, () => console.log('Serveur sur http://localhost:3000'));
```

**Avantages :**
- ✅ Même langage que votre frontend (JavaScript)
- ✅ Facile à apprendre
- ✅ Parfait pour ce projet

---

### Option 2 : **Python + Flask**

```python
from flask import Flask, request, send_file, jsonify
from werkzeug.utils import secure_filename
import os
from datetime import datetime

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Upload un fichier
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return {'error': 'No file'}, 400
    
    file = request.files['file']
    file_id = str(datetime.now().timestamp()).replace('.', '')
    filepath = os.path.join(UPLOAD_FOLDER, file_id)
    
    file.save(filepath)
    return {'fileId': file_id, 'url': f'/files/{file_id}'}

# Récupérer un fichier
@app.route('/files/<file_id>', methods=['GET'])
def get_file(file_id):
    filepath = os.path.join(UPLOAD_FOLDER, file_id)
    return send_file(filepath)

# Lister les fichiers
@app.route('/api/files', methods=['GET'])
def list_files():
    files = os.listdir(UPLOAD_FOLDER)
    return {'files': files}

# Supprimer un fichier
@app.route('/api/files/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    filepath = os.path.join(UPLOAD_FOLDER, file_id)
    os.remove(filepath)
    return {'message': 'Fichier supprimé'}

if __name__ == '__main__':
    app.run(debug=True, port=3000)
```

---

## 📤 Upload Depuis le Frontend

### Comment envoyer un fichier au serveur :

```javascript
// Depuis votre application mariage

async function uploadVideo(videoBlob) {
  try {
    // Créer un FormData avec le fichier
    const formData = new FormData();
    formData.append('file', videoBlob, 'video.webm');
    
    // Envoyer au serveur
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const { fileId, url } = await response.json();
    
    // Sauvegarder l'ID dans localStorage
    localStorage.setItem(`video-${Date.now()}`, JSON.stringify({
      fileId,
      url, // ← URL du serveur
      uploadedAt: new Date().toISOString()
    }));
    
    console.log('Vidéo uploadée :', url);
  } catch (error) {
    console.error('Erreur upload :', error);
  }
}

// Utilisation
const videoBlob = new Blob([...], { type: 'video/webm' });
await uploadVideo(videoBlob);
```

---

## 📥 Récupérer les Fichiers

### Depuis le serveur vers le navigateur :

```javascript
async function loadVideosFromServer() {
  try {
    // Récupérer la liste des fichiers
    const response = await fetch('/api/files');
    const { files } = await response.json();
    
    // Afficher les vidéos
    files.forEach(fileId => {
      const videoUrl = `/files/${fileId}`;
      // Afficher dans la galerie
      displayVideo(videoUrl);
    });
  } catch (error) {
    console.error('Erreur récupération :', error);
  }
}

// Afficher une vidéo depuis le serveur
function displayVideo(videoUrl) {
  const video = document.createElement('video');
  video.src = videoUrl; // ← URL du serveur
  video.controls = true;
  document.body.appendChild(video);
}
```

---

## 🖥️ Où Héberger le Serveur ?

### Option A : **Sur Votre PC (Développement)**

```
Avantages :
✅ Gratuit
✅ Facile à tester
✅ Parfait pour mariage

Inconvénients :
❌ Votre PC doit rester allumé
❌ Pas accessible depuis l'extérieur (sans ngrok)
```

**Démarrage :**
```bash
npm start
# ou
python app.py
```

**Accès depuis iPhone :**
```
http://[IP_PC]:3000
ou
https://[ngrok_url]  (avec ngrok)
```

---

### Option B : **Hébergement Cloud Gratuit**

#### **1. Heroku (Gratuit, mais limite)**

```bash
# Installation Heroku CLI
npm install -g heroku

# Login
heroku login

# Créer l'app
heroku create mon-mariage-app

# Déployer
git push heroku main

# App accessible :
https://mon-mariage-app.herokuapp.com
```

**Avantages :**
- ✅ Gratuit
- ✅ Toujours allumé
- ✅ URL publique
- ✅ SSL automatique

**Inconvénients :**
- ❌ Limite de stockage (500MB)
- ❌ Peut être lent

---

#### **2. Replit (Gratuit)**

```
1. Aller sur https://replit.com
2. Créer un projet Node.js
3. Coller votre code
4. Appuyer sur "Run"
5. URL fournie automatiquement
```

**Avantages :**
- ✅ Très simple
- ✅ Gratuit
- ✅ Code online

---

#### **3. Google Cloud / AWS (Payant)**

```bash
# Installation Google Cloud CLI
curl https://sdk.cloud.google.com | bash

# Déployer
gcloud app deploy
```

**Avantages :**
- ✅ Professionnel
- ✅ Illimité
- ✅ Performant

**Inconvénients :**
- ❌ Payant (~$5-10/mois)

---

## 💾 Stockage des Fichiers

### Où sont stockés les fichiers ?

```
Backend Local (Votre PC) :
/mon-app/
├─ server.js
├─ uploads/          ← Dossier des fichiers
│  ├─ photo-1234
│  ├─ video-5678
│  └─ audio-9012
└─ node_modules/

Backend Cloud (Heroku) :
/app/uploads/    ← Stockage éphémère
               (supprimé après redémarrage)
```

### Problème : Stockage éphémère

Sur Heroku, les fichiers sont supprimés après redémarrage !

**Solutions :**
1. **Amazon S3** - Stockage cloud ($)
2. **Firebase** - Gratuit jusqu'à 1GB
3. **Cloudinary** - Gratuit jusqu'à 25GB
4. **Disque dur local** (seulement PC)

---

## 🔐 Sécurité Backend

### Points importants :

```javascript
// 1. Valider les fichiers
const ALLOWED_TYPES = ['image/jpeg', 'video/webm', 'audio/webm'];
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

app.post('/api/upload', (req, res) => {
  if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Type non autorisé' });
  }
  if (req.file.size > MAX_SIZE) {
    return res.status(400).json({ error: 'Fichier trop gros' });
  }
  // ...
});

// 2. Limiter l'accès avec mot de passe
const PASSWORD = '2024';

app.post('/api/upload', (req, res) => {
  if (req.query.password !== PASSWORD) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  // ...
});

// 3. Limiter la vitesse d'upload (anti-spam)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 uploads max
});

app.post('/api/upload', limiter, (req, res) => {
  // ...
});
```

---

## 📊 Flux Complet

```
1. CAPTURE
   ┌──────────────────────┐
   │ Utilisateur prend    │
   │ une photo/vidéo      │
   └────────┬─────────────┘
            │
2. UPLOAD
            ↓
   ┌──────────────────────┐
   │ Frontend envoie      │
   │ le fichier au        │
   │ serveur via HTTP     │
   └────────┬─────────────┘
            │
3. STOCKAGE
            ↓
   ┌──────────────────────┐
   │ Serveur reçoit et    │
   │ sauvegarde le fichier│
   │ sur le disque        │
   └────────┬─────────────┘
            │
4. MÉTADONNÉES
            ↓
   ┌──────────────────────┐
   │ Serveur retourne l'ID│
   │ et l'URL du fichier  │
   └────────┬─────────────┘
            │
5. AFFICHAGE
            ↓
   ┌──────────────────────┐
   │ Frontend affiche le  │
   │ fichier dans la      │
   │ galerie              │
   └────────┬─────────────┘
            │
6. PERSISTANCE
            ↓
   ┌──────────────────────┐
   │ Rechargez la page :  │
   │ le fichier est       │
   │ TOUJOURS LÀ ✓        │
   └──────────────────────┘
```

---

## 🎯 Plan Implémentation

### **Étape 1 : Backend Local (Facile)**

```bash
# Installation
npm init -y
npm install express multer cors

# Créer server.js
# Démarrer : npm start
```

**Temps :** 1h

---

### **Étape 2 : Intégrer au Frontend (Moyen)**

Modifier l'application mariage pour :
- Envoyer vidéos/audios au serveur
- Récupérer depuis le serveur
- Afficher dans la galerie

**Temps :** 2h

---

### **Étape 3 : Déployer en Cloud (Facile)**

Héberger sur Heroku/Replit pour :
- Accès 24/7
- Pas besoin de PC allumé
- URL publique

**Temps :** 30 min

---

## ✅ Avantages Backend Serveur

Pour votre mariage :

✅ **Persistance garantie**
   - Rafraîchissement = aucune perte

✅ **Stockage illimité**
   - 500MB, 1GB, ou plus selon le service

✅ **Partage facile**
   - URL pour envoyer aux invités

✅ **Backup automatique**
   - Fichiers sauvegardés

✅ **Accès depuis partout**
   - Même depuis d'autres appareils

✅ **Professionnel**
   - Vraie application web

---

## ❌ Inconvénients

❌ **Plus complexe** que localStorage
❌ **Nécessite un serveur** (gratuit ou payant)
❌ **Internet requis** (pas d'offline)
❌ **Maintenance** du serveur

---

## 💡 Recommandation FINALE

**Pour votre mariage :**

### **Phase 1 : Mariage (court terme)**
→ **IndexedDB** (gratuit, persistant, 500MB)

### **Phase 2 : Après mariage (sauvegarde)**
→ **Backend Serveur** (stockage long terme)

→ **Ou directement Backend** si vous voulez une vraie app pro

---

## 🎯 Verdict

**Backend Serveur = Meilleure Solution à Long Terme**

- Persistance 100% garantie
- Partage facile
- Professional
- Peu coûteux (gratuit à $10/mois)

**Vous voulez que je l'implémente ?** 🚀


