import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Settings,
  Code
} from 'lucide-react';
import { technologyService } from '@/lib/api';

const technologySchema = z.object({
  name: z.string().min(1, 'Le nom de la technologie est requis'),
});

const TechnologyManager = () => {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTechnology, setEditingTechnology] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(technologySchema),
  });

  useEffect(() => {
    fetchTechnologies();
  }, []);

  const fetchTechnologies = async () => {
    try {
      const response = await technologyService.getAll();
      if (response.success) {
        setTechnologies(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des technologies' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      let response;
      if (editingTechnology) {
        response = await technologyService.update(editingTechnology._id, data);
      } else {
        response = await technologyService.create(data);
      }

      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: editingTechnology ? 'Technologie mise à jour avec succès' : 'Technologie créée avec succès' 
        });
        fetchTechnologies();
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

  const handleEdit = (technology) => {
    setEditingTechnology(technology);
    reset({
      name: technology.name
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette technologie ?')) {
      return;
    }

    try {
      const response = await technologyService.delete(id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Technologie supprimée avec succès' });
        fetchTechnologies();
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
    setEditingTechnology(null);
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
        <h3 className="text-lg font-medium">Technologies</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTechnology(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une technologie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTechnology ? 'Modifier la technologie' : 'Ajouter une technologie'}
              </DialogTitle>
              <DialogDescription>
                Ajoutez une nouvelle technologie à votre stack
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la technologie</Label>
                <Input
                  id="name"
                  placeholder="Ex: React.js, Python, MongoDB..."
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
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
                    editingTechnology ? 'Mettre à jour' : 'Créer'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Stack Technologique</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {technologies.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">Aucune technologie trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {technologies.map((technology) => (
                  <div key={technology._id} className="group relative">
                    <Badge 
                      variant="secondary" 
                      className="pr-8 text-sm py-1 px-3 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      <Code className="h-3 w-3 mr-1" />
                      {technology.name}
                    </Badge>
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-blue-100"
                        onClick={() => handleEdit(technology)}
                      >
                        <Edit className="h-2 w-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-red-100"
                        onClick={() => handleDelete(technology._id)}
                      >
                        <Trash2 className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-gray-600">
                Total: {technologies.length} technologie{technologies.length > 1 ? 's' : ''}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste détaillée pour les écrans plus petits */}
      <div className="md:hidden space-y-2">
        {technologies.map((technology) => (
          <Card key={technology._id}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{technology.name}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(technology)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(technology._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TechnologyManager;

