# 🔍 DIAGNOSTIQUE - Les Photos ne s'Affichent Pas

## 🎯 Problème

Les photos ne s'affichent pas dans l'onglet "Photos" même après avoir pris une photo et cliqué "Sauvegarder".

---

## ✅ Checklist de Débogage

### 1️⃣ Vérifier que le Serveur Fonctionne

```bash
# Terminal 1 - Lancer le serveur
cd c:\Users\Tom\Documents\Test
npm start
```

**Vous devez voir :**
```
✅ Firebase Storage connecté
💾 Storage: Connecté
📊 Database: Connectée (ou Non configurée)

Backend Mariage - Démarré ✓
📍 Serveur: http://localhost:3000
```

### 2️⃣ Vérifier que les Photos Sont Upload

**Terminal 2 - Tester l'API :**

```bash
# Lister TOUTES les photos
curl http://localhost:3000/api/files?type=photo

# Vous devez voir quelque chose comme :
# {
#   "success": true,
#   "count": 1,
#   "files": [
#     {
#       "fileId": "1234567890",
#       "url": "https://storage.firebase.com/...",
#       "metadata": {
#         "filename": "photo-1234567890.jpg",
#         "type": "photo",
#         "size": 2500000,
#         "uploadedAt": "2024-07-02T..."
#       }
#     }
#   ]
# }
```

**Si vous voyez :**
- `"count": 0` → Les photos ne sont pas uploadées
- Erreur → Problème serveur
- URL Firebase → Les photos sont bien uploadées ✅

### 3️⃣ Vérifier la Caméra du Navigateur

**Ouvrir DevTools (F12) → Console :**

1. Prendre une photo
2. Cliquer "Sauvegarder"
3. Regarder la console pour les logs
4. Chercher :
   - `❌ Erreur d'envoi:` → Problème upload
   - `✅ Photo sauvegardée dans le cloud!` → Upload réussi
   - Aucun message → Pas de call au serveur

### 4️⃣ Vérifier que loadGallery() Est Appelée

**Ouvrir DevTools → Console :**

```javascript
// Taper dans la console et appuyer sur Entrée
loadGallery()
```

**Vous devez voir :**
- Photos s'affichent immédiatement
- Message d'erreur dans la console
- Rien ne se passe

---

## 🔴 Scénarios Possibles

### Scénario 1 : Photos ne s'uploadent pas du tout

**Symptôme :**
- Message : `❌ Erreur d'envoi`
- Console : Erreur réseau

**Solution :**
```bash
# Vérifier que le serveur écoute
curl http://localhost:3000/api/health

# Doit répondre : {"status":"ok","firebase":"connected","storage":"cloud"}
```

### Scénario 2 : Photos s'uploadent mais ne s'affichent pas

**Symptôme :**
- Message : `✅ Photo sauvegardée dans le cloud!`
- Mais onglet "Photos" est vide

**Causes possibles :**
1. **loadGallery() ne s'appelle pas** après l'upload
2. **loadGallery() appelle le mauvais endpoint**
3. **Les URLs Firebase ne chargent pas**
4. **CORS bloque les requêtes**

**Tester :**
```bash
# Dans la console du navigateur
await loadGallery()

# Puis regarder les erreurs
```

### Scénario 3 : loadGallery() est appelée mais reste vide

**Symptôme :**
- `loadGallery()` retourne sans erreur
- Galerie reste vide

**Causes possibles :**
1. **L'API retourne `"files": []`** (pas de photos)
2. **Les URLs Firebase sont invalides**
3. **Les images ne chargent pas (CORS)**

**Tester :**
```bash
# Dans la console
fetch('/api/files?type=photo').then(r => r.json()).then(d => console.log(d))

# Regarder si :
# - count > 0
# - files contient des données
# - URLs sont valides
```

---

## 🛠️ Solutions Rapides

### Solution 1 : Vérifier que savePhoto() Appelle loadGallery()

**Dans index.html, fonction savePhoto() :**

```javascript
async function savePhoto() {
    // ... code upload ...
    
    if (result.success) {
        showToast('✅ Photo sauvegardée dans le cloud!');
        retakePhoto();
        loadGallery();  // ← Cette ligne DOIT être présente
    }
}
```

✅ **C'est déjà fait dans le code.**

### Solution 2 : Vérifier que loadGallery() Récupère l'API

**Dans index.html, fonction loadGallery() :**

```javascript
async function loadGallery() {
    const response = await fetch('/api/files?type=photo');
    const photosData = await response.json();
    
    if (photosData.files) allMedia.push(...photosData.files);  // ← Vérifier que files existe
}
```

