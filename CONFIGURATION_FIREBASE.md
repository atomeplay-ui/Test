# 🔧 CONFIGURATION FIREBASE - GUIDE COMPLET

## 🎯 Objectif

Stocker les **photos, vidéos et audios dans le Cloud Firebase** au lieu du localStorage.

---

## 📋 Prérequis

- ✅ Compte Google
- ✅ Node.js installé
- ✅ npm installé
- ✅ Le backend `server.js` créé

---

## 🚀 Étape 1 : Créer un Projet Firebase

### 1.1 Aller sur Firebase Console

```
https://console.firebase.google.com/
```

### 1.2 Cliquer sur "Ajouter un projet"

```
Nom du projet : "Mariage App"
Plan : Spark (GRATUIT ✓)
```

### 1.3 Activer le stockage

**Gauche → Storage → Créer**

```
Localisation : Europe (ou votre région)
Règles : Mode test (pour développement)
```

### 1.4 Activer la base de données

**Gauche → Realtime Database → Créer**

```
Localisation : Europe
Mode : Mode test
```

---

## 🔑 Étape 2 : Obtenir les Clés Firebase

### 2.1 Créer un compte service

**Gauche → Paramètres du projet → Comptes de service**

### 2.2 Cliquer sur "Firebase Admin SDK"

Sélectionner **Node.js** → Cliquer sur **"Générer une nouvelle clé privée"**

```
⬇️ Fichier JSON téléchargé
```

### 2.3 Copier les valeurs

Ouvrir le fichier JSON téléchargé :

```json
{
  "type": "service_account",
  "project_id": "mariage-app-12345",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n....\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@mariage-app-12345.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk..."
}
```

---

## 📝 Étape 3 : Configurer le Fichier .env

### 3.1 Créer le fichier `.env`

**Dans le dossier racine (`/Test/`) :**

```bash
# Copier .env.example
cp .env.example .env
```

### 3.2 Remplir avec vos valeurs Firebase

```env
FIREBASE_PROJECT_ID=mariage-app-12345
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@mariage-app-12345.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40mariage-app-12345.iam.gserviceaccount.com
FIREBASE_BUCKET=mariage-app-12345.appspot.com
PORT=3000
PASSWORD=2024
```

### 3.3 Important : Sécurité

**Ne JAMAIS pousser `.env` sur GitHub !**

Ajouter à `.gitignore` :
```
.env
*.env
```

---

## 💻 Étape 4 : Installer les Dépendances

```bash
# Dans le dossier /Test/
npm install
```

**Cela installe :**
- ✅ express - serveur web
- ✅ multer - upload fichiers
- ✅ firebase-admin - accès Firebase
- ✅ cors - sécurité
- ✅ dotenv - lecture .env

---

## ▶️ Étape 5 : Lancer le Serveur

```bash
npm start
```

**Vous devez voir :**

```
╔═══════════════════════════════════════╗
║   Backend Mariage - Démarré ✓        ║
╚═══════════════════════════════════════╝

📍 Serveur: http://localhost:3000
🔒 Mot de passe: 2024
💾 Stockage: Firebase Cloud ☁️

API Endpoints:
  POST   /api/upload        - Upload fichier
  GET    /api/files         - Lister fichiers
  GET    /api/files/:id     - Récupérer fichier
  DELETE /api/files/:id     - Supprimer fichier
```

---

## ✅ Étape 6 : Vérifier que ça Marche

### Tester la connexion Firebase :

```bash
curl http://localhost:3000/api/health
```

**Réponse :**
```json
{
  "status": "ok",
  "firebase": "connected",
  "storage": "cloud"
}
```

✅ **Si vous voyez "firebase": "connected"** → Tout est bon !

---

## 🔐 Étape 7 : Configurer les Règles de Sécurité Firebase

### Pour Storage :

