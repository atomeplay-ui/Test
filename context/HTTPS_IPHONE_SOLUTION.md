# 🔐 Solution HTTPS pour iPhone Safari

## 🔴 Problème

Safari sur iPhone **nécessite HTTPS** pour accéder à la caméra et au microphone. HTTP simple ne fonctionne pas.

## ✅ Solution 1 : Utiliser ngrok (Easiest)

### Étape 1 : Installer ngrok
1. Téléchargez ngrok : https://ngrok.com/download
2. Décompressez le fichier
3. Ajoutez ngrok au PATH (ou utilisez le chemin complet)

### Étape 2 : Démarrer le serveur
```powershell
# Terminal 1 : Démarrer le serveur Node.js
cd c:\Users\Tom\Documents\Test
npm start
# Le serveur démarre sur http://localhost:3000
```

### Étape 3 : Exposer en HTTPS avec ngrok
```powershell
# Terminal 2 : Utiliser ngrok
ngrok http 3000
```

Vous verrez un lien HTTPS comme :
```
https://xxxx-xx-xxx-xxx-xx.ngrok.io
```

### Étape 4 : Accéder depuis iPhone
1. Ouvrez Safari sur votre iPhone
2. Tapez l'adresse ngrok (ex: https://xxxx-xx-xxx-xxx-xx.ngrok.io)
3. La caméra et le microphone devraient être accessibles !

---

## ✅ Solution 2 : Utiliser localhost:3000 sur le réseau local

Si ngrok ne fonctionne pas, vous pouvez essayer sur le réseau local (HTTP, mais plus sûr que rien) :

### Étape 1 : Trouver votre adresse IP
```powershell
ipconfig
# Cherchez "Adresse IPv4" (ex: 192.168.1.100)
```

### Étape 2 : Modifier server.js pour écouter sur tous les interfaces
Ouvrez `server.js` et cherchez :
```javascript
app.listen(3000, 'localhost');
```

Remplacez par :
```javascript
app.listen(3000, '0.0.0.0');
```

### Étape 3 : Démarrer le serveur
```powershell
npm start
```

### Étape 4 : Accéder depuis iPhone
```
http://192.168.1.100:3000
# (Remplacez 192.168.1.100 par votre IP réelle)
```

**Note :** Sur HTTP, Safari peut refuser l'accès à la caméra/microphone. Préférez la Solution 1 (ngrok).

---

## ✅ Solution 3 : Fichier local sur iPhone

Si vous voulez tester directement sans serveur :

### Étape 1 : Partager le fichier
```
c:\Users\Tom\Documents\Test\public\index-standalone.html
```

### Étape 2 : Options
- **AirDrop** : Envoyez le fichier directement
- **Email** : Envoyer le fichier HTML par email et ouvrir avec Safari
- **Dropbox/Google Drive** : Uploader et télécharger sur iPhone

**Note :** Les fichiers ouverts en local (file://) ne peuvent PAS accéder à la caméra ou au microphone pour des raisons de sécurité.

---

## 🎯 Recommandation

**Utilisez ngrok (Solution 1)** car c'est :
- ✅ Gratuit
- ✅ Simple à configurer
- ✅ Fonctionne partout
- ✅ HTTPS automatique
- ✅ Parfait pour le développement

---

## 🔧 Installation Complète ngrok

### Étape 1 : Télécharger ngrok
```
https://ngrok.com/download
```

### Étape 2 : Décompresser
Windows : Décompressez le ZIP n'importe où

### Étape 3 : Utiliser ngrok

```powershell
# Terminal 1 : Serveur Node.js
cd c:\Users\Tom\Documents\Test
npm start
```

```powershell
# Terminal 2 : ngrok
cd [chemin_vers_ngrok]
.\ngrok.exe http 3000
```

### Étape 4 : Ouvrir sur iPhone
```
Copiez l'adresse HTTPS de ngrok
https://xxxx-xxxx-xxxx-xxxx-xxx.ngrok.io
```

Ouvrez Safari → Collez l'adresse → Autorisez caméra/microphone !

---

## 📝 Troubleshooting

**Q: ngrok ne fonctionne pas**
A: Assurez-vous que npm start fonctionne d'abord

**Q: Caméra toujours pas accessible**
A: Vérifiez les paramètres Safari sur iPhone :
   - Paramètres > Safari > Caméra
   - Paramètres > Safari > Microphone
   - Assurez-vous qu'ils sont autorisés

**Q: "Impossible de se connecter au serveur"**
A: Vérifiez que le lien ngrok est correct et copiez-le complètement

---

## 🚀 Procédure Rapide

1. Installez ngrok : https://ngrok.com/download
2. Terminal 1 : `npm start` (dans le dossier Test)
3. Terminal 2 : `ngrok http 3000`
4. Copiez l'URL HTTPS
5. Ouvrez Safari sur iPhone → Collez l'URL
6. Autorisez caméra/microphone
7. C'est bon ! 🎉

---

## 💡 Alternative : Serveur HTTPS natif

Si vous voulez configurer HTTPS directement (avancé) :

```powershell
# Créer certificat auto-signé
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Puis utiliser dans server.js :
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(3000);
```

Mais ngrok est plus simple ! 😊

---

**Solution recommandée : ngrok + iPhone = Parfait pour tester ! 🎉**
