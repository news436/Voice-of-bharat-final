import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Mail, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const NewsletterSignup = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email, is_active: true }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: t('newsletter.already_subscribed'),
            description: t('newsletter.already_subscribed_desc'),
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: t('newsletter.success'),
          description: t('newsletter.success_desc'),
        });
        setEmail('');
        onClose(); // Close on success
      }
    } catch (error: any) {
      toast({
        title: t('newsletter.failed'),
        description: t('newsletter.failed_desc'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center animate-in fade-in-90 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-5">
          <Mail className="h-8 w-8 text-red-600" />
        </div>
        
        <h3 className="font-bold text-3xl md:text-4xl text-gray-900 mb-3">
            {t('newsletter.join_our_newsletter')}
        </h3>
        
        <p className="text-gray-600 text-base md:text-lg max-w-md mx-auto mb-8">
            {t('newsletter.get_the_latest_news')}
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-grow">
              <Input
                  type="email"
                  placeholder={t('newsletter.enter_your_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-2 border-gray-300 focus:border-red-500 rounded-xl px-5 py-4 text-base shadow-sm focus:ring-1 focus:ring-red-500 transition-colors h-14"
              />
            </div>
            <Button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white text-base font-semibold py-4 px-8 rounded-xl shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-red-500 h-14"
            >
                {isLoading ? t('newsletter.subscribing') : t('newsletter.subscribe_now')}
                {!isLoading && <ArrowRight className="h-5 w-5 ml-2" />}
            </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-5">
            {t('newsletter.unsubscribe_anytime')}
        </p>
      </div>
    </div>
  );
};
