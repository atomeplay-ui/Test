#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serveur de Galerie Photos de Mariage
Application Web pour capturer et stocker des photos
"""

import os
import json
import base64
import mimetypes
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime
import uuid

# Configuration
PORT = 3000
UPLOAD_DIR = Path(__file__).parent / 'uploads'
PUBLIC_DIR = Path(__file__).parent / 'public'

# Créer le dossier uploads s'il n'existe pas
UPLOAD_DIR.mkdir(exist_ok=True)

class WeddingPhotoHandler(SimpleHTTPRequestHandler):
    """Gestionnaire des requêtes HTTP pour l'application de photos de mariage"""
    
    def do_GET(self):
        """Gérer les requêtes GET"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Route: /api/photos - Récupérer la liste des photos
        if path == '/api/photos':
            self.handle_get_photos()
        # Route: /uploads/* - Servir les photos
        elif path.startswith('/uploads/'):
            self.serve_photo(path)
        # Route: / - Page d'accueil
        elif path == '/' or path == '':
            self.serve_file('/index.html')
        # Routes statiques
        elif path.startswith('/'):
            self.serve_file(path)
        else:
            self.send_error(404, "Page non trouvée")
    
    def do_POST(self):
        """Gérer les requêtes POST"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        content_length = int(self.headers.get('Content-Length', 0))
        
        if path == '/api/upload':
            self.handle_upload_photo(content_length)
        else:
            self.send_error(404, "Endpoint non trouvé")
    
    def do_DELETE(self):
        """Gérer les requêtes DELETE"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path.startswith('/api/photos/'):
            filename = path.split('/api/photos/')[-1]
            self.handle_delete_photo(filename)
        else:
            self.send_error(404, "Endpoint non trouvé")
    
    def do_OPTIONS(self):
        """Gérer les requêtes OPTIONS (CORS)"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def handle_get_photos(self):
        """Récupérer la liste des photos stockées"""
        try:
            photos = []
            
            # Lister les fichiers du dossier uploads
            if UPLOAD_DIR.exists():
                for file in sorted(UPLOAD_DIR.glob('*.jpg'), key=lambda x: x.stat().st_mtime, reverse=True):
                    photos.append({
                        'filename': file.name,
                        'url': f'/uploads/{file.name}',
                        'uploadedAt': datetime.fromtimestamp(file.stat().st_mtime).isoformat()
                    })
            
            response = {
                'success': True,
                'photos': photos
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_error_json(500, str(e))
    
    def handle_upload_photo(self, content_length):
        """Traiter l'upload d'une photo"""
        try:
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            if 'image' not in data:
                self.send_error_json(400, 'Aucune image fournie')
                return
            
            # Extraire les données base64
            image_data = data['image']
            if image_data.startswith('data:image/jpeg;base64,'):
                image_data = image_data.replace('data:image/jpeg;base64,', '')
            
            # Générer un nom de fichier unique
            timestamp = int(datetime.now().timestamp() * 1000)
            random_suffix = str(uuid.uuid4())[:8]
            filename = f'photo-{timestamp}-{random_suffix}.jpg'
            filepath = UPLOAD_DIR / filename
            
            # Sauvegarder le fichier
            with open(filepath, 'wb') as f:
                f.write(base64.b64decode(image_data))
            
            response = {
                'success': True,
                'message': 'Photo sauvegardée avec succès',
                'filename': filename,
                'url': f'/uploads/{filename}'
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
            print(f'✅ Photo sauvegardée: {filename}')
            
        except Exception as e:
            print(f'❌ Erreur lors du upload: {e}')
            self.send_error_json(500, 'Erreur lors de la sauvegarde')
    
    def handle_delete_photo(self, filename):
        """Supprimer une photo"""
        try:
            # Vérifier la validité du nom de fichier
            if not filename.startswith('photo-') or not filename.endswith('.jpg'):
                self.send_error_json(400, 'Nom de fichier invalide')
                return
            
            filepath = UPLOAD_DIR / filename
            
            if filepath.exists():
                filepath.unlink()
                
                response = {
                    'success': True,
                    'message': 'Photo supprimée avec succès'
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
                print(f'🗑️  Photo supprimée: {filename}')
            else:
                self.send_error_json(404, 'Photo non trouvée')
        
        except Exception as e:
            print(f'❌ Erreur lors de la suppression: {e}')
            self.send_error_json(500, 'Erreur lors de la suppression')
    
    def serve_file(self, file_path):
        """Servir un fichier statique"""
        try:
            full_path = PUBLIC_DIR / file_path.lstrip('/')
            
            # Sécurité: vérifier que le chemin est dans le répertoire public
            if not str(full_path.resolve()).startswith(str(PUBLIC_DIR.resolve())):
                self.send_error(403, "Accès refusé")
                return
            
            # Si c'est un répertoire, servir index.html
            if full_path.is_dir():
                full_path = full_path / 'index.html'
            
            if full_path.exists() and full_path.is_file():
                content_type, _ = mimetypes.guess_type(str(full_path))
                if content_type is None:
                    content_type = 'application/octet-stream'
                
                with open(full_path, 'rb') as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', len(content))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "Fichier non trouvé")
        
        except Exception as e:
            print(f'❌ Erreur lors de la lecture du fichier: {e}')
            self.send_error(500, "Erreur serveur")
    
    def serve_photo(self, file_path):
        """Servir une photo depuis le dossier uploads"""
        try:
            filename = file_path.split('/uploads/')[-1]
            full_path = UPLOAD_DIR / filename
            
            # Vérifier la sécurité
            if not str(full_path.resolve()).startswith(str(UPLOAD_DIR.resolve())):
                self.send_error(403, "Accès refusé")
                return
            
            if full_path.exists() and full_path.is_file():
                with open(full_path, 'rb') as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header('Content-Type', 'image/jpeg')
                self.send_header('Content-Length', len(content))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Cache-Control', 'public, max-age=3600')
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "Photo non trouvée")
        
        except Exception as e:
            print(f'❌ Erreur lors de la lecture de la photo: {e}')
            self.send_error(500, "Erreur serveur")
    
    def send_error_json(self, code, message):
        """Envoyer une réponse d'erreur en JSON"""
        response = {
            'success': False,
            'error': message
        }
        
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Personnaliser les messages de log"""
        print(f'[{self.log_date_time_string()}] {format % args}')


def run_server():
    """Lancer le serveur"""
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, WeddingPhotoHandler)
    
    print('=' * 60)
    print('💒 GALERIE DE PHOTOS DE MARIAGE')
    print('=' * 60)
    print(f'🎉 Serveur en cours d\'exécution sur http://localhost:{PORT}')
    print(f'📁 Dossier de stockage: {UPLOAD_DIR}')
    print(f'🌐 Fichiers publics: {PUBLIC_DIR}')
    print('=' * 60)
    print('Appuyez sur Ctrl+C pour arrêter le serveur')
    print('=' * 60)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n\n👋 Serveur arrêté')
        httpd.server_close()


if __name__ == '__main__':
    run_server()
