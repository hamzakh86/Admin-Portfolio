import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Code,
  ExternalLink,
  Github,
  Image as ImageIcon
} from 'lucide-react';
import { projectService } from '@/lib/api';

const projectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().min(1, 'La description est requise'),
  technologies: z.string().min(1, 'Les technologies sont requises'),
  github: z.string().optional(),
  demo: z.string().optional(),
  image: z.string().optional(),
});

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des projets' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Convertir les technologies en tableau
      const formattedData = {
        ...data,
        technologies: data.technologies.split(',').map(tech => tech.trim()).filter(tech => tech !== '')
      };

      let response;
      if (editingProject) {
        response = await projectService.update(editingProject._id, formattedData);
      } else {
        response = await projectService.create(formattedData);
      }

      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: editingProject ? 'Projet mis à jour avec succès' : 'Projet créé avec succès' 
        });
        fetchProjects();
        handleCloseDialog();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la sauvegarde' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    reset({
      name: project.name,
      description: project.description,
      technologies: project.technologies.join(', '),
      github: project.github || '',
      demo: project.demo || '',
      image: project.image || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      const response = await projectService.delete(id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Projet supprimé avec succès' });
        fetchProjects();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la suppression' 
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
    reset();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message.text && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Projets</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProject(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un projet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? 'Modifier le projet' : 'Ajouter un projet'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations du projet
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du projet</Label>
                <Input
                  id="name"
                  placeholder="Ex: E-commerce Platform"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description détaillée du projet..."
                  rows={4}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies (séparées par des virgules)</Label>
                <Input
                  id="technologies"
                  placeholder="Ex: React, Node.js, MongoDB, Express"
                  {...register('technologies')}
                />
                {errors.technologies && (
                  <p className="text-sm text-red-600">{errors.technologies.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github">Lien GitHub (optionnel)</Label>
                  <Input
                    id="github"
                    placeholder="Ex: https://github.com/user/repo"
                    {...register('github')}
                  />
                  {errors.github && (
                    <p className="text-sm text-red-600">{errors.github.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demo">Lien démo (optionnel)</Label>
                  <Input
                    id="demo"
                    placeholder="Ex: https://demo.example.com"
                    {...register('demo')}
                  />
                  {errors.demo && (
                    <p className="text-sm text-red-600">{errors.demo.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de l'image (optionnel)</Label>
                <Input
                  id="image"
                  placeholder="Ex: https://example.com/project-screenshot.jpg"
                  {...register('image')}
                />
                {errors.image && (
                  <p className="text-sm text-red-600">{errors.image.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    editingProject ? 'Mettre à jour' : 'Créer'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-gray-500">Aucun projet trouvé</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span>{project.name}</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(project._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {project.image && (
                  <div className="mb-4">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Github className="h-3 w-3" />
                        <span>Code</span>
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Démo</span>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectManager;

