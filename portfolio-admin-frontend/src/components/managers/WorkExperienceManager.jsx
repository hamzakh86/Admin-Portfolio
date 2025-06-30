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
  Building,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { workExperienceService } from '@/lib/api';

const workExperienceSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  company: z.string().min(1, 'L\'entreprise est requise'),
  duration: z.string().min(1, 'La durée est requise'),
  points: z.string().min(1, 'Les points sont requis'),
});

const WorkExperienceManager = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workExperienceSchema),
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await workExperienceService.getAll();
      if (response.success) {
        setExperiences(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des expériences' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Convertir les points en tableau
      const formattedData = {
        ...data,
        points: data.points.split('\n').filter(point => point.trim() !== '')
      };

      let response;
      if (editingExperience) {
        response = await workExperienceService.update(editingExperience._id, formattedData);
      } else {
        response = await workExperienceService.create(formattedData);
      }

      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: editingExperience ? 'Expérience mise à jour avec succès' : 'Expérience créée avec succès' 
        });
        fetchExperiences();
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

  const handleEdit = (experience) => {
    setEditingExperience(experience);
    reset({
      title: experience.title,
      company: experience.company,
      duration: experience.duration,
      points: experience.points.join('\n')
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) {
      return;
    }

    try {
      const response = await workExperienceService.delete(id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Expérience supprimée avec succès' });
        fetchExperiences();
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
    setEditingExperience(null);
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
        <h3 className="text-lg font-medium">Expériences Professionnelles</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingExperience(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une expérience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingExperience ? 'Modifier l\'expérience' : 'Ajouter une expérience'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations de l'expérience professionnelle
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du poste</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Développeur Full Stack"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    placeholder="Ex: TechCorp"
                    {...register('company')}
                  />
                  {errors.company && (
                    <p className="text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée</Label>
                <Input
                  id="duration"
                  placeholder="Ex: Jan 2023 - Présent"
                  {...register('duration')}
                />
                {errors.duration && (
                  <p className="text-sm text-red-600">{errors.duration.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points clés (un par ligne)</Label>
                <Textarea
                  id="points"
                  placeholder="Développement d'applications web&#10;Collaboration en équipe&#10;Gestion de projets"
                  rows={6}
                  {...register('points')}
                />
                {errors.points && (
                  <p className="text-sm text-red-600">{errors.points.message}</p>
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
                    editingExperience ? 'Mettre à jour' : 'Créer'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {experiences.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-gray-500">Aucune expérience trouvée</p>
            </CardContent>
          </Card>
        ) : (
          experiences.map((experience) => (
            <Card key={experience._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{experience.title}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>{experience.company}</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{experience.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(experience)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(experience._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {experience.points.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkExperienceManager;

