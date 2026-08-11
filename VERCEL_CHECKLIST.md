# ✅ Vercel Deployment Checklist

Avant de déployer, assurez-vous que tout est prêt !

---

## 📋 Avant le déploiement

### **Code & Repository**
- [ ] Code pushé sur GitHub (`git push origin main`)
- [ ] `vercel.json` créé ✓
- [ ] `.vercelignore` créé ✓
- [ ] `package.json` avec tous les scripts
- [ ] `server.js` vérifié
- [ ] `public/` avec tous les fichiers statiques
- [ ] Pas d'erreurs dans le code (`npm run dev` fonctionne)

### **Firebase Configuration**
- [ ] Firebase projet créé
- [ ] Firebase Storage configuré
- [ ] Firebase Realtime Database configuré
- [ ] Service Account key téléchargée (JSON)
- [ ] Fichier `.env` avec toutes les variables
- [ ] `.env` bien structuré (test local)

### **Variables d'Environnement Locales**
```bash
# Vérifier que votre .env local contient :
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_CLIENT_ID=xxx
FIREBASE_CERT_URL=xxx
FIREBASE_BUCKET=xxx
PORT=3000
```

- [ ] Toutes les 7 variables Firebase présentes
- [ ] Pas d'espacements superflus
- [ ] `FIREBASE_PRIVATE_KEY` avec `\n` corrects

---

## 🚀 Installation Vercel

### **CLI Vercel**
- [ ] Vercel CLI installé : `npm install -g vercel`
- [ ] Version à jour : `vercel --version`
- [ ] Connecté à Vercel : `vercel login`

### **Vérifications locales**
```bash
# Vérifier que tout fonctionne localement
npm start
# Tester http://localhost:3000/
```

- [ ] API répond : `http://localhost:3000/api/health`
- [ ] Frontend charge : `http://localhost:3000/`
- [ ] Caméra fonctionne
- [ ] Buttons réactifs

---

## 📤 Déploiement

### **Première Déploiement**
```bash
# Depuis le répertoire du projet
cd "OneDrive - SPIE/Documents/Test"
vercel
```

- [ ] Questions répondues correctement
- [ ] Project name : `mariage-app`
- [ ] Directory : `.` (current)
- [ ] Auto-detect build : `y`
- [ ] Déploiement terminé avec succès

### **Configuration Vercel Dashboard**

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet `mariage-app`
3. Aller dans **Settings → Environment Variables**

- [ ] Ajouter `FIREBASE_PROJECT_ID`
- [ ] Ajouter `FIREBASE_PRIVATE_KEY_ID`
- [ ] Ajouter `FIREBASE_PRIVATE_KEY` (avec `\n`)
- [ ] Ajouter `FIREBASE_CLIENT_EMAIL`
- [ ] Ajouter `FIREBASE_CLIENT_ID`
- [ ] Ajouter `FIREBASE_CERT_URL`
- [ ] Ajouter `FIREBASE_BUCKET`
- [ ] Ajouter `NODE_ENV=production`

### **Redéploiement après variables**
```bash
vercel --prod
```

- [ ] Redéploiement réussi
- [ ] URL générée : `https://mariage-app-xxxxx.vercel.app/`

---

## ✅ Vérifications Post-Déploiement

### **1. Page charge correctement**
```bash
# Tester l'accès
curl https://votre-url.vercel.app/
```

- [ ] Statut HTTP 200
- [ ] Page HTML charge
- [ ] Pas d'erreur 500

### **2. API répond**
```bash
curl https://votre-url.vercel.app/api/health
```

- [ ] Retourne JSON valide
- [ ] Status "ok"
- [ ] Pas d'erreur Firebase

### **3. Frontend fonctionne**
1. Ouvrir https://votre-url.vercel.app/ dans navigateur
2. Ouvrir DevTools (F12)

- [ ] Pas d'erreurs dans Console
- [ ] Pas d'erreurs dans Network
- [ ] Page responsive (mobile OK)
- [ ] Caméra demande permission
- [ ] Buttons clickables

### **4. Capture photo fonctionne**
1. Cliquer sur "Capture"
2. Cliquer [📷] pour prendre photo
3. Cliquer "Sauvegarder"

- [ ] Pas d'erreur lors upload
- [ ] Message "Photo sauvegardée"
- [ ] Pas de timeout

### **5. Galerie se remplit**
1. Aller dans Galerie (password: 2024)
2. Vérifier que photo est là

