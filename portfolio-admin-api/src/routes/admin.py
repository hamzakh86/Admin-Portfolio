from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.portfolio import (
    work_experience_model, testimonial_model, certification_model,
    project_model, technology_model, cv_model
)
import os
from werkzeug.utils import secure_filename

admin_bp = Blueprint('admin', __name__)

# Configuration pour l'upload de fichiers
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_upload_folder():
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

# Routes pour Work Experience
@admin_bp.route('/work-experiences', methods=['GET'])
def get_work_experiences():
    try:
        experiences = work_experience_model.get_all()
        return jsonify({'success': True, 'data': experiences}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/work-experiences', methods=['POST'])
@jwt_required()
def create_work_experience():
    try:
        data = request.get_json()
        required_fields = ['title', 'company', 'duration', 'points']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Champ requis manquant: {field}'}), 400
        
        experience_id = work_experience_model.create(data)
        return jsonify({'success': True, 'id': experience_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/work-experiences/<experience_id>', methods=['PUT'])
@jwt_required()
def update_work_experience(experience_id):
    try:
        data = request.get_json()
        success = work_experience_model.update(experience_id, data)
        
        if success:
            return jsonify({'success': True, 'message': 'Expérience mise à jour avec succès'}), 200
        else:
            return jsonify({'success': False, 'message': 'Expérience non trouvée'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/work-experiences/<experience_id>', methods=['DELETE'])
@jwt_required()
def delete_work_experience(experience_id):
    try:
        success = work_experience_model.delete(experience_id)
        
        if success:
            return jsonify({'success': True, 'message': 'Expérience supprimée avec succès'}), 200
        else:
            return jsonify({'success': False, 'message': 'Expérience non trouvée'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Routes pour Testimonials
@admin_bp.route('/testimonials', methods=['GET'])
def get_testimonials():
    try:
        testimonials = testimonial_model.get_all()
        return jsonify({'success': True, 'data': testimonials}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/testimonials', methods=['POST'])
@jwt_required()
def create_testimonial():
    try:
        data = request.get_json()
        required_fields = ['name', 'role', 'content']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Champ requis manquant: {field}'}), 400
        
        testimonial_id = testimonial_model.create(data)
        return jsonify({'success': True, 'id': testimonial_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/testimonials/<testimonial_id>', methods=['PUT'])
@jwt_required()
def update_testimonial(testimonial_id):
    try:
        data = request.get_json()
        success = testimonial_model.update(testimonial_id, data)
        
        if success:
            return jsonify({'success': True, 'message': 'Témoignage mis à jour avec succès'}), 200
        else:
            return jsonify({'success': False, 'message': 'Témoignage non trouvé'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/testimonials/<testimonial_id>', methods=['DELETE'])
@jwt_required()
def delete_testimonial(testimonial_id):
    try:
        success = testimonial_model.delete(testimonial_id)
        
        if success:
            return jsonify({'success': True, 'message': 'Témoignage supprimé avec succès'}), 200
        else:
            return jsonify({'success': False, 'message': 'Témoignage non trouvé'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Routes pour Certifications
@admin_bp.route('/certifications', methods=['GET'])
def get_certifications():
    try:
        certifications = certification_model.get_all()
        return jsonify({'success': True, 'data': certifications}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/certifications', methods=['POST'])
@jwt_required()
def create_certification():
    try:
        data = request.get_json()
        required_fields = ['title', 'description']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Champ requis manquant: {field}'}), 400
        
        certification_id = certification_model.create(data)
        return jsonify({'success': True, 'id': certification_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/certifications/<certification_id>', methods=['PUT'])
@jwt_required()
def update_certification(certification_id):
    try:
        data = request.get_json()
        success = certification_model.update(certification_id, data)
        
        if success:
            return jsonify({'success': True, 'message': 'Certification mise à jour avec succès'}), 200
        else:
            return jsonify({'success': False, 'message': 'Certification non trouvée'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/certifications/<certification_id>', methods=['DELETE'])
@jwt_required()
def delete_certification(certification_id):
    try:
        success = certification_model.delete(certification_id)
        
        if success:
            return jsonify({'success': True, 'message': 'Certification supprimée avec succès'}), 200
        else:
            return jsonify({'success': False, 'message': 'Certification non trouvée'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Routes pour Projects
@admin_bp.route('/projects', methods=['GET'])
def get_projects():
    try:
        projects = project_model.get_all()
        return jsonify({'success': True, 'data': projects}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    try:
        data = request.get_json()
        required_fields = ['name', 'description', 'technologies']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Champ requis manquant: {field}'}), 400
        
        project_id = project_model.create(data)
        return jsonify({'success': True, 'id': project_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/projects/<project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    try:
        data = request.get_json()
        success = project_model.update(project_id, data)
        
        if success:
            return jsonify({'success': True, 'message': 'Projet mis à jour avec succès'}), 200
        else:
            return jsonify({'success': False, 'message': 'Projet non trouvé'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/projects/<project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    try:
        success = project_model.delete(project_id)
        
        if success:
            return jsonify({'success': True, 'message': 'Projet supprimé avec succès'}), 200
        else:
            return jsonify({'success': False, 'message': 'Projet non trouvé'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Routes pour Technologies
@admin_bp.route('/technologies', methods=['GET'])
def get_technologies():
    try:
        technologies = technology_model.get_all()
        return jsonify({'success': True, 'data': technologies}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/technologies', methods=['POST'])
@jwt_required()
def create_technology():
    try:
        data = request.get_json()
        required_fields = ['name']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Champ requis manquant: {field}'}), 400
        
        technology_id = technology_model.create(data)
        return jsonify({'success': True, 'id': technology_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/technologies/<technology_id>', methods=['PUT'])
@jwt_required()
def update_technology(technology_id):
    try:
        data = request.get_json()
        success = technology_model.update(technology_id, data)
        
        if success:
            return jsonify({'success': True, 'message': 'Technologie mise à jour avec succès'}), 200
        else:
            return jsonify({'success': False, 'message': 'Technologie non trouvée'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/technologies/<technology_id>', methods=['DELETE'])
@jwt_required()
def delete_technology(technology_id):
    try:
        success = technology_model.delete(technology_id)
        
        if success:
            return jsonify({'success': True, 'message': 'Technologie supprimée avec succès'}), 200
        else:
            return jsonify({'success': False, 'message': 'Technologie non trouvée'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Routes pour CV
@admin_bp.route('/cv', methods=['GET'])
def get_cv():
    try:
        cv_data = cv_model.get_all()
        return jsonify({'success': True, 'data': cv_data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/cv', methods=['POST'])
@jwt_required()
def upload_cv():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'Aucun fichier fourni'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Aucun fichier sélectionné'}), 400
        
        if file and allowed_file(file.filename):
            create_upload_folder()
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            cv_data = {
                'file_path': file_path,
                'filename': filename
            }
            
            cv_id = cv_model.create(cv_data)
            return jsonify({'success': True, 'id': cv_id, 'file_path': file_path}), 201
        else:
            return jsonify({'success': False, 'message': 'Type de fichier non autorisé'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/cv/<cv_id>', methods=['DELETE'])
@jwt_required()
def delete_cv(cv_id):
    try:
        # Récupérer les informations du CV avant suppression
        cv_data = cv_model.get_by_id(cv_id)
        if cv_data and 'file_path' in cv_data:
            # Supprimer le fichier physique
            if os.path.exists(cv_data['file_path']):
                os.remove(cv_data['file_path'])
        
        success = cv_model.delete(cv_id)
        
        if success:
            return jsonify({'success': True, 'message': 'CV supprimé avec succès'}), 200
        else:
            return jsonify({'success': False, 'message': 'CV non trouvé'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

