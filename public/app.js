// ===== État de l'application =====
const appState = {
    stream: null,
    canvas: null,
    video: null,
    currentImageData: null,
    facingMode: 'user',
    devices: [],
    currentDeviceIndex: 0
};

// ===== Éléments du DOM =====
const elements = {
    video: document.getElementById('video'),
    canvas: document.getElementById('canvas'),
    captureBtn: document.getElementById('captureBtn'),
    uploadBtn: document.getElementById('uploadBtn'),
    retakeBtn: document.getElementById('retakeBtn'),
    toggleCameraBtn: document.getElementById('toggleCameraBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    previewContainer: document.getElementById('preview-container'),
    previewImage: document.getElementById('preview-image'),
    gallery: document.getElementById('gallery'),
    uploadStatus: document.getElementById('upload-status'),
    photoCount: document.getElementById('photo-count'),
    noCamera: document.getElementById('no-camera')
};

// ===== Initialisation =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📸 Application de mariage démarrée');
    initializeCamera();
    loadPhotos();
    setupEventListeners();
});

// ===== Gestion de la caméra =====
async function initializeCamera() {
    try {
        // Demander l'accès à la caméra
        const constraints = {
            video: {
                facingMode: appState.facingMode,
                width: { ideal: 1280 },
                height: { ideal: 960 }
            },
            audio: false
        };

        appState.stream = await navigator.mediaDevices.getUserMedia(constraints);
        elements.video.srcObject = appState.stream;
        
        console.log('✅ Caméra initialisée avec succès');
        
        // Récupérer la liste des appareils
        await getVideoDevices();
    } catch (error) {
        console.error('❌ Erreur d\'accès à la caméra:', error);
        handleCameraError(error);
    }
}

async function getVideoDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        appState.devices = devices.filter(device => device.kind === 'videoinput');
        
        // Masquer le bouton de changement de caméra s'il n'y a qu'une caméra
        if (appState.devices.length <= 1) {
            elements.toggleCameraBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des appareils:', error);
    }
}

async function toggleCamera() {
    try {
        // Arrêter le stream actuel
        if (appState.stream) {
            appState.stream.getTracks().forEach(track => track.stop());
        }

        // Changer l'appareil ou le mode de facing
        if (appState.devices.length > 1) {
            appState.currentDeviceIndex = (appState.currentDeviceIndex + 1) % appState.devices.length;
            const constraints = {
                video: {
                    deviceId: { exact: appState.devices[appState.currentDeviceIndex].deviceId },
                    width: { ideal: 1280 },
                    height: { ideal: 960 }
                },
                audio: false
            };
            appState.stream = await navigator.mediaDevices.getUserMedia(constraints);
        } else {
            // Basculer entre les modes facing
            appState.facingMode = appState.facingMode === 'user' ? 'environment' : 'user';
            const constraints = {
                video: {
                    facingMode: appState.facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 960 }
                },
                audio: false
            };
            appState.stream = await navigator.mediaDevices.getUserMedia(constraints);
        }

        elements.video.srcObject = appState.stream;
        showStatus('📹 Caméra changée avec succès', 'info');
    } catch (error) {
        console.error('Erreur lors du changement de caméra:', error);
        showStatus('Erreur lors du changement de caméra', 'error');
    }
}

function handleCameraError(error) {
    let message = '';
    
    if (error.name === 'NotAllowedError') {
        message = '🔒 Permission refusée. Veuillez autoriser l\'accès à la caméra.';
    } else if (error.name === 'NotFoundError') {
        message = '📵 Aucune caméra détectée sur cet appareil.';
    } else if (error.name === 'NotReadableError') {
        message = '⚠️ La caméra est en utilisation par une autre application.';
    } else {
        message = '❌ Impossible d\'accéder à la caméra.';
    }
    
    console.error(message);
    elements.noCamera.style.display = 'flex';
    elements.video.style.display = 'none';
    elements.captureBtn.disabled = true;
    showStatus(message, 'error');
}

// ===== Capture de photo =====
function capturePhoto() {
    try {
        const context = elements.canvas.getContext('2d');
        
        // Définir la taille du canvas
        elements.canvas.width = elements.video.videoWidth;
        elements.canvas.height = elements.video.videoHeight;
        
        // Dessiner l'image de la vidéo sur le canvas
        context.drawImage(elements.video, 0, 0);
        
        // Obtenir les données de l'image
        const imageData = elements.canvas.toDataURL('image/jpeg', 0.95);
        appState.currentImageData = imageData;
        
        // Afficher l'aperçu
        elements.previewImage.src = imageData;
        elements.previewContainer.style.display = 'block';
        
        console.log('📸 Photo capturée');
        showStatus('Photo capturée avec succès!', 'success');
    } catch (error) {
        console.error('Erreur lors de la capture:', error);
        showStatus('Erreur lors de la capture', 'error');
    }
}

