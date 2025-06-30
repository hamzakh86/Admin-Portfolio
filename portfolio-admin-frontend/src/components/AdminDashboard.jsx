import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, 
  Briefcase, 
  MessageSquare, 
  Award, 
  Code, 
  Settings,
  FileText,
  User
} from 'lucide-react';
import { authService } from '@/lib/api';
import WorkExperienceManager from './managers/WorkExperienceManager';
import TestimonialManager from './managers/TestimonialManager';
import CertificationManager from './managers/CertificationManager';
import ProjectManager from './managers/ProjectManager';
import TechnologyManager from './managers/TechnologyManager';
import CVManager from './managers/CVManager';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('work-experience');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await authService.verifyToken();
        if (response.success) {
          setUser(response.user);
        }
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
        onLogout();
      }
    };

    verifyToken();
  }, [onLogout]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      onLogout();
    }
  };

  const tabs = [
    {
      id: 'work-experience',
      label: 'Expériences',
      icon: Briefcase,
      component: WorkExperienceManager
    },
    {
      id: 'testimonials',
      label: 'Témoignages',
      icon: MessageSquare,
      component: TestimonialManager
    },
    {
      id: 'certifications',
      label: 'Certifications',
      icon: Award,
      component: CertificationManager
    },
    {
      id: 'projects',
      label: 'Projets',
      icon: Code,
      component: ProjectManager
    },
    {
      id: 'technologies',
      label: 'Technologies',
      icon: Settings,
      component: TechnologyManager
    },
    {
      id: 'cv',
      label: 'CV',
      icon: FileText,
      component: CVManager
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Portfolio Admin
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {user || 'Admin'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabs.map((tab) => {
              const Component = tab.component;
              return (
                <TabsContent key={tab.id} value={tab.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <tab.icon className="h-5 w-5" />
                        <span>Gestion des {tab.label}</span>
                      </CardTitle>
                      <CardDescription>
                        Créer, modifier et supprimer les {tab.label.toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Component />
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

