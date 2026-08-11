# 🎥 FIX - Écran Noir de la Caméra

## 🔴 Symptôme

L'écran de la caméra est noir après le rechargement ou le redémarrage du serveur.

## ✅ Solutions (dans cet ordre)

### Solution 1 : Vider le Cache Navigateur

#### Chrome/Edge
1. **Ouvrir DevTools** : `F12` ou `Ctrl+Shift+I`
2. **Aller à** : Network → Cocher "Disable cache"
3. **Rafraîchir** : `Ctrl+Shift+R` (hard refresh)
4. **Fermer DevTools** : `F12`

#### Safari iPhone
1. **Aller à** : Settings → Safari → Advanced → Website Data
2. **Supprimer les données** pour localhost
3. **Fermer Safari** complètement
4. **Rouvrir** et tester

#### Firefox
1. **Ctrl+Shift+Delete** → Sélectionner la période
2. **Cocher** : Cache, Cookies
3. **Supprimer**
4. **Rafraîchir** : `Ctrl+Shift+R`

---

### Solution 2 : Vider le Cache Complètement

#### Chrome
```
Ctrl+Shift+Delete
Sélectionner : "Toute la période"
Cocher : Cache, Cookies et données de site
Supprimer
```

#### Safari
```
Settings → Safari → Clear History and Website Data
Sélectionner : "all time"
Cliquer : Clear History and Data
```

---

### Solution 3 : Redémarrer Complètement

```bash
# Terminal 1 - ARRÊTER le serveur
Ctrl+C

# ATTENDRE 2 secondes

# Redémarrer
npm start

# Attendre que le message apparaisse :
# "Backend Mariage - Démarré ✓"
```

Puis :
1. **Vider le cache navigateur** (voir Solution 1)
2. **Rafraîchir la page** : `F5` ou `Cmd+R`
3. **Attendre 2-3 secondes**
4. **La caméra devrait s'initialiser**

---

### Solution 4 : Vérifier la Console du Navigateur

```
F12 → Onglet Console → Regarder les erreurs
```

**Si vous voyez :**
- `Erreur d'accès à la caméra` → Permission refusée
- `Caméra non disponible` → Déjà utilisée
- `Permission denied` → Autoriser dans les paramètres
- **Aucune erreur mais écran noir** → Cache problème

---

### Solution 5 : Sur iPhone Safari

#### Donner les Permissions Complètes

1. **Aller à** : Settings → Privacy → Camera
2. **Chercher** : Safari
3. **Sélectionner** : Allow
4. **Fermer** Safari complètement
5. **Rouvrir** Safari
6. **Aller sur** : http://localhost:3000/
7. **Rafraîchir** : Cmd+R
8. **Cliquer** : Allow quando il chiede

#### Si toujours noir :

1. **Fermer Safari** complètement
2. **Attendre** 10 secondes
3. **Rouvrir Safari**
4. **Aller sur** le site
5. **Rafraîchir** la page

---

### Solution 6 : Reset Complètement

```bash
# 1. Arrêter npm
Ctrl+C

# 2. Attendre 5 secondes

# 3. Redémarrer
npm start

# 4. Vider le cache navigateur (Ctrl+Shift+Delete)

# 5. Hard refresh (Ctrl+Shift+R)

# 6. Attendre 3 secondes

# 7. Si toujours noir : F12 → Console → Copier les erreurs
```

---

## 📊 Diagnostic Checklist

- [ ] Serveur démarre sans erreur
- [ ] Message "Backend Mariage - Démarré ✓" visible
- [ ] Cache navigateur vidé
- [ ] Page hard refreshed (Ctrl+Shift+R)
- [ ] Attendu 2-3 secondes pour l'initialisation
- [ ] Console ouverte (F12) - aucune erreur visible
- [ ] Caméra s'initialise (vous devez voir le flux vidéo)

---

## 🧪 Test Simple

### Sur Ordinateur

```bash
# Terminal 1
npm start

# Terminal 2
curl http://localhost:3000/api/health
# Doit répondre : {"status":"ok",...}
```

### Navigateur

1. **Ouvrir** : http://localhost:3000/
2. **F12** → Console
3. **Attendre** 2-3 secondes
4. **Regarder** s'il y a des erreurs
5. **Si pas d'erreurs mais écran noir** → Vider cache

---

## 🔧 Réinitialiser Complètement (Dernier Recours)

### Windows

```bash
# 1. Arrêter npm (Ctrl+C)

# 2. Effacer les fichiers temporaires
rmdir /s /q "c:\Users\Tom\Documents\Test\uploads"
rmdir /s /q "c:\Users\Tom\Documents\Test\metadata"

# 3. Redémarrer npm
npm start

# 4. Vider le cache navigateur
# (Ctrl+Shift+Delete)

# 5. Ouvrir http://localhost:3000/
```

---

## 💡 Pourquoi Ça Arrive

### Causes Possibles

1. **Cache navigateur** - Ancienne version HTML/JS chargée
2. **Permission caméra** - Révoquée ou pas donnée
3. **Autre app utilise la caméra** - Fermer autres apps
4. **Serveur pas redémarré** - Ancien code en mémoire
5. **Firefox bloquerait** - Vérifier autorisations

### Solutions par Cause

| Cause | Solution |
|-------|----------|
| **Cache** | Ctrl+Shift+R |
| **Permission** | Settings → Caméra → Allow |
| **Autre app** | Fermer autres apps (Skype, Teams, etc.) |
| **Serveur** | Ctrl+C puis npm start |
| **Firefox** | Vérifier about:preferences#privacy |

---

## 🎯 Ordre de Test Recommandé

1. **Vider cache** (Ctrl+Shift+Del)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Attendre 3 sec**
4. **Vérifier console** (F12)
5. **Si toujours noir** → Redémarrer npm
6. **Si toujours noir** → Restart système

---

## 📞 Si Toujours Pas de Caméra

### Fournir Ces Informations

```
1. Erreurs visibles dans la console (F12)
2. Serveur affiche quel message ?
3. Vous voyez quoi sur l'écran ?
4. Quel navigateur (Chrome, Safari, Firefox) ?
5. Quel système (Windows, iPhone) ?
```

---

## 🚀 PROCÉDURE COMPLÈTE À SUIVRE

```bash
# 1. Arrêter le serveur
Ctrl+C

# 2. Attendre 3 secondes

# 3. Redémarrer
npm start

# 4. ATTENDRE LE MESSAGE :
#    "Backend Mariage - Démarré ✓"

# 5. Ouvrir navigateur
# http://localhost:3000/

# 6. VIDER LE CACHE
Ctrl+Shift+Delete
→ Tout sélectionner
→ Supprimer

# 7. HARD REFRESH
Ctrl+Shift+R

# 8. ATTENDRE 3 SECONDES

# 9. LA CAMÉRA DOIT S'INITIALISER ✅
```

---

## ✅ Si Ça Fonctionne Maintenant

Bravo ! Vous pouvez :
1. Prendre des photos
2. Enregistrer des vidéos
3. Laisser des messages
4. Accéder à la galerie
5. Tester complètement ! 🎊

---

## 💒 Application Mariage - Prête !

Si vous arrivez ici, tout fonctionne ! Lancez le serveur et testez !