✅ **C'est déjà fait dans le code.**

### Solution 3 : Vérifier que l'API Retourne les Photos

**Terminal :**

```bash
curl http://localhost:3000/api/files?type=photo

# Si vous voyez "count": 0 ou "files": null
# → Pas de photos uploadées
```

---

## 🧪 Test Complet Pas à Pas

### Étape 1 : Démarrer le serveur

```bash
cd c:\Users\Tom\Documents\Test
npm start
```

### Étape 2 : Ouvrir le navigateur

```
http://localhost:3000/
```

### Étape 3 : Ouvrir la console (F12)

Aller à l'onglet **Console**

### Étape 4 : Prendre une photo

1. Cliquer sur "Capture"
2. Cliquer sur le bouton rouge
3. Cliquer "Sauvegarder"
4. **Regarder la console** pour les messages

**Vous devez voir :**
```
✅ Photo sauvegardée dans le cloud!
```

### Étape 5 : Aller à l'onglet Photos

1. Cliquer sur "Photos" (menu bas)
2. Entrer mot de passe : `2024`
3. Cliquer "Valider"
4. **Regarder la console** pour les logs

**Vous devez voir :**
- Pas d'erreur
- Ou une erreur comme `404 Not Found`

### Étape 6 : Vérifier l'API dans la console

```javascript
// Taper dans la console
fetch('/api/files?type=photo')
    .then(r => r.json())
    .then(d => {
        console.log('Photos API Response:', d);
        console.log('Count:', d.count);
        console.log('Files:', d.files);
    })
    .catch(e => console.error('Erreur:', e))
```

**Regarder ce qui s'affiche :**
- `Count: 0` → Pas de photos uploadées
- `Count: 1` → 1 photo uploadée ✅
- Erreur → Problème serveur

---

## 📊 Points de Vérification

| Point | Vérifier | Expected |
|-------|----------|----------|
| **Serveur démarre** | `npm start` | Pas d'erreur, statut "ok" |
| **API santé** | `curl /api/health` | `{"status":"ok"}` |
| **Photos uploadées** | `curl /api/files?type=photo` | `"count": > 0` |
| **Frontend appelle API** | Console du navigateur | Pas d'erreur réseau |
| **Images chargent** | DevTools Network tab | HTTP 200 pour les images |
| **Galerie se remplissait** | Visuellement | Images visibles |

---

## 🔧 Si Rien Ne Fonctionne

### Réinitialiser Complètement

```bash
# 1. Arrêter le serveur (Ctrl+C)

# 2. Effacer le cache navigateur
# Chrome : Ctrl+Shift+Del → Tout effacer

# 3. Redémarrer le serveur
npm start

# 4. Rafraîchir la page
F5

# 5. Prendre une nouvelle photo
```

### Vérifier les Logs du Serveur

```bash
# Dans le terminal npm start, vous devez voir :
# POST /api/upload?password=2024 200 ...
# GET /api/files?type=photo 200 ...
```

Si vous voyez `404` ou `500` → Problème serveur.

---

## 📋 Rapport à Fournir

Si ça ne fonctionne toujours pas, voici ce qu'il faut vérifier :

1. **Output du serveur quand vous uploadez :**
   ```
   Copier/coller l'intégralité du message du serveur
   ```

2. **Réponse de l'API :**
   ```bash
   curl http://localhost:3000/api/files?type=photo
   # Copier la réponse
   ```

3. **Erreurs dans la console du navigateur :**
   ```
   Screenshot ou copier les erreurs
   ```

4. **Vérifier Firebase Console :**
   ```
   https://console.firebase.google.com/
   → Storage → uploads/ → voir si les fichiers sont là
   ```

---

## 🎯 Résumé

**Pour que les photos s'affichent :**

1. ✅ Photos doivent être uploadées (vérifier API)
2. ✅ loadGallery() doit être appelée après l'upload
3. ✅ Les URLs Firebase doivent être valides
4. ✅ Les images doivent charger (pas de CORS)
5. ✅ Le HTML doit être à jour (copié depuis index-standalone.html)

**Tout cela est déjà fait dans le code !**

Donc si ça ne fonctionne pas, c'est probablement :
- 🔴 Les photos ne s'uploadent pas du tout
- 🔴 L'API n'a pas de photos
- 🔴 Les URLs Firebase ne chargent pas

---

## 🚀 Prochaine Étape

**Lancez le serveur et testez :**

```bash
npm start
```

Puis :
1. Prenez une photo
2. Cliquez sur "Photos"
3. Ouvrez la console (F12)
4. Regardez ce qu'il y a dans les logs

**Copiez les erreurs ou logs et je peux déboguer !**


