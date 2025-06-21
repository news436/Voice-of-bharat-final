import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ArticleManager } from '@/components/admin/ArticleManager';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { VideoManager } from '@/components/admin/VideoManager';
import { LiveStreamManager } from '@/components/admin/LiveStreamManager';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { StateManager } from '@/components/admin/StateManager';
import { AdManager } from '@/components/admin/AdManager';
import { AboutUsManager } from '@/components/admin/AboutUsManager';
import { toast } from '@/hooks/use-toast';

type AdminSection = 'dashboard' | 'articles' | 'categories' | 'videos' | 'live' | 'analytics' | 'states' | 'admanager' | 'about';

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check user profile and role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !profile || !['admin', 'editor'].includes(profile.role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setUserProfile(profile);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard onQuickAction={handleSectionChange} userProfile={userProfile} />;
      case 'articles':
        return <ArticleManager />;
      case 'categories':
        return <CategoryManager />;
      case 'videos':
        return <VideoManager />;
      case 'live':
        return <LiveStreamManager />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'states':
        return <StateManager />;
      case 'admanager':
        return <AdManager />;
      case 'about':
        return <AboutUsManager />;
      default:
        return <AdminDashboard onQuickAction={handleSectionChange} userProfile={userProfile} />;
    }
  };

  return (
    <AdminLayout
      user={user}
      userProfile={userProfile}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      onSignOut={handleSignOut}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;
