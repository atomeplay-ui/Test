# ⚡ Vercel Quick Start - 5 Minutes

## 🚀 Déployer en 5 étapes

### **1. Installer Vercel CLI**
```bash
npm install -g vercel
```

### **2. Se connecter**
```bash
vercel login
# Suivre les instructions (GitHub login)
```

### **3. Déployer**
```bash
cd "OneDrive - SPIE/Documents/Test"
vercel
# Répondre Y aux questions, puis...
# ? What's your project's name? → mariage-app
```

### **4. Ajouter les Variables Firebase**

**Via le Dashboard Vercel** :
1. Aller sur https://vercel.com
2. Sélectionner projet `mariage-app`
3. Settings → Environment Variables
4. Ajouter ces 7 variables (copier de votre `.env`) :

```
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
FIREBASE_CLIENT_ID
FIREBASE_CERT_URL
FIREBASE_BUCKET
```

### **5. Redéployer**
```bash
vercel --prod
```

---

## ✅ C'est bon !

Votre site est live à :
```
https://mariage-app-xxxxx.vercel.app/
```

---

## 🔄 Après modifications

```bash
# Modifier le code
# ...

# Push sur GitHub
git add .
git commit -m "Mes modifications"
git push origin main

# Redéployer
vercel --prod
```

---

## 📊 Commandes Útiles

```bash
# Voir l'URL de prod
vercel ls

# Voir les logs
vercel logs https://votre-url.vercel.app

# Voir les variables d'env
vercel env ls

# Voir le statut
vercel status
```

---

## 🆘 Si ça ne marche pas

1. **Vérifier les logs** :
   ```bash
   vercel logs https://votre-url.vercel.app
   ```

2. **Vérifier les variables** :
   ```bash
   vercel env ls
   ```

3. **Redéployer** :
   ```bash
   vercel --prod --debug
   ```

---

## 💡 Notes

- ✅ HTTPS/SSL automatique
- ✅ Domaine gratuit `*.vercel.app`
- ✅ 100GB bande passante gratuite/mois
- ✅ 12 déploiements gratuits/jour
- ✅ Pas de base de données à gérer (Firebase)

**Bon déploiement ! 🎉**
