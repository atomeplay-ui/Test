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

// ===== GESTION DES INVITÉS (Firebase Realtime Database) =====
// Un invité est identifié de façon STABLE par une clé dérivée de son prénom+nom
// (normalisée : minuscules, sans accents/espaces). Cela permet de retrouver ses
// données (défis validés, souvenirs trouvés, photos liées) sur n'importe quel
// appareil simplement en retapant son nom - pas de mot de passe, pas de compte.
// Repli sur un fichier JSON local si la Realtime Database n'est pas configurée
// (utile en développement).

function slugifyName(str) {
  return (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire les accents
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function computeGuestKey(firstName, lastName) {
  const key = `${slugifyName(firstName)}_${slugifyName(lastName)}`.replace(/^_+|_+$/g, '');
  return key || null;
}

const GUESTS_FILE = path.join('data', 'guests.json');

function readLocalGuests() {
  try {
    if (!fs.existsSync(GUESTS_FILE)) return {};
    return JSON.parse(fs.readFileSync(GUESTS_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function writeLocalGuests(all) {
  try {
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    fs.writeFileSync(GUESTS_FILE, JSON.stringify(all, null, 2));
  } catch (e) {
    console.warn('⚠️ Erreur sauvegarde locale des invités:', e.message);
  }
}

// Extrait l'id de défi contenu dans un message au format [DEFI:<id>], ou null.
function extractChallengeId(message) {
  const m = /\[DEFI:([a-zA-Z0-9_-]+)\]/.exec(message || '');
  return m ? m[1] : null;
}

// Marque un défi comme validé pour un invité donné (Firebase ou repli local).
async function markChallengeValidated(guestKey, challengeId, fileId) {
  if (!guestKey || !challengeId) return;
  const entry = { fileId, validatedAt: new Date().toISOString() };
  if (db) {
    await db.ref(`guests/${guestKey}/challenges/${challengeId}`).set(entry);
  } else {
    const all = readLocalGuests();
    if (!all[guestKey]) {
      all[guestKey] = { firstName: '', lastName: '', createdAt: new Date().toISOString(), challenges: {}, souvenirs: {} };
    }
    all[guestKey].challenges = all[guestKey].challenges || {};
    all[guestKey].challenges[challengeId] = entry;
    writeLocalGuests(all);
  }
}

// Lie un média (photo/vidéo/audio) à l'invité qui l'a envoyé (Firebase ou repli local).
async function linkMediaToGuest(guestKey, fileId, fileType) {
  if (!guestKey || !fileId) return;
  const entry = { fileType, linkedAt: new Date().toISOString() };
  if (db) {
    await db.ref(`guests/${guestKey}/media/${fileId}`).set(entry);
  } else {
    const all = readLocalGuests();
    if (!all[guestKey]) {
      all[guestKey] = { firstName: '', lastName: '', createdAt: new Date().toISOString(), challenges: {}, souvenirs: {} };
    }
    all[guestKey].media = all[guestKey].media || {};
    all[guestKey].media[fileId] = entry;
    writeLocalGuests(all);
  }
}

// ===== SYSTÈME DE POINTS / CLASSEMENT =====
// Barème :
//   - 1 point par média envoyé (photo, vidéo ou message audio)
//   - 10 points par défi photo validé
//   - +200 points bonus si TOUS les défis sont validés
//   - 20 points par souvenir trouvé (QR code)
// IMPORTANT : TOTAL_CHALLENGES doit rester égal à CHALLENGES.length côté front
// (public/index.html) pour que le bonus "tous les défis" se déclenche correctement.
const POINTS = {
  media: 1,
  challenge: 10,
  allChallengesBonus: 200,
  souvenir: 20
};
const TOTAL_CHALLENGES = 8;

function computeGuestScore(guest) {
  const mediaCount = guest && guest.media ? Object.keys(guest.media).length : 0;
  const challengesCount = guest && guest.challenges ? Object.keys(guest.challenges).length : 0;
  const souvenirsCount = guest && guest.souvenirs ? Object.keys(guest.souvenirs).length : 0;

  let total = mediaCount * POINTS.media
    + challengesCount * POINTS.challenge
    + souvenirsCount * POINTS.souvenir;

  const allChallengesDone = challengesCount >= TOTAL_CHALLENGES && TOTAL_CHALLENGES > 0;
  if (allChallengesDone) total += POINTS.allChallengesBonus;

  return { mediaCount, challengesCount, souvenirsCount, allChallengesDone, total };
}

// ===== ROUTES API =====

// 0D. CLASSEMENT (leaderboard) des invités selon leurs points
app.get('/api/leaderboard', async (req, res) => {
  try {
    let allGuests = {};

    if (db) {
      const snap = await db.ref('guests').once('value');
      allGuests = snap.val() || {};
    } else {
      allGuests = readLocalGuests();
    }

    const leaderboard = Object.keys(allGuests).map(guestKey => {
      const guest = allGuests[guestKey] || {};
      const score = computeGuestScore(guest);
      return {
        guestKey,
        firstName: guest.firstName || '',
        lastName: guest.lastName || '',
        ...score
      };
    });

    // Tri décroissant par total de points, puis par ordre alphabétique en cas d'égalité
    leaderboard.sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
    });

    // Attribution du rang (les ex-aequo partagent le même rang)
    let lastTotal = null;
    let lastRank = 0;
    leaderboard.forEach((entry, idx) => {
      if (entry.total !== lastTotal) {
        lastRank = idx + 1;
        lastTotal = entry.total;
      }
      entry.rank = lastRank;
    });

    return res.json({
      success: true,
      points: POINTS,
      totalChallenges: TOTAL_CHALLENGES,
      leaderboard
    });
  } catch (error) {
    console.error('Erreur classement:', error);
    res.status(500).json({ error: error.message });
  }
});


// 0A. LOGIN INVITÉ (par prénom + nom, sans mot de passe)
// Crée l'invité s'il n'existe pas encore, sinon retourne ses données existantes
// (défis validés, souvenirs trouvés, médias liés). Le front stocke le `guestKey`
// retourné (ex: dans un cookie/localStorage) pour ne plus avoir à ressaisir son nom.
app.post('/api/guest/login', async (req, res) => {
  try {
    const firstName = (req.body.firstName || '').trim();
    const lastName = (req.body.lastName || '').trim();

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Prénom et nom requis' });
    }

    const guestKey = computeGuestKey(firstName, lastName);
    if (!guestKey) {
      return res.status(400).json({ error: 'Nom invalide' });
    }

    let guest = null;

    if (db) {
      const ref = db.ref(`guests/${guestKey}`);
      const snap = await ref.once('value');
      guest = snap.val();

      if (!guest) {
        guest = {
          firstName,
          lastName,
          createdAt: new Date().toISOString(),
          challenges: {},
          souvenirs: {},
          media: {}
        };
        await ref.set(guest);
      } else {
        // Garder le prénom/nom à jour (au cas où l'orthographe/casse a légèrement changé)
        await ref.update({ firstName, lastName });
        guest.firstName = firstName;
        guest.lastName = lastName;
      }
    } else {
      // Repli local (développement sans Firebase DB)
      const all = readLocalGuests();
      guest = all[guestKey];
      if (!guest) {
        guest = {
          firstName,
          lastName,
          createdAt: new Date().toISOString(),
          challenges: {},
          souvenirs: {},
          media: {}
        };
        all[guestKey] = guest;
      } else {
        guest.firstName = firstName;
        guest.lastName = lastName;
      }
      writeLocalGuests(all);
    }

    return res.json({
      success: true,
      guestKey,
      guest: {
        firstName: guest.firstName || firstName,
        lastName: guest.lastName || lastName,
        challenges: guest.challenges || {},
        souvenirs: guest.souvenirs || {},
        media: guest.media || {}
      }
    });
  } catch (error) {
    console.error('Erreur login invité:', error);
    res.status(500).json({ error: error.message });
  }
});

// 0B. RÉCUPÉRER LES DONNÉES D'UN INVITÉ (défis, souvenirs, médias)
app.get('/api/guest/:guestKey', async (req, res) => {
  try {
    const guestKey = req.params.guestKey;
    let guest = null;

    if (db) {
      const snap = await db.ref(`guests/${guestKey}`).once('value');
      guest = snap.val();
    } else {
      const all = readLocalGuests();
      guest = all[guestKey];
    }

    if (!guest) {
      return res.status(404).json({ error: 'Invité non trouvé' });
    }

    return res.json({
      success: true,
      guestKey,
      guest: {
        firstName: guest.firstName || '',
        lastName: guest.lastName || '',
        challenges: guest.challenges || {},
        souvenirs: guest.souvenirs || {},
        media: guest.media || {}
      }
    });
  } catch (error) {
    console.error('Erreur récupération invité:', error);
    res.status(500).json({ error: error.message });
  }
});

// 0C. MARQUER UN SOUVENIR COMME TROUVÉ (chasse aux souvenirs, scan QR code)
app.post('/api/guest/:guestKey/souvenir/:souvenirId', async (req, res) => {
  try {
    const { guestKey, souvenirId } = req.params;
    const entry = { foundAt: new Date().toISOString() };

    if (db) {
      await db.ref(`guests/${guestKey}/souvenirs/${souvenirId}`).set(entry);
    } else {
      const all = readLocalGuests();
      if (!all[guestKey]) {
        all[guestKey] = { firstName: '', lastName: '', createdAt: new Date().toISOString(), challenges: {}, souvenirs: {}, media: {} };
      }
      all[guestKey].souvenirs = all[guestKey].souvenirs || {};
      all[guestKey].souvenirs[souvenirId] = entry;
      writeLocalGuests(all);
    }

    return res.json({ success: true, souvenirId, entry });
  } catch (error) {
    console.error('Erreur validation souvenir:', error);
    res.status(500).json({ error: error.message });
  }
});

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

    // Clé de l'invité (fournie par le front, calculée à partir de son prénom+nom)
    // -> permet de lier ce média à son profil et de valider un défi si présent.
    const guestKey = (req.body.guestKey || '').trim() || null;
    if (guestKey) metadata.guestKey = guestKey;

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

        // Lier ce média à l'invité + valider un défi si le message en contient un
        if (guestKey) {
          try {
            await linkMediaToGuest(guestKey, fileId, fileType);
            const challengeId = extractChallengeId(metadata.message);
            if (challengeId) {
              await markChallengeValidated(guestKey, challengeId, fileId);
              console.log(`🏆 Défi ${challengeId} validé pour ${guestKey}`);
            }
          } catch (guestErr) {
            console.warn('⚠️ Erreur mise à jour invité (non bloquant):', guestErr.message);
          }
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

      // Lier ce média à l'invité + valider un défi si le message en contient un
      if (guestKey) {
        try {
          await linkMediaToGuest(guestKey, fileId, fileType);
          const challengeId = extractChallengeId(metadata.message);
          if (challengeId) {
            await markChallengeValidated(guestKey, challengeId, fileId);
          }
        } catch (guestErr) {
          console.warn('⚠️ Erreur mise à jour invité (non bloquant):', guestErr.message);
        }
      }

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
        let fileId = null;
        try {
          fileId = file.name.split('/').pop();
          
          const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + (7 * 24 * 60 * 60 * 1000)
          });

          // 1) Priorité aux métadonnées locales (dispo en dev)
          let metadata = allMetadata[fileId];

          // 2) Sur Vercel, les JSON locaux n'existent pas : lire les métadonnées
          //    personnalisées stockées DANS le fichier Firebase Storage lors de l'upload.
          if (!metadata || !metadata.author) {
            try {
              const [fbMeta] = await file.getMetadata();
              const custom = (fbMeta && fbMeta.metadata) ? fbMeta.metadata : {};
              metadata = {
                fileId,
                uploadedAt: custom.uploadedAt || (fbMeta && fbMeta.timeCreated) || new Date().toISOString(),
                type: custom.type || fileType || 'unknown',
                filename: custom.filename,
                size: custom.size,
                mimeType: custom.mimeType || (fbMeta && fbMeta.contentType),
                // Fusionner en préservant l'auteur/message trouvés (local OU Firebase)
                ...(metadata || {}),
                author: (metadata && metadata.author) || custom.author,
                message: (metadata && metadata.message) || custom.message
              };
            } catch (metaErr) {
              console.warn(`⚠️ Impossible de lire les métadonnées Firebase de ${fileId}:`, metaErr.message);
            }
          }

          // 3) Fallback ultime
          if (!metadata) {
            metadata = {
              fileId,
              uploadedAt: new Date().toISOString(),
              type: fileType || 'unknown'
            };
          }

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

      // Récupérer le guestKey (et le type) AVANT de supprimer le fichier,
      // sinon impossible de nettoyer l'entrée liée dans guests/{guestKey}/media
      let ownerGuestKey = null;
      try {
        const [fbMeta] = await file.getMetadata();
        const custom = (fbMeta && fbMeta.metadata) ? fbMeta.metadata : {};
        ownerGuestKey = custom.guestKey || null;
      } catch (e) {
        console.warn('⚠️ Impossible de lire les métadonnées avant suppression:', e.message);
      }

      await file.delete();

      if (db) {
        await db.ref(`files/${fileId}`).remove();
        if (ownerGuestKey) {
          await db.ref(`guests/${ownerGuestKey}/media/${fileId}`).remove();
        }
      } else if (ownerGuestKey) {
        // Fallback local pour les invités (JSON sur disque)
        try {
          const all = readLocalGuests();
          if (all[ownerGuestKey] && all[ownerGuestKey].media) {
            delete all[ownerGuestKey].media[fileId];
            writeLocalGuests(all);
          }
        } catch (e) {
          console.warn('⚠️ Nettoyage guest local non disponible:', e.message);
        }
      }

      return res.json({ success: true, message: 'Fichier supprimé' });
    } else {
      // Fallback local
      const filePath = path.join('uploads', fileId);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      // Récupérer le guestKey depuis les métadonnées locales avant suppression
      let ownerGuestKey = null;
      const metadataPath = path.join('metadata', `${fileId}.json`);
      try {
        if (fs.existsSync(metadataPath)) {
          const localMeta = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          ownerGuestKey = localMeta.guestKey || null;
        }
      } catch (e) { /* ignore */ }

      fs.unlinkSync(filePath);
      if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath);
      }

      if (ownerGuestKey) {
        try {
          const all = readLocalGuests();
          if (all[ownerGuestKey] && all[ownerGuestKey].media) {
            delete all[ownerGuestKey].media[fileId];
            writeLocalGuests(all);
          }
        } catch (e) {
          console.warn('⚠️ Nettoyage guest local non disponible:', e.message);
        }
      }

      return res.json({ success: true, message: 'Fichier supprimé', storage: 'local' });
    }

  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4B. METTRE À JOUR UN FICHIER (associer un défi à un média déjà existant)
