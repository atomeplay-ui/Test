# 🔧 Configurer les Variables d'Environnement Vercel

L'erreur que vous avez reçue :
```
Environment Variable "FIREBASE_PROJECT_ID" references Secret "firebase_project_id", 
which does not exist.
```

Cela signifie que **les variables Firebase ne sont pas ajoutées dans Vercel**.

---

## 🔐 SOLUTION : Ajouter les variables manuellement

### **Étape 1 : Aller sur Vercel Dashboard**
1. Ouvrir https://vercel.com/dashboard
2. Cliquer sur le projet **mariage-app**
3. Aller dans **Settings** (en haut)
4. Cliquer sur **Environment Variables** (à gauche)

### **Étape 2 : Copier vos variables depuis .env**

Ouvrir votre fichier `.env` local et copier ces 7 variables :

```
FIREBASE_PROJECT_ID=mariage-valention-ines
FIREBASE_PRIVATE_KEY_ID=eb5c84e177094dc95c150d0c4698ea8f63a07649
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@mariage-valention-ines.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=110640118807837769501
FIREBASE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mariage-valention-ines.iam.gserviceaccount.com
FIREBASE_BUCKET=mariage-valention-ines.appspot.com
```

### **Étape 3 : Ajouter dans Vercel**

Pour **CHAQUE variable** :

1. Cliquer le bouton **"+ Add New"**
2. Mettre le **Name** : `FIREBASE_PROJECT_ID`
3. Mettre la **Value** : `mariage-valention-ines`
4. Laisser **Environments** sur **Production**
5. Cliquer **"Save"**

**Répéter pour les 7 variables** :
- [ ] FIREBASE_PROJECT_ID
- [ ] FIREBASE_PRIVATE_KEY_ID
- [ ] FIREBASE_PRIVATE_KEY
- [ ] FIREBASE_CLIENT_EMAIL
- [ ] FIREBASE_CLIENT_ID
- [ ] FIREBASE_CERT_URL
- [ ] FIREBASE_BUCKET

---

## ⚠️ ATTENTION : FIREBASE_PRIVATE_KEY

C'est la plus **importante** et la plus **délicate** !

### **Format Correct ✅**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHLGq8oyDo7HGZ
...
-----END PRIVATE KEY-----
```

### **Avec les retours à la ligne ✅**
```
-----BEGIN PRIVATE KEY-----\n
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHLGq8oyDo7HGZ\n
...\n
-----END PRIVATE KEY-----\n
```

### **COMMENT L'AJOUTER DANS VERCEL**

**Option 1 : Copier du .env** (RECOMMANDÉ)
1. Ouvrir `.env` avec un éditeur
2. Copier TOUTE la ligne de `FIREBASE_PRIVATE_KEY`
3. Coller dans Vercel **exactement comme c'est**
4. Vercel gérera les `\n` automatiquement

**Option 2 : Multiline** (si Vercel le permet)
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHLGq8oyDo7HGZ
...
-----END PRIVATE KEY-----
```

---

## 📋 CHECKLIST COMPLÈTE

### **Avant d'ajouter les variables**
- [ ] Ouvrir `.env` local
- [ ] Copier toutes les valeurs
- [ ] Vérifier pas d'espacements superflus

### **Sur Vercel Dashboard**
- [ ] Aller dans Settings → Environment Variables
- [ ] Ajouter FIREBASE_PROJECT_ID
- [ ] Ajouter FIREBASE_PRIVATE_KEY_ID
- [ ] Ajouter FIREBASE_PRIVATE_KEY (⚠️ copie exacte)
- [ ] Ajouter FIREBASE_CLIENT_EMAIL
- [ ] Ajouter FIREBASE_CLIENT_ID
- [ ] Ajouter FIREBASE_CERT_URL
- [ ] Ajouter FIREBASE_BUCKET

### **Après ajout des variables**
- [ ] Toutes les 7 variables visibles dans la liste
- [ ] Cliquer "Save" pour chaque
- [ ] Page dit "Environment variables have been updated"

---

## 🚀 REDÉPLOYER APRÈS AJOUT