async function uploadPhoto() {
    if (!appState.currentImageData) {
        showStatus('Aucune photo à charger', 'error');
        return;
    }

    try {
        elements.uploadBtn.disabled = true;
        showStatus('⏳ Sauvegarde en cours...', 'info');
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: appState.currentImageData
            })
        });

        if (!response.ok) {
            throw new Error('Erreur du serveur');
        }

        const data = await response.json();
        
        if (data.success) {
            showStatus('✅ Photo sauvegardée avec succès!', 'success');
            
            // Réinitialiser
            appState.currentImageData = null;
            elements.previewContainer.style.display = 'none';
            
            // Rafraîchir la galerie
            setTimeout(() => {
                loadPhotos();
            }, 500);
        } else {
            showStatus('Erreur lors de la sauvegarde', 'error');
        }
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        showStatus('Erreur lors de la sauvegarde', 'error');
    } finally {
        elements.uploadBtn.disabled = false;
    }
}

function retakePhoto() {
    appState.currentImageData = null;
    elements.previewContainer.style.display = 'none';
    showStatus('', '');
}

// ===== Galerie de photos =====
async function loadPhotos() {
    try {
        elements.gallery.innerHTML = '<p class="loading">⏳ Chargement des photos...</p>';
        
        const response = await fetch('/api/photos');
        const data = await response.json();
        
        if (data.success && data.photos.length > 0) {
            displayPhotos(data.photos);
            elements.photoCount.textContent = `${data.photos.length} photo${data.photos.length > 1 ? 's' : ''}`;
        } else {
            elements.gallery.innerHTML = `
                <div class="gallery-empty">
                    <p>💭 Aucune photo pour le moment</p>
                    <p>Capturerez-vous la première?</p>
                </div>
            `;
            elements.photoCount.textContent = '0 photo';
        }
    } catch (error) {
        console.error('Erreur lors du chargement des photos:', error);
        elements.gallery.innerHTML = '<p class="loading">❌ Erreur lors du chargement</p>';
    }
}

function displayPhotos(photos) {
    elements.gallery.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.animationDelay = `${index * 0.05}s`;
        
        item.innerHTML = `
            <img src="${photo.url}" alt="Photo de mariage" loading="lazy">
            <div class="gallery-item-overlay">
                <button class="overlay-btn overlay-btn-download" onclick="downloadPhoto('${photo.url}', '${photo.filename}')">
                    ⬇️ Télécharger
                </button>
                <button class="overlay-btn overlay-btn-delete" onclick="deletePhoto('${photo.filename}')">
                    🗑️ Supprimer
                </button>
            </div>
        `;
        
        // Ajouter un événement pour afficher la photo en grand
        item.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                openLightbox(photo.url);
            }
        });
        
        elements.gallery.appendChild(item);
    });
}

function openLightbox(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <img src="${imageSrc}" alt="Photo en grand">
            <span class="modal-close">&times;</span>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function deletePhoto(filename) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo?')) {
        return;
    }

    try {
        const response = await fetch(`/api/photos/${filename}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showStatus('✅ Photo supprimée avec succès', 'success');
            loadPhotos();
        } else {
            showStatus('Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showStatus('Erreur lors de la suppression', 'error');
    }
}

function downloadPhoto(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus('📥 Téléchargement en cours...', 'info');
}

// ===== Gestion des messages de statut =====
function showStatus(message, type) {
    if (!message) {
        elements.uploadStatus.className = 'status-message';
        elements.uploadStatus.innerHTML = '';
        return;
    }

    elements.uploadStatus.className = `status-message ${type}`;
    elements.uploadStatus.innerHTML = message;
    
    // Masquer le message après 5 secondes (sauf pour 'info')
    if (type !== 'info') {
        setTimeout(() => {
            elements.uploadStatus.className = 'status-message';
            elements.uploadStatus.innerHTML = '';
        }, 5000);
    }
}

// ===== Configuration des événements =====
function setupEventListeners() {
    elements.captureBtn.addEventListener('click', capturePhoto);
    elements.uploadBtn.addEventListener('click', uploadPhoto);
    elements.retakeBtn.addEventListener('click', retakePhoto);
    elements.toggleCameraBtn.addEventListener('click', toggleCamera);
    elements.refreshBtn.addEventListener('click', loadPhotos);
}

// ===== Gestion du clavier =====
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        if (elements.previewContainer.style.display === 'none') {
            capturePhoto();
        }
    }
    if (e.key === 'Escape') {
        retakePhoto();
    }
});

// ===== Support du drag & drop (optionnel) =====
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                appState.currentImageData = event.target.result;
                elements.previewImage.src = event.target.result;
                elements.previewContainer.style.display = 'block';
                showStatus('Image chargée. Prête à être sauvegardée!', 'info');
            };
            reader.readAsDataURL(file);
        }
    }
});

// ===== Nettoyage à la fermeture =====
window.addEventListener('beforeunload', () => {
    if (appState.stream) {
        appState.stream.getTracks().forEach(track => track.stop());
    }
});

console.log('🎉 Tous les événements sont configurés');
