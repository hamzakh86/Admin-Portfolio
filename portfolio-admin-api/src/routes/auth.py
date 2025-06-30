from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
import os
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

# Configuration d'authentification simple (en production, utiliser une base de données)
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD_HASH = generate_password_hash(os.getenv('ADMIN_PASSWORD', 'admin123'))

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'success': False, 'message': 'Nom d\'utilisateur et mot de passe requis'}), 400
        
        username = data['username']
        password = data['password']
        
        # Vérifier les identifiants
        if username == ADMIN_USERNAME and check_password_hash(ADMIN_PASSWORD_HASH, password):
            # Créer le token JWT
            access_token = create_access_token(
                identity=username,
                expires_delta=timedelta(hours=24)
            )
            
            return jsonify({
                'success': True,
                'access_token': access_token,
                'message': 'Connexion réussie'
            }), 200
        else:
            return jsonify({'success': False, 'message': 'Identifiants invalides'}), 401
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@auth_bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        current_user = get_jwt_identity()
        return jsonify({
            'success': True,
            'user': current_user,
            'message': 'Token valide'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # Note: Avec JWT, la déconnexion côté serveur nécessite une liste noire des tokens
    # Pour simplifier, nous retournons juste un message de succès
    # Le client devra supprimer le token de son stockage local
    return jsonify({
        'success': True,
        'message': 'Déconnexion réussie'
    }), 200

