import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
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
        setIsSubscribed(true);
        
        // Reset subscription status after 3 seconds
        setTimeout(() => setIsSubscribed(false), 3000);
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
    <section className="mb-12">
      <Card className="w-full overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-none shadow-lg">
        <CardContent className="p-8 sm:p-12 flex flex-col items-center text-center">
          <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full mb-4">
            <Mail className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {t('newsletter.stay_updated')}
          </h2>
          <p className="max-w-2xl text-gray-600 dark:text-gray-300 mb-8 text-lg">
            {t('newsletter.get_latest')}
          </p>
          
          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <Input
                  type="email"
                  placeholder={t('newsletter.email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-2 border-gray-300 focus:border-red-500 rounded-xl px-5 py-4 text-base shadow-sm focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-red-500 whitespace-nowrap"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('newsletter.subscribing')}
                  </div>
                ) : (
                  <>
                    {t('newsletter.subscribe')}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-semibold">{t('newsletter.success')}</span>
            </div>
          )}
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {t('newsletter.unsubscribe_anytime')}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}; 