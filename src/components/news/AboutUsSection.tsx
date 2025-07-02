import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Info, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const AboutUsSection = () => {
  const { t } = useLanguage();
  const [shortDescription, setShortDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAboutUsContent = async () => {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from('about_us')
        .select('short_description')
        .single();

      if (data) {
        setShortDescription(data.short_description);
      } else if (error && error.code !== 'PGRST116') {
        console.error("Error fetching About Us content:", error);
      }
      setIsLoading(false);
    };

    fetchAboutUsContent();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center my-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <section className="mb-12">
      <Card className="w-full overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 border-none shadow-lg">
        <CardContent className="p-8 sm:p-12 flex flex-col items-center text-center">
          <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full mb-4">
            <Info className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {t('about.voice_of_bharat')}
          </h2>
          <p className="max-w-2xl text-gray-600 dark:text-gray-300 mb-8 text-lg">
            {shortDescription || "We are a dedicated team committed to bringing you the latest and most accurate news. Our mission is to be the voice of the people, for the people."}
          </p>
          <Button asChild size="lg" className="group bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-transform transform hover:scale-105">
            <Link to="/about-us">
              {t('learn.more')}
              <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};

export default AboutUsSection; 