// Permet d'ajouter le tag [DEFI:<id>] au message d'une photo/vidéo déjà uploadée,
// sans avoir à ré-envoyer le fichier (utilisé par la page "Défis photos").
app.patch('/api/files/:fileId', async (req, res) => {
  try {
    const password = req.query.password || req.body.password;
    if (password !== PASSWORD) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const fileId = req.params.fileId;
    const newMessage = req.body.message;
    const guestKey = (req.body.guestKey || '').trim() || null;

    if (bucket) {

      const [files] = await bucket.getFiles({ prefix: 'uploads/' });
      const file = files.find(f => f.name.includes(fileId));
      if (!file) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      const [fbMeta] = await file.getMetadata();
      const custom = (fbMeta && fbMeta.metadata) ? { ...fbMeta.metadata } : {};

      if (typeof newMessage === 'string' && newMessage.trim()) {
        const existing = custom.message || '';
        custom.message = existing.includes(newMessage)
          ? existing
          : (existing ? `${existing} ${newMessage}` : newMessage);
      }

      await file.setMetadata({ metadata: custom });

      // Mettre à jour aussi le JSON local si présent (dev uniquement, pas Vercel)
      if (!isVercel) {
        try {
          const fileType = custom.type || 'photo';
          const metadataPath = path.join('metadata', fileType, `${fileId}.json`);
          if (fs.existsSync(metadataPath)) {
            const localMeta = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            localMeta.message = custom.message;
            fs.writeFileSync(metadataPath, JSON.stringify(localMeta, null, 2));
          }
        } catch (e) { /* ignore */ }
      }

      if (db) {
        // Fire-and-forget : ne JAMAIS attendre cet appel, sinon si la connexion
        // Realtime Database est lente/bloquée, la réponse HTTP reste bloquée
        // indéfiniment (le modal "Défis photos" ne se ferme jamais côté client).
        db.ref(`files/${fileId}`).update({ message: custom.message })
          .catch(e => console.warn('⚠️ Firebase DB update non disponible:', e.message));
      }

      // Lier ce média à l'invité + valider le défi correspondant, si fourni
      if (guestKey) {
        const fileTypeForGuest = custom.type || 'photo';
        linkMediaToGuest(guestKey, fileId, fileTypeForGuest)
          .catch(e => console.warn('⚠️ linkMediaToGuest non disponible:', e.message));
        const challengeIdForGuest = extractChallengeId(custom.message);
        if (challengeIdForGuest) {
          markChallengeValidated(guestKey, challengeIdForGuest, fileId)
            .catch(e => console.warn('⚠️ markChallengeValidated non disponible:', e.message));
        }
      }

      return res.json({ success: true, message: custom.message });

    } else {
      // Fallback local
      const metadataPath = path.join('metadata', `${fileId}.json`);
      if (!fs.existsSync(metadataPath)) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }
      const localMeta = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      if (typeof newMessage === 'string' && newMessage.trim()) {
        const existing = localMeta.message || '';
        localMeta.message = existing.includes(newMessage)
          ? existing
          : (existing ? `${existing} ${newMessage}` : newMessage);
      }
      fs.writeFileSync(metadataPath, JSON.stringify(localMeta));

      // Lier ce média à l'invité + valider le défi correspondant, si fourni
      if (guestKey) {
        const fileTypeForGuest = localMeta.type || 'photo';
        linkMediaToGuest(guestKey, fileId, fileTypeForGuest)
          .catch(e => console.warn('⚠️ linkMediaToGuest non disponible:', e.message));
        const challengeIdForGuest = extractChallengeId(localMeta.message);
        if (challengeIdForGuest) {
          markChallengeValidated(guestKey, challengeIdForGuest, fileId)
            .catch(e => console.warn('⚠️ markChallengeValidated non disponible:', e.message));
        }
      }

      return res.json({ success: true, message: localMeta.message, storage: 'local' });
    }
  } catch (error) {
    console.error('Erreur mise à jour fichier:', error);
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

      // Déterminer le bon type MIME selon l'extension du fichier.
      // iOS enregistre en mp4/m4a (Safari ne lit PAS le webm) : il faut donc
      // renvoyer le vrai Content-Type sinon le lecteur affiche "Erreur".
      const name = (file.name || '').toLowerCase();
      let contentType = 'audio/webm';
      if (name.endsWith('.m4a') || name.endsWith('.mp4') || name.endsWith('.aac')) {
        contentType = 'audio/mp4';
      } else if (name.endsWith('.ogg')) {
        contentType = 'audio/ogg';
      } else if (name.endsWith('.mp3')) {
        contentType = 'audio/mpeg';
      } else if (name.endsWith('.wav')) {
        contentType = 'audio/wav';
      }

      // Télécharger le fichier
      const fileContent = await file.download();
      const buffer = fileContent[0];

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Accept-Ranges', 'bytes');

      // Support des requêtes Range (nécessaire pour la lecture audio sur iOS Safari)
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : buffer.length - 1;
        const chunk = buffer.slice(start, end + 1);
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${buffer.length}`);
        res.setHeader('Content-Length', chunk.length);
        return res.end(chunk);
      }

      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
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
