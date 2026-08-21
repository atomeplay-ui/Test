# 🚀 Guide de Déploiement Vercel - Application Mariage

Ce guide vous explique comment déployer votre application de mariage sur **Vercel** (plateforme cloud gratuite et puissante).

---

## 📋 Prérequis

- [x] Compte GitHub (pour la connexion)
- [x] Compte Vercel (création gratuite)
- [x] Code pushé sur GitHub
- [x] Firebase configuré avec credentials

---

## 🎯 Étapes de Déploiement

### **1️⃣ Préparer votre projet**

```bash
# Vérifier que tout est à jour
git status
git add .
git commit -m "Préparation pour Vercel"
git push origin main
```

✅ **Fichiers nécessaires** :
- `vercel.json` ✓ (configuration Vercel)
- `.vercelignore` ✓ (fichiers à ignorer)
- `server.js` ✓ (serveur Express)
- `package.json` ✓ (dépendances)
- `public/` ✓ (fichiers statiques)

### **2️⃣ Se connecter à Vercel**

```bash
# Option 1 : Via CLI (recommandé)
npm install -g vercel
vercel login

# Option 2 : Via navigateur
# https://vercel.com
# Cliquer "Sign Up" → GitHub
```

### **3️⃣ Déployer le projet**

#### **Méthode 1 : Via CLI (Plus facile)**

```bash
# Dans le dossier du projet
cd /Users/Tom/OneDrive\ -\ SPIE/Documents/Test

# Première déploiement (interactif)
vercel

# Répondre aux questions :
# ? Set up and deploy "~/...Test"? [Y/n]  → Y
# ? Which scope do you want to deploy to? → Votre compte
# ? Link to existing project? [y/N]  → N
# ? What's your project's name? → mariage-app
# ? In which directory is your code? [.] → . (current)
# ? Auto-detect build settings? [y/N] → y
```

#### **Méthode 2 : Via Dashboard Web (Alternative)**

1. Aller sur https://vercel.com
2. Cliquer **"New Project"**
3. Sélectionner **"Import Git Repository"**
4. Connecter votre repo GitHub
5. Cliquer **"Deploy"**

### **4️⃣ Configurer les Variables d'Environnement**

**⚠️ IMPORTANT : Les variables Firebase**

1. Aller sur votre **Vercel Dashboard**
2. Sélectionner le projet `mariage-app`
3. Aller dans **Settings → Environment Variables**
4. Ajouter chaque variable :

```
FIREBASE_PROJECT_ID        → votre_project_id
FIREBASE_PRIVATE_KEY_ID    → votre_key_id
FIREBASE_PRIVATE_KEY       → votre_private_key (avec \n)
FIREBASE_CLIENT_EMAIL      → votre_email
FIREBASE_CLIENT_ID         → votre_client_id
FIREBASE_CERT_URL          → votre_cert_url
FIREBASE_BUCKET            → votre_bucket_name
NODE_ENV                   → production
```

**Comment récupérer ces variables ?**

```bash
# 1. Aller dans Firebase Console
# 2. Projet → Settings → Service Accounts
# 3. Cliquer "Generate New Private Key"
# 4. Fichier JSON téléchargé
# 5. Copier les valeurs dans Vercel

# OU si vous avez un .env local :
cat .env
# Copier chaque ligne dans Vercel
```

### **5️⃣ Redéployer après configuration**

```bash
# Après ajouter les variables d'env
vercel --prod

# OU via Dashboard :
# 1. Aller dans "Deployments"
# 2. Cliquer les 3 points du dernier déploiement
# 3. Cliquer "Redeploy"
```

---

## 🌍 Votre URL de Production

Après déploiement, vous avez :

```
Domaine Vercel par défaut :
https://mariage-app-xxxxx.vercel.app/

Domaine personnalisé (optionnel) :
https://votre-domaine.com/
```

---

## ✅ Vérifier le Déploiement

### **1. Tester l'API**

```bash
# Test basique
curl https://votre-url.vercel.app/api/health

# Doit retourner :
# {"status":"ok","timestamp":"..."}
```

### **2. Tester l'application**