- [ ] Galerie affiche la photo uploadée
- [ ] Image charge correctement
- [ ] Buttons download/delete fonctionnent

### **6. Messages audio fonctionne**
1. Aller dans "Message"
2. Cliquer [🎤]
3. Enregistrer quelques secondes
4. Cliquer "Sauvegarder"

- [ ] Enregistrement fonctionne
- [ ] Aperçu joue
- [ ] Upload réussit
- [ ] Message sauvegardé

### **7. Métadonnées Firebase**
1. Ouvrir Firebase Console
2. Aller dans Realtime Database

- [ ] Messages audio affichés avec métadonnées
- [ ] Photos affichées avec métadonnées
- [ ] Timestamps présents
- [ ] Authors sauvegardés

### **8. Fichiers Firebase Storage**
1. Firebase Console → Storage
2. Vérifier les dossiers

- [ ] `photos/` contient les images
- [ ] `audio/` contient les messages
- [ ] `video/` contient les vidéos
- [ ] Fichiers accessibles

---

## 🐛 Troubleshooting

### **Erreur : Firebase credentials not found**
- [ ] Variables d'env bien ajoutées dans Vercel
- [ ] `FIREBASE_PRIVATE_KEY` contient `\n` et pas `\\n`
- [ ] Redéployer après ajouter variables

### **Erreur : Cannot find module**
- [ ] Tous les packages dans `package.json`
- [ ] `npm install` exécuté localement
- [ ] `package-lock.json` commité

### **Galerie vide après déploiement**
- [ ] Firebase Storage accessible
- [ ] Variables d'env Firebase correctes
- [ ] Vérifier les logs : `vercel logs https://votre-url.vercel.app`

### **Lenteur au premier chargement**
- [ ] Normal (cold start Node.js)
- [ ] Attendre 5-10 secondes
- [ ] Deuxième chargement plus rapide

### **CORS Errors**
- [ ] `cors` middleware configuré
- [ ] Firebase Storage CORS rules OK
- [ ] Headers d'accès configurés

---

## 📝 Commandes Utiles

```bash
# Voir le statut
vercel status

# Voir les logs
vercel logs https://votre-url.vercel.app

# Voir les variables d'env
vercel env ls

# Redéployer la dernière version
vercel --prod

# Voir les déploiements
vercel ls

# Récupérer config locale
vercel env pull
```

---

## 🎯 Configuration Finale

Fichiers créés pour Vercel :
- [x] `vercel.json` - Configuration Vercel
- [x] `.vercelignore` - Fichiers à ignorer
- [x] `VERCEL_DEPLOYMENT.md` - Guide complet
- [x] `VERCEL_QUICK_START.md` - Quick start
- [x] `VERCEL_CHECKLIST.md` - Cette checklist
- [x] `.env.example` - Variables d'exemple

---

## ✨ Après Déploiement

### **URL Production**
```
https://mariage-app-xxxxx.vercel.app/
```

### **Partager avec les invités**
1. Copier l'URL
2. Envoyer par email/WhatsApp
3. Invités peuvent uploader photos/messages

### **Mises à Jour Futures**
```bash
# Faire modification locale
# ...

# Push sur GitHub
git add .
git commit -m "Mon update"
git push origin main

# Redéployer
vercel --prod
```

---

## 💡 Points Importants

✅ **Domaine gratuit** : `*.vercel.app`
✅ **SSL/HTTPS gratuit** : Automatique
✅ **Bande passante** : 100GB/mois gratuit
✅ **Pas de coûts cachés** : Firebase facture à l'utilisation
✅ **Uptime** : 99.95% SLA

⚠️ **À noter** :
- Firebase Storage facture au-delà de 5GB/mois
- Realtime Database facture l'utilisation
- Vercel CLI peut être utilisé partout

---

## 🎉 Félicitations !

Votre site de mariage est maintenant en production sur Vercel !

**Prochaines étapes** :
1. Tester avec des vrais invités
2. Collecter les photos
3. Créer un backup Firebase
4. Envisager domaine personnalisé (optionnel)

**Besoin d'aide ?**
- Vercel Support : https://vercel.com/help
- Firebase Support : https://firebase.google.com/support
- GitHub Issues : Votre repo GitHub

---

**Status : ✅ PRÊT POUR PRODUCTION**

Bon déploiement ! 🚀💍
