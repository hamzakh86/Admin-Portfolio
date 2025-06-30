import axios from 'axios';

const API_BASE_URL = 'https://w5hni7coxdk5.manus.space/api';

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  verifyToken: async () => {
    const response = await api.get('/auth/verify-token');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('admin_token');
    return response.data;
  }
};

// Services pour Work Experience
export const workExperienceService = {
  getAll: async () => {
    const response = await api.get('/admin/work-experiences');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/work-experiences', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/work-experiences/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/work-experiences/${id}`);
    return response.data;
  }
};

// Services pour Testimonials
export const testimonialService = {
  getAll: async () => {
    const response = await api.get('/admin/testimonials');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/testimonials', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/testimonials/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/testimonials/${id}`);
    return response.data;
  }
};

// Services pour Certifications
export const certificationService = {
  getAll: async () => {
    const response = await api.get('/admin/certifications');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/certifications', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/certifications/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/certifications/${id}`);
    return response.data;
  }
};

// Services pour Projects
export const projectService = {
  getAll: async () => {
    const response = await api.get('/admin/projects');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/projects', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/projects/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/projects/${id}`);
    return response.data;
  }
};

// Services pour Technologies
export const technologyService = {
  getAll: async () => {
    const response = await api.get('/admin/technologies');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/technologies', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/technologies/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/technologies/${id}`);
    return response.data;
  }
};

// Services pour CV
export const cvService = {
  getAll: async () => {
    const response = await api.get('/admin/cv');
    return response.data;
  },
  
  upload: async (formData) => {
    const response = await api.post('/admin/cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/cv/${id}`);
    return response.data;
  }
};

export default api;