Une fois toutes les variables ajoutées :

1. Aller dans **Deployments** (sur le projet)
2. Cliquer **"Redeploy"** à côté du dernier déploiement
3. Cliquer **"Redeploy"** dans la popup
4. Attendre 30-60 secondes
5. Voir **"Ready"** en vert ✅

---

## 🔍 VÉRIFIER APRÈS REDÉPLOIEMENT

### **1. Logs Vercel**
```
Aller sur Deployments → Logs
Chercher : "✅ Firebase Storage connecté"
```

### **2. Test API**
```
curl https://mariage-app-xxxxx.vercel.app/api/health
```

Doit retourner :
```json
{
  "status": "ok",
  "firebase": "connected",
  "storage": "cloud"
}
```

### **3. Test Upload**
```
1. Ouvrir https://mariage-app-xxxxx.vercel.app/
2. Cliquer "Capture"
3. Prendre une photo
4. Cliquer "Sauvegarder"
```

---

## 🆘 SI ERREUR PERSISTE

### **Erreur : Variable not found**
```
❌ Environment Variable "X" references Secret "x", which does not exist
```

**Solution** :
1. Vérifier que la variable est bien ajoutée dans Settings
2. Vérifier le nom exact (majuscules/minuscules)
3. Vérifier que vous avez cliqué "Save"
4. Redéployer

### **Erreur : Invalid private key**
```
❌ Failed to import the Cloud Storage client library
```

**Solution** :
1. Vérifier que FIREBASE_PRIVATE_KEY est complet
2. Copier directement du `.env` (pas manuelle)
3. Vérifier qu'il contient `-----BEGIN PRIVATE KEY-----`
4. Redéployer

### **Erreur : Firebase credentials not found**
```
❌ Variables Firebase manquantes
```

**Solution** :
1. Vérifier toutes les 7 variables sont ajoutées
2. Vérifier aucune typo dans les noms
3. Redéployer

---

## 📸 SCREENSHOT GUIDE

### **Localiser Environment Variables**
```
Vercel Dashboard
  → Select Project "mariage-app"
    → Click "Settings" (top menu)
      → Click "Environment Variables" (left sidebar)
        → You see the list of variables
```

### **Ajouter une variable**
```
Click "+ Add New"
  → Name: FIREBASE_PROJECT_ID
  → Value: mariage-valention-ines
  → Environment: Production (checked)
  → Click "Save"
```

---

## 💡 CONSEILS

### **Sécurité**
- ✅ Ne JAMAIS partager votre `.env`
- ✅ Les variables sont chiffrées chez Vercel
- ✅ Seul vous pouvez les voir
- ✅ Les logs ne montrent pas les valeurs

### **Si vous perdez les credentials**
```
1. Aller sur Firebase Console
2. Project Settings → Service Accounts
3. Créer une nouvelle clé
4. Télécharger JSON
5. Copier dans Vercel
```

---

## ✅ RÉSUMÉ RAPIDE

| Étape | Action | Durée |
|-------|--------|-------|
| 1 | Copier variables du `.env` | 1 min |
| 2 | Aller sur Vercel Dashboard | 30 sec |
| 3 | Ajouter 7 variables | 5 min |
| 4 | Redéployer | 1 min |
| 5 | Attendre | 30 sec |
| 6 | Vérifier | 1 min |
| **Total** | | **~9 min** |

---

## 🎯 APRÈS SUCCÈS

Une fois les variables ajoutées et redéploiement OK :

✅ Firebase connecté
✅ Upload fonctionnel
✅ Galerie remplie
✅ Invités peuvent uploader
✅ Production ready

---

## 📞 BESOIN D'AIDE ?

### **Erreur spécifique**
- Lire la section "SI ERREUR PERSISTE"
- Vérifier les logs Vercel
- Contacter Vercel Support

### **Variables incorrectes**
- Vérifier `.env` local
- Comparer avec `.env.example`
- Reconduire sur Vercel

---

**Bon ajout des variables ! 🚀**

*Guide créé : 2026-08-11*
