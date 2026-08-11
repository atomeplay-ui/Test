// Backend Serveur pour Application Mariage
// Stockage Cloud : Firebase Storage
// Base de données : Firebase Realtime Database

const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const PASSWORD = '2024'; // Mot de passe pour uploads

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static('public'));

// Configuration Firebase
let bucket = null;
let db = null;
let firebaseInitialized = false;

// Vérifier que les variables d'environnement sont présentes
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CERT_URL',
  'FIREBASE_BUCKET'
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length === 0) {
  try {
    // Vérifier que Firebase n'est pas déjà initialisé
    if (!firebaseInitialized) {
      // Construire l'objet Firebase avec les variables d'environnement
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CERT_URL
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_BUCKET,
        databaseURL: process.env.FIREBASE_DATABASE_URL || undefined
      });
      
      firebaseInitialized = true;
      bucket = admin.storage().bucket();
      
      // Initialiser la DB seulement si l'URL est disponible
      try {
        db = admin.database();
      } catch (e) {
        console.log('⚠️ Realtime Database non configurée (optionnel)');
        db = null;
      }
      
      console.log('✅ Firebase Storage connecté avec succès');
      console.log(`💾 Storage: ${bucket ? 'Connecté' : 'Non connecté'}`);
      console.log(`📊 Database: ${db ? 'Connectée' : 'Non configurée (optionnel)'}`);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion Firebase:', error.message);
    console.log('Vérifiez votre fichier .env et vos clés Firebase');
  }
} else {
  console.log('⚠️ Variables Firebase manquantes:', missingVars);
  console.log('Créez un fichier .env avec:');
  missingVars.forEach(v => console.log(`  - ${v}`));
}

// Upload en mémoire pour Vercel (pas de système de fichiers)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

// ===== ROUTES API =====

// 1. UPLOAD FICHIER (Photo/Vidéo/Audio)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('\n📤 Upload reçu');
    console.log('Headers:', req.headers);
    console.log('File:', req.file ? { name: req.file.filename, size: req.file.size } : 'AUCUN');
    console.log('Body:', req.body);
    
    if (!req.file) {
      console.error('❌ Pas de fichier reçu!');
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }
    
    const password = req.query.password || req.body.password;
    
    console.log(`🔒 Password reçu: ${password}, attendu: ${PASSWORD}`);
    
    // Vérifier mot de passe
    if (password !== PASSWORD) {
      console.error('❌ Mot de passe incorrect');
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const fileId = Date.now().toString();
    const fileType = req.body.fileType || 'photo'; // 'photo', 'video', 'audio'
    console.log(`📁 Type: ${fileType}, FileID: ${fileId}`);
    
    // Construire les métadonnées sans les champs undefined (Firebase n'aime pas les undefined)
    const metadata = {
      fileId,
      filename: req.file.originalname || 'file',
      type: fileType,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      mimeType: req.file.mimetype
    };
    
    // Ajouter author et message SEULEMENT s'ils existent et ne sont pas vides
    console.log(`📝 Author reçu: "${req.body.author}"`);
    console.log(`📝 Message reçu: "${req.body.message}"`);
    
    if (req.body.author && req.body.author.trim()) {
      metadata.author = req.body.author.trim();
      console.log(`✅ Author ajouté: ${metadata.author}`);
    } else {
      console.log(`⚠️ Pas d'author fourni`);
    }
    
    if (req.body.message && req.body.message.trim()) {
      metadata.message = req.body.message.trim();
      console.log(`✅ Message ajouté: ${metadata.message}`);
    } else {
      console.log(`⚠️ Pas de message fourni`);
    }

    // Si Firebase est disponible
    if (bucket) {
      try {
        const destination = `uploads/${fileType}/${fileId}`;
        console.log(`☁️ Destination Firebase: ${destination}`);
        
        const file = bucket.file(destination);
        
        // Upload le fichier (multer.memoryStorage() utilise req.file.buffer)
        console.log(`📤 Upload du fichier vers Firebase...`);
        const fileBuffer = req.file.buffer;
        await file.save(fileBuffer, {
          metadata: {
            contentType: req.file.mimetype,
            metadata: metadata
          }
        });
        console.log(`✅ Fichier uploadé`);

        // Sauvegarder métadonnées LOCALEMENT sur le disque (fiable et rapide)
        console.log(`📊 Sauvegarde métadonnées locales...`);
        
        // Créer les dossiers s'ils n'existent pas (SEULEMENT EN LOCAL, PAS VERCEL)
        if (!isVercel) {
          try {
            const metadataDir = 'metadata';
            if (!fs.existsSync(metadataDir)) fs.mkdirSync(metadataDir);
            
            const metadataTypeDir = path.join(metadataDir, fileType);
            if (!fs.existsSync(metadataTypeDir)) fs.mkdirSync(metadataTypeDir);
            
            // Sauvegarder le fichier JSON avec les métadonnées
            const metadataPath = path.join(metadataTypeDir, `${fileId}.json`);
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            console.log(`✅ Métadonnées sauvegardées localement: ${metadataPath}`);
          } catch (metaErr) {
            console.warn(`⚠️ Erreur sauvegarde métadonnées locales (normal sur Vercel):`, metaErr.message);
          }
        } else {
          console.log(`⏭️ Métadonnées stockées dans Firebase (Vercel)`);
        }
        
        // Essayer de sauvegarder AUSSI dans Firebase DB EN ARRIÈRE-PLAN (optionnel)
        if (db) {
          try {
            db.ref(`files/${fileId}`).set(metadata)
              .then(() => console.log(`✅ Métadonnées AUSSI dans Firebase DB`))
              .catch(e => console.warn(`⚠️ Firebase DB non disponible (métadonnées sur disque OK):`, e.message));
          } catch (dbErr) {
            console.warn(`⚠️ Firebase DB non configurée:`, dbErr.message);
          }
        }

        // Générer URL publique
        console.log(`🔗 Génération URL...`);
        const [url] = await file.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 jours max
        });
        console.log(`✅ URL générée`);

        // Supprimer fichier temporaire
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        console.log(`✅ Upload réussi`);
        return res.json({
          success: true,
          fileId,
          url,
          metadata
        });
      } catch (firebaseErr) {
        console.error('❌ Erreur Firebase:', firebaseErr.message);
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw firebaseErr;
      }
    } else {
      // Fallback : stockage local
      console.log(`💾 Stockage local (Firebase non disponible)`);
      
      const destPath = path.join('uploads', fileId);
      fs.renameSync(req.file.path, destPath);

      // Sauvegarder métadonnées
      if (!fs.existsSync('metadata')) fs.mkdirSync('metadata');
      fs.writeFileSync(
        path.join('metadata', `${fileId}.json`),
        JSON.stringify(metadata)
      );

      return res.json({
        success: true,
        fileId,
        url: `/files/${fileId}`,
        metadata,
        storage: 'local'
      });
    }
  } catch (error) {
    console.error('❌ Erreur upload complète:', error);
    console.error('Stack:', error.stack);
    
    // Nettoyer le fichier temporaire
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Erreur suppression fichier temp:', e.message);
      }
    }
    
    res.status(500).json({ 
      error: error.message,
      details: error.toString()
    });
  }
});

