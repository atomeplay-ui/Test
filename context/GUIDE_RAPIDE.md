# 🎉 Guide Rapide - Galerie Photos de Mariage

## 🚀 Démarrage Immédiat

### Option 1 : Ouvrir directement dans le navigateur (Recommandé)

1. **Double-cliquez sur le fichier** : `public/index-standalone.html`
   
   OU
   
2. **Ouvrez en ligne de commande** :
   ```bash
   start public\index-standalone.html
   ```

**C'est tout !** L'application s'ouvrira immédiatement dans votre navigateur.

---

## 📸 Comment Utiliser

### 1️⃣ **Autoriser la Caméra**
- Cliquez sur "📸 Capturer la photo"
- Acceptez la demande d'accès à la caméra
- Vous verrez le flux vidéo en direct

### 2️⃣ **Prendre une Photo**
- **Option A** : Cliquez sur le bouton "📸 Capturer la photo"
- **Option B** : Appuyez sur la **barre d'espacement**

### 3️⃣ **Prévisualiser**
- L'aperçu s'affichera automatiquement
- Vérifiez que vous êtes satisfait

### 4️⃣ **Sauvegarder**
- Cliquez sur "✅ Sauvegarder"
- La photo est automatiquement stockée

### 5️⃣ **Voir la Galerie**
- Toutes les photos apparaissent dans la section "🎞️ Galerie"
- Survolez une photo pour voir les options

### 6️⃣ **Gérer les Photos**
- **Télécharger** : ⬇️ Cliquez sur le bouton de téléchargement
- **Supprimer** : 🗑️ Cliquez pour supprimer
- **Agrandir** : Cliquez sur la photo pour la voir en grand écran

---

## ⌨️ Raccourcis Clavier

| Touche | Action |
|--------|--------|
| ESPACE | Capturer une photo |
| ÉCHAP | Reprendre la photo (annuler l'aperçu) |

---

## 💾 Où sont stockées les photos ?

✅ **Les photos sont sauvegardées dans votre navigateur** (localStorage)

- Aucun serveur requis
- Données privées et locales
- Accessible hors-ligne
- Partageable facilement (téléchargez les photos)

⚠️ **Limite de stockage** : ~50 photos maximum (dépend de votre navigateur)

---

## 🎨 Personnalisation

### Changer le Titre

Ouvrez `public/index-standalone.html` avec un éditeur de texte et trouvez :

```html
<h1>💒 Notre Mariage</h1>
<p class="subtitle">Capturez les plus beaux moments</p>
```

Remplacez par votre propre texte !

### Changer les Couleurs

Cherchez cette section au début du fichier :

```css
:root {
    --primary-color: #d4a5a5;      /* Rose/Marron principal */
    --secondary-color: #8b4c4c;    /* Rose/Marron secondaire */
    --accent-color: #f4e4e4;       /* Accent léger */
}
```

Remplacez les codes couleur hexadécimaux par vos couleurs préférées !

---

## 🔧 Dépannage

### ❌ "La caméra n'est pas disponible"

**Solutions** :
1. ✅ Vérifiez que votre ordinateur/téléphone a une caméra
2. ✅ Accordez la permission d'accès à la caméra
3. ✅ Assurez-vous que la caméra n'est pas utilisée par une autre application
4. ✅ Redémarrez le navigateur
5. ✅ Essayez avec un autre navigateur (Chrome, Firefox, Safari, Edge)

### ❌ Les photos ne s'affichent pas

**Solutions** :
1. ✅ Vérifiez que le stockage local n'est pas désactivé
2. ✅ Essayez en mode normal (pas en mode incognito)
3. ✅ Videz le cache du navigateur et rechargez

### ❌ Je ne peux pas télécharger les photos

**Solutions** :
1. ✅ Vérifiez que les téléchargements ne sont pas bloqués
2. ✅ Assurez-vous d'avoir de l'espace disque
3. ✅ Essayez un autre navigateur

---

## 📱 Compatible avec

✅ **Ordinateurs** (Windows, Mac, Linux)
✅ **Tablettes** (iPad, Android)
✅ **Téléphones** (iPhone, Android)

---

## 💡 Conseils d'Utilisation

1. **Sauvegardez régulièrement** - Téléchargez vos photos favorites
2. **Testez d'abord** - Assurez-vous que l'éclairage est bon
3. **Utilisez la meilleure qualité** - Le navigateur sauvegarde en haute résolution
4. **Nettoyez l'objectif** - Pour des photos nettes
5. **Profitez !** - C'est fait pour s'amuser ! 💕

---

## 📞 Besoin d'Aide ?

1. Consultez la section **Dépannage** ci-dessus
2. Vérifiez la console du navigateur (F12)
3. Essayez un navigateur différent
4. Redémarrez votre appareil

---

## 🎉 Bon Mariage !

Profitez de chaque moment et capturez les plus beaux souvenirs ! 📸💒💕

**Version** : 1.0 - Mode Hors-ligne
**Dernière mise à jour** : Juillet 2024
