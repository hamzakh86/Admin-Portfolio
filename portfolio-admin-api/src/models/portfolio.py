from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime

# Configuration MongoDB
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = 'portfolio_admin'

class MongoDBConnection:
    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBConnection, cls).__new__(cls)
            cls._client = MongoClient(MONGO_URI)
            cls._db = cls._client[DATABASE_NAME]
        return cls._instance

    @property
    def db(self):
        return self._db

    @property
    def client(self):
        return self._client

# Instance globale de la connexion MongoDB
mongo_connection = MongoDBConnection()
db = mongo_connection.db

class BaseModel:
    def __init__(self, collection_name):
        self.collection = db[collection_name]

    def create(self, data):
        """Créer un nouveau document"""
        data['created_at'] = datetime.utcnow()
        data['updated_at'] = datetime.utcnow()
        result = self.collection.insert_one(data)
        return str(result.inserted_id)

    def get_all(self):
        """Récupérer tous les documents"""
        documents = list(self.collection.find())
        for doc in documents:
            doc['_id'] = str(doc['_id'])
        return documents

    def get_by_id(self, doc_id):
        """Récupérer un document par ID"""
        try:
            document = self.collection.find_one({'_id': ObjectId(doc_id)})
            if document:
                document['_id'] = str(document['_id'])
            return document
        except:
            return None

    def update(self, doc_id, data):
        """Mettre à jour un document"""
        try:
            data['updated_at'] = datetime.utcnow()
            result = self.collection.update_one(
                {'_id': ObjectId(doc_id)},
                {'$set': data}
            )
            return result.modified_count > 0
        except:
            return False

    def delete(self, doc_id):
        """Supprimer un document"""
        try:
            result = self.collection.delete_one({'_id': ObjectId(doc_id)})
            return result.deleted_count > 0
        except:
            return False

class WorkExperience(BaseModel):
    def __init__(self):
        super().__init__('work_experiences')

class Testimonial(BaseModel):
    def __init__(self):
        super().__init__('testimonials')

class Certification(BaseModel):
    def __init__(self):
        super().__init__('certifications')

class Project(BaseModel):
    def __init__(self):
        super().__init__('projects')

class Technology(BaseModel):
    def __init__(self):
        super().__init__('technologies')

class CV(BaseModel):
    def __init__(self):
        super().__init__('cv')

# Instances des modèles
work_experience_model = WorkExperience()
testimonial_model = Testimonial()
certification_model = Certification()
project_model = Project()
technology_model = Technology()
cv_model = CV()