// 2. RÉCUPÉRER UN FICHIER
app.get('/api/files/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;

    if (bucket) {
      // Firebase : chercher dans tous les dossiers
      const [files] = await bucket.getFiles({
        prefix: 'uploads/'
      });

      const file = files.find(f => f.name.includes(fileId));
      if (!file) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 jours max
      });

      let metadata = null;
      if (db) {
        const metadataRef = await db.ref(`files/${fileId}`).once('value');
        metadata = metadataRef.val();
      }
      
      return res.json({
        success: true,
        fileId,
        url,
        metadata: metadata || { fileId, uploadedAt: new Date().toISOString() }
      });
    } else {
      // Fallback local
      const filePath = path.join('uploads', fileId);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      const metadata = JSON.parse(
        fs.readFileSync(path.join('metadata', `${fileId}.json`), 'utf8')
      );

      return res.json({
        success: true,
        fileId,
        url: `/files/${fileId}`,
        metadata,
        storage: 'local'
      });
    }
  } catch (error) {
    console.error('Erreur récupération:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. LISTER TOUS LES FICHIERS (AVEC MÉTADONNÉES DE LA DB)
app.get('/api/files', async (req, res) => {
  try {
    const fileType = req.query.type;

    if (bucket) {
      const prefix = fileType ? `uploads/${fileType}/` : 'uploads/';
      
      console.log(`📂 Listing ${prefix}...`);
      
      // Récupérer les fichiers depuis le storage
      const [files] = await bucket.getFiles({ prefix, maxResults: 100 });
      
      console.log(`✅ Trouvé ${files.length} fichiers`);

      // Récupérer les métadonnées depuis les fichiers JSON locaux
      console.log('📊 Récupération des métadonnées locales...');
      
      const metadataDir = path.join('metadata', fileType || '');
      let allMetadata = {};
      
      // Charger les métadonnées depuis les fichiers JSON
      if (fs.existsSync(metadataDir)) {
        try {
          const metadataFiles = fs.readdirSync(metadataDir);
          console.log(`📂 Trouvé ${metadataFiles.length} fichiers de métadonnées`);
          
          metadataFiles.forEach(filename => {
            try {
              const fileId = filename.replace('.json', '');
              const metadataPath = path.join(metadataDir, filename);
              const metadataContent = fs.readFileSync(metadataPath, 'utf8');
              allMetadata[fileId] = JSON.parse(metadataContent);
            } catch (e) {
              console.warn(`⚠️ Erreur lecture métadonnées: ${filename}`, e.message);
            }
          });
          
          console.log(`✅ Métadonnées chargées: ${Object.keys(allMetadata).length} items`);
        } catch (err) {
          console.warn(`⚠️ Erreur récupération dossier métadonnées:`, err.message);
        }
      }

      // Traiter les fichiers rapidement avec les métadonnées chargées
      const filesList = [];
      for (const file of files) {
        try {
          const fileId = file.name.split('/').pop();
          
          const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + (7 * 24 * 60 * 60 * 1000)
          });

          // Utiliser les métadonnées locales
          let metadata = allMetadata[fileId] || { 
            fileId, 
            uploadedAt: new Date().toISOString(),
            type: fileType || 'unknown'
          };

          filesList.push({
            fileId,
            url,
            metadata
          });
        } catch (e) {
          console.error('⚠️ Erreur fichier:', fileId, e.message);
        }
      }

      return res.json({
        success: true,
        count: filesList.length,
        files: filesList.reverse()
      });
    } else {
      // Fallback local
      const uploadsDir = 'uploads';
      if (!fs.existsSync(uploadsDir)) {
        return res.json({ success: true, count: 0, files: [], storage: 'local' });
      }

      const files = fs.readdirSync(uploadsDir);
      const filesList = files.map(filename => {
        const metadata = JSON.parse(
          fs.readFileSync(path.join('metadata', `${filename}.json`), 'utf8')
        );
        return {
          fileId: filename,
          url: `/files/${filename}`,
          metadata
        };
      }).reverse();

      return res.json({
        success: true,
        count: filesList.length,
        files: filesList,
        storage: 'local'
      });
    }
  } catch (error) {
    console.error('Erreur listing:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. SUPPRIMER UN FICHIER
app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const password = req.query.password || req.body.password;
    
    if (password !== PASSWORD) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const fileId = req.params.fileId;

    if (bucket) {
      const [files] = await bucket.getFiles({
        prefix: 'uploads/'
      });

      const file = files.find(f => f.name.includes(fileId));
      if (!file) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      await file.delete();
      if (db) {
        await db.ref(`files/${fileId}`).remove();
      }

      return res.json({ success: true, message: 'Fichier supprimé' });
    } else {
      // Fallback local
      const filePath = path.join('uploads', fileId);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      fs.unlinkSync(filePath);
      fs.unlinkSync(path.join('metadata', `${fileId}.json`));

      return res.json({ success: true, message: 'Fichier supprimé', storage: 'local' });
    }
  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. TÉLÉCHARGER UN FICHIER (pour fallback local)
app.get('/files/:fileId', (req, res) => {
  const filePath = path.join('uploads', req.params.fileId);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'Fichier non trouvé' });
  }
});

// 5B. PROXY POUR LES FICHIERS AUDIO (éviter CORS sur mobile)
app.get('/audio/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;

    if (bucket) {
      // Chercher le fichier dans Firebase
      const [files] = await bucket.getFiles({
        prefix: 'uploads/audio/'
      });

      const file = files.find(f => f.name.includes(fileId));
      if (!file) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      // Télécharger et servir le fichier
      const fileContent = await file.download();
      
      res.setHeader('Content-Type', 'audio/webm');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(fileContent[0]);
    } else {
      res.status(404).json({ error: 'Storage non disponible' });
    }
  } catch (error) {
    console.error('Erreur proxy audio:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    firebase: bucket ? 'connected' : 'not configured',
    storage: bucket ? 'cloud' : 'local'
  });
});