1. Ouvrir https://votre-url.vercel.app/
2. Vérifier que :
   - ✅ Page charge correctement
   - ✅ Caméra fonctionne
   - ✅ Buttons réactifs
   - ✅ Galerie charge

### **3. Tester l'upload**

1. Prendre une photo
2. Cliquer "Sauvegarder"
3. Vérifier que ça upload sans erreur
4. Aller dans Firebase Storage → Galerie

### **4. Tester les messages**

1. Menu "Message"
2. Enregistrer un message
3. Cliquer "Sauvegarder"
4. Vérifier dans Firebase

---

## 🔧 Configuration Avancée

### **Domaine Personnalisé**

1. Dashboard Vercel → Project Settings → Domains
2. Ajouter votre domaine (ex: `mariage.votresite.fr`)
3. Suivre les instructions DNS
4. Attendre propagation (15-30 min)

### **SSL/HTTPS**

Vercel fournit automatiquement des certificats SSL gratuits ! ✅

Votre site est sécurisé par défaut sur HTTPS.

### **Aliasing (Production vs Preview)**

```bash
# Produire sur vercel.app
vercel --prod

# Preview (avant production)
vercel
```

---

## 🐛 Troubleshooting

### **Erreur : "Cannot find module 'firebase-admin'"**

```bash
# Solution : Réinstaller dépendances
npm install firebase-admin
git push origin main
# Redéployer
vercel --prod
```

### **Erreur : "Firebase credentials not found"**

```bash
# Vérifier que les variables d'env sont bien configurées
vercel env ls

# Vérifier le .env.local en production
vercel env pull
```

### **Erreur : "Uploads folder not found"**

```bash
# Créer le dossier
mkdir -p uploads/{photo,video,audio}
# Ajouter .gitkeep
touch uploads/.gitkeep
git add uploads
git push
```

### **Galerie/Messages vides après déploiement**

✅ **Normal !** Firebase Realtime Database ne stocke que les métadonnées.

Les fichiers sont dans Firebase Storage.

Vérifier :
1. Firebase Console → Storage → Photos
2. Les fichiers doivent être là

### **Lenteur au premier chargement**

Normal avec Vercel (cold start Node.js).

Solutions :
- Attendre quelques secondes
- Upgrade vers Plan Premium (optionnel)

---

## 📊 Commandes CLI Utiles

```bash
# Afficher le statut du projet
vercel status

# Voir les environnements
vercel env ls

# Lister les déploiements
vercel ls

# Voir les logs
vercel logs https://votre-url.vercel.app/

# Supprimer un déploiement
vercel rm <deployment-id>

# Voir la configuration locale
vercel env pull
```

---

## 🎯 Étapes Rapides (Résumé)

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Se connecter
vercel login

# 3. Déployer (première fois)
vercel

# 4. Ajouter les variables d'env via Dashboard

# 5. Redéployer
vercel --prod

# 6. Tester
# Ouvrir https://votre-url.vercel.app/
```

---

## 💡 Conseils

✅ **Faire régulièrement** :
- `git push` → nouveau code
- `vercel --prod` → redéployer automatiquement

✅ **Ne PAS oublier** :
- Variables d'env Firebase
- Fichiers publics dans `public/`
- `.vercelignore` mis à jour

✅ **Backup** :
- Garder une copie de `vercel.json`
- Exporter la config Firebase

---

## 🆘 Support

Si erreur :
1. Vérifier les logs : `vercel logs https://votre-url.vercel.app/`
2. Checker variables d'env
3. Vérifier que Firebase est accessible
4. Essayer `vercel --prod --debug`

---

## ✨ Bravo ! 🎉

Votre site de mariage est maintenant en ligne sur Vercel !

🌍 URL : https://votre-url.vercel.app/
💍 Partagez avec vos invités !
📸 Collectez les photos et messages !

---

## 📝 Notes

- Vercel offre **100 GB de bande passante gratuitement/mois**
- Vous avez **12 déploiements gratuits/jour**
- Pas de limite sur le nombre de projets gratuits
- SSL/HTTPS automatique et gratuit
- Domaine `*.vercel.app` gratuit toujours

**Bon déploiement ! 🚀**
