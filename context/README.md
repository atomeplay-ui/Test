# 💒 Galerie de Photos de Mariage

Une application web moderne pour capturer et stocker des photos de mariage. Les utilisateurs peuvent accéder au site, utiliser leur caméra pour prendre des photos, et consulter une galerie de toutes les photos stockées.

## 🎯 Caractéristiques

✅ **Capture de Photo en Direct**
- Accès à la caméra du navigateur
- Aperçu en temps réel
- Support de plusieurs caméras/appareils photo

✅ **Galerie Interactive**
- Affichage en grille des photos
- Visualisation en grand écran (lightbox)
- Compteur de photos

✅ **Gestion des Photos**
- Sauvegarde automatique sur le serveur
- Téléchargement des photos
- Suppression de photos

✅ **Thème Mariage**
- Design élégant avec couleurs rose/marron
- Interface responsive (adapté mobile, tablette, desktop)
- Animations fluides et transitions

## 📋 Prérequis

- **Python 3.6+** (aucune dépendance externe requise)
- Un navigateur web moderne avec support WebRTC (Chrome, Firefox, Safari, Edge)
- Une caméra web (webcam)

## 🚀 Démarrage rapide

### 1. Lancer le serveur

```bash
python server.py
```

Ou sur Windows :

```bash
python server.py
```

Le serveur démarrera sur `http://localhost:3000`

### 2. Accéder à l'application

Ouvrez votre navigateur et allez à :
```
http://localhost:3000
```

### 3. Utiliser l'application

1. **Autoriser la caméra** - Cliquez sur "Capturer la photo" et acceptez l'accès à la caméra
2. **Prendre une photo** - Cliquez sur le bouton "📸 Capturer la photo" ou appuyez sur ESPACE
3. **Prévisualiser** - L'aperçu s'affichera automatiquement
4. **Sauvegarder** - Cliquez sur "✅ Sauvegarder" pour enregistrer la photo
5. **Consulter la galerie** - Toutes les photos apparaissent dans la section "🎞️ Galerie"
6. **Gérer les photos** - Survolez une photo pour télécharger ou supprimer

## 📁 Structure du projet

```
Test/
├── server.py              # Serveur Python (principal)
├── server.js              # Serveur Node.js (alternative)
├── package.json           # Dépendances Node.js
├── README.md              # Documentation
├── public/
│   ├── index.html         # Page principale
│   ├── styles.css         # Styles CSS
│   └── app.js             # JavaScript client
└── uploads/               # Dossier de stockage des photos (créé auto)
```

## 🎮 Raccourcis Clavier

| Touche | Action |
|--------|--------|
| ESPACE | Capturer une photo |
| ÉCHAP  | Reprendre une photo |

## 🌐 Endpoints API

### GET `/api/photos`
Récupère la liste de toutes les photos stockées.

**Réponse :**
```json
{
  "success": true,
  "photos": [
    {
      "filename": "photo-1234567890-abc123.jpg",
      "url": "/uploads/photo-1234567890-abc123.jpg",
      "uploadedAt": "2024-07-02T13:09:00"
    }
  ]
}
```

### POST `/api/upload`
Upload une nouvelle photo.

**Corps de la requête :**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Photo sauvegardée avec succès",
  "filename": "photo-1234567890-abc123.jpg",
  "url": "/uploads/photo-1234567890-abc123.jpg"
}
```

### DELETE `/api/photos/{filename}`
Supprime une photo.

**Réponse :**
```json
{
  "success": true,
  "message": "Photo supprimée avec succès"
}
```

## 🔧 Configuration

Les paramètres peuvent être modifiés dans `server.py` :

```python
PORT = 3000              # Port du serveur
UPLOAD_DIR = 'uploads'   # Dossier de stockage des photos
PUBLIC_DIR = 'public'    # Dossier des fichiers statiques
```

## 📱 Compatibilité

| Navigateur | Support |
|-----------|---------|
| Chrome | ✅ Complet |
| Firefox | ✅ Complet |
| Safari | ✅ Complet |
| Edge | ✅ Complet |
| IE 11 | ❌ Non supporté |

## 🔐 Sécurité

- Validation des noms de fichiers
- Vérification des chemins de fichiers (pas de traversée de répertoires)
- Limitation de la taille des fichiers (10MB)
- Acceptation uniquement des images

## 🎨 Personnalisation

### Thèmes
Modifiez les variables CSS dans `public/styles.css` :

```css
:root {
    --primary-color: #d4a5a5;      /* Rose/Marron principal */
    --secondary-color: #8b4c4c;    /* Rose/Marron secondaire */
    --accent-color: #f4e4e4;       /* Accent léger */
}
```

### Titre et Sous-titre
Modifiez dans `public/index.html` :

```html
<h1>💒 Notre Mariage</h1>
<p class="subtitle">Capturez les plus beaux moments</p>
```

## 🚨 Dépannage

### "Caméra non disponible"
- Vérifiez que votre appareil a une caméra
- Accordez la permission d'accès à la caméra
- Assurez-vous que la caméra n'est pas utilisée par une autre application
- Utilisez HTTPS (certains navigateurs exigent HTTPS)

### Les photos ne s'affichent pas
- Vérifiez que le dossier `uploads/` existe et est accessible
- Vérifiez les permissions de fichier
- Vérifiez la console du navigateur (F12) pour les erreurs

### Erreur de serveur
- Assurez-vous que le port 3000 n'est pas utilisé
- Redémarrez le serveur
- Vérifiez que Python 3.6+ est installé

## 📞 Support

Pour les problèmes techniques, consultez :
- La console du navigateur (F12)
- Les logs du serveur (terminal)

## 📝 Licence

Libre d'utilisation pour les mariages et événements 💒

## 🎉 Bon mariage !

Profitez de chaque moment et capturez les plus beaux souvenirs ! 💕
