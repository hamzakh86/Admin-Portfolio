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
  Award,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { certificationService } from '@/lib/api';

const certificationSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  link: z.string().optional(),
  image: z.string().optional(),
});

const CertificationManager = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(certificationSchema),
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await certificationService.getAll();
      if (response.success) {
        setCertifications(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des certifications' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      let response;
      if (editingCertification) {
        response = await certificationService.update(editingCertification._id, data);
      } else {
        response = await certificationService.create(data);
      }

      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: editingCertification ? 'Certification mise à jour avec succès' : 'Certification créée avec succès' 
        });
        fetchCertifications();
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

  const handleEdit = (certification) => {
    setEditingCertification(certification);
    reset({
      title: certification.title,
      description: certification.description,
      link: certification.link || '',
      image: certification.image || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette certification ?')) {
      return;
    }

    try {
      const response = await certificationService.delete(id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Certification supprimée avec succès' });
        fetchCertifications();
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
    setEditingCertification(null);
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
        <h3 className="text-lg font-medium">Certifications</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCertification(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une certification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCertification ? 'Modifier la certification' : 'Ajouter une certification'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations de la certification
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la certification</Label>
                <Input
                  id="title"
                  placeholder="Ex: AWS Certified Developer"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description de la certification..."
                  rows={3}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Lien de vérification (optionnel)</Label>
                <Input
                  id="link"
                  placeholder="Ex: https://verify.certification.com/123"
                  {...register('link')}
                />
                {errors.link && (
                  <p className="text-sm text-red-600">{errors.link.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de l'image (optionnel)</Label>
                <Input
                  id="image"
                  placeholder="Ex: https://example.com/certificate.jpg"
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
                    editingCertification ? 'Mettre à jour' : 'Créer'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {certifications.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-gray-500">Aucune certification trouvée</p>
            </CardContent>
          </Card>
        ) : (
          certifications.map((certification) => (
            <Card key={certification._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    {certification.image ? (
                      <img
                        src={certification.image}
                        alt={certification.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <Award className="h-4 w-4" />
                        <span className="text-sm">{certification.title}</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {certification.description}
                      </p>
                      {certification.link && (
                        <a
                          href={certification.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Vérifier</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(certification)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(certification._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CertificationManager;