// Créer dossiers nécessaires (seulement en local, pas sur Vercel)
const isVercel = process.env.VERCEL === '1';
if (!isVercel) {
  try {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    if (!fs.existsSync('metadata')) fs.mkdirSync('metadata');
    if (!fs.existsSync('public')) fs.mkdirSync('public');
  } catch (e) {
    console.log('⚠️ Erreur création dossiers (normal sur Vercel):', e.message);
  }
}

// Démarrer serveur
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Backend Mariage - Démarré ✓        ║
╚═══════════════════════════════════════╝

📍 Serveur: http://localhost:${PORT}
🔒 Mot de passe: ${PASSWORD}
💾 Stockage: ${bucket ? 'Firebase Cloud ☁️' : 'Local 📁'}

API Endpoints:
  POST   /api/upload        - Upload fichier
  GET    /api/files         - Lister fichiers
  GET    /api/files/:id     - Récupérer fichier
  DELETE /api/files/:id     - Supprimer fichier
  GET    /api/health        - Vérifier statut

Configuration Firebase:
  Créer un fichier .env avec:
  FIREBASE_PROJECT_ID=...
  FIREBASE_PRIVATE_KEY=...
  FIREBASE_CLIENT_EMAIL=...
  FIREBASE_BUCKET=...
  `);
});

module.exports = app;
