import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AboutUsPage = () => {
  const [detailedContent, setDetailedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAboutUsContent = async () => {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from('about_us')
        .select('detailed_content')
        .single();

      if (data) {
        setDetailedContent(data.detailed_content);
      } else if (error && error.code !== 'PGRST116') {
        console.error("Error fetching About Us content:", error);
      }
      setIsLoading(false);
    };

    fetchAboutUsContent();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black">
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20 sm:py-28 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            About Voice of Bharat
          </h1>
          <p className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto opacity-90">
            Your trusted source for unfiltered news and stories that matter.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900/50 rounded-2xl shadow-lg p-6 sm:p-10 -mt-24 sm:-mt-32 relative z-10">
          {detailedContent ? (
            <div
              className="prose dark:prose-invert lg:prose-xl max-w-none text-gray-800 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: detailedContent.replace(/\n/g, '<br />') }}
            />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">
                Our Story is Being Written
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Information about our mission, vision, and team will be available here soon. Please check back later.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AboutUsPage; 