**Firebase Console → Storage → Règles**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      // Autoriser lecture depuis le serveur
      allow read: if request.auth != null || true;
      // Autoriser écriture depuis le serveur (elle a les clés)
      allow write: if request.auth != null;
    }
  }
}
```

### Pour Realtime Database :

**Firebase Console → Realtime Database → Règles**

```json
{
  "rules": {
    "files": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

---

## 🎯 Étape 8 : Intégrer dans le Frontend

Modifier `public/index-standalone.html` pour envoyer au serveur :

```javascript
// Avant (localStorage)
function saveVideoToGallery(videoUrl) {
  let videos = JSON.parse(localStorage.getItem('weddingVideos')) || [];
  videos.unshift({ videoUrl, uploadedAt: new Date().toISOString() });
  localStorage.setItem('weddingVideos', JSON.stringify(videos));
}

// Après (Backend Cloud)
async function saveVideoToGallery(videoBlob) {
  const formData = new FormData();
  formData.append('file', videoBlob, 'video.webm');
  formData.append('fileType', 'video');
  
  const response = await fetch('/api/upload?password=2024', {
    method: 'POST',
    body: formData
  });
  
  const { fileId, url } = await response.json();
  console.log('Vidéo uploadée :', url);
  
  // Afficher dans la galerie
  displayVideoFromServer(url);
}
```

---

## 📊 Structure Firebase Cloud

**Après les uploads, vous aurez :**

```
Storage (Firebase):
  uploads/
    ├─ photo/
    │  ├─ 1234567890
    │  └─ 1234567891
    ├─ video/
    │  ├─ 1234567892
    │  └─ 1234567893
    └─ audio/
       ├─ 1234567894
       └─ 1234567895

Realtime Database:
  files/
    ├─ 1234567890: {
    │    fileId: "1234567890",
    │    filename: "photo.jpg",
    │    type: "photo",
    │    uploadedAt: "2024-07-02T..."
    │  }
    ├─ 1234567891: {...}
    └─ ...
```

---

## 🔄 Flux Complet (Frontend → Backend → Firebase)

```
1. Utilisateur prend une vidéo
   ↓
2. Frontend crée un Blob
   ↓
3. Frontend envoie au serveur :
   POST /api/upload?password=2024
   Body: FormData { file: videoBlob }
   ↓
4. Serveur reçoit le fichier
   ↓
5. Serveur envoie à Firebase Storage
   ↓
6. Firebase stocke le fichier dans le Cloud ☁️
   ↓
7. Serveur sauvegarde les métadonnées en Realtime Database
   ↓
8. Serveur retourne l'URL au frontend :
   { fileId: "123", url: "https://storage.firebase.com/..." }
   ↓
9. Frontend affiche l'URL dans la galerie
   ↓
10. Rechargement page = fichier TOUJOURS accessible ✓
    (URL pointe vers le cloud, pas vers localStorage)
```

---

## 🆓 Limites Gratuites Firebase (Spark Plan)

**Storage :**
- ✅ 5 GB de stockage
- ✅ 1 GB/jour de téléchargement

**Realtime Database :**
- ✅ 100 connexions simultanées
- ✅ 1 GB de stockage

**Pour votre mariage :**
- 📷 ~50 photos = ~500 MB
- 🎥 ~10 vidéos = ~2-5 GB (DÉPASSE LIMIT)
- 🎤 ~50 audios = ~50 MB

⚠️ **Si beaucoup de vidéos, passer au plan payant (~$5-10/mois)**

---

## 🐛 Troubleshooting

### Erreur : "Firebase non configuré - mode local activé"

```
❌ Firebase n'est pas connecté
✅ Solution : Vérifier le fichier .env
```

**Vérifier :**
```bash
# Afficher les variables d'env
echo $FIREBASE_PROJECT_ID
```

### Erreur : "PERMISSION_DENIED"

```
❌ Les règles de sécurité sont trop strictes
✅ Solution : Activer le mode test dans Firebase Console
```

### Erreur : "File not found"

```
❌ Le fichier n'a pas été uploadé correctement
✅ Solution : Vérifier la limite de taille (100MB max)
```

---

## 📝 Commandes Utiles

```bash
# Démarrer le serveur
npm start

# Développement (redémarrage auto)
npm run dev

# Vérifier l'état
curl http://localhost:3000/api/health

# Lister les fichiers
curl http://localhost:3000/api/files

# Voir les logs Firebase
npm run logs
```

---

## ✨ Résumé

**Vous avez maintenant :**

✅ Un backend serveur Node.js
✅ Stockage Cloud Firebase
✅ API REST complète
✅ Sécurité par mot de passe
✅ Limite de 5GB (gratuit)

**Prochaine étape :**
→ Modifier le frontend pour envoyer au serveur au lieu de localStorage

---

## 🎊 Félicitations !

Votre application de mariage est maintenant **prête pour le Cloud** ! ☁️

Les photos, vidéos et audios seront stockés de façon **permanente et sécurisée** ! 💒✨


