import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Users, Target, Eye } from 'lucide-react';

const AboutUsPage = () => {
  const [content, setContent] = useState({
    detailedContent: '',
    heroImageUrl: '',
    teamImageUrl: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  useEffect(() => {
    const fetchAboutUsContent = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('about_us')
          .select('detailed_content, hero_image_url, team_image_url')
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setContent({
            detailedContent: data.detailed_content || '',
            heroImageUrl: data.hero_image_url || '/placeholder-hero.jpg', // Fallback image
            teamImageUrl: data.team_image_url || '/placeholder-team.jpg', // Fallback image
          });
        } else {
          // Set default content if nothing is in the database
          setContent({
            detailedContent: '<p>Voice of Bharat is dedicated to bringing you unfiltered news and empowering stories from every corner of the nation. Our mission is to amplify the voices that need to be heard and to foster a more informed and engaged society.</p>',
            heroImageUrl: '/placeholder-hero.jpg',
            teamImageUrl: '/placeholder-team.jpg',
          });
        }
      } catch (error) {
        console.error("Error fetching About Us content:", error);
        // Set fallback content on error as well
         setContent({
            detailedContent: '<p>There was an error loading our story, but our commitment remains: to be the true voice of the people. We are working to bring this page back online soon.</p>',
            heroImageUrl: '/placeholder-hero.jpg',
            teamImageUrl: '/placeholder-team.jpg',
          });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutUsContent();
  }, []);

  const AnimatedSection = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-200 font-sans">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[80vh] overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${content.heroImageUrl})`, scale, opacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-end items-center text-center text-white pb-16 md:pb-24 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-lg"
          >
            The Heartbeat of the Nation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-4 md:mt-6 text-lg md:text-xl max-w-3xl font-medium"
          >
            We are Voice of Bharat. This is our story.
          </motion.p>
        </div>
      </div>

      <main className="container mx-auto px-6 py-16 md:py-24 space-y-20 md:space-y-32">
        {/* Our Story Section */}
        <AnimatedSection>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-6">Our Story</h2>
            <div
              className="prose dark:prose-invert lg:prose-xl max-w-none text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.detailedContent }}
            />
          </div>
        </AnimatedSection>

        {/* Mission & Vision Section */}
        <AnimatedSection>
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
                  <Target className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Our Mission</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    To deliver fearless journalism, uncover the truth, and provide a platform for the diverse voices that make up the fabric of India.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
                  <Eye className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Our Vision</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    To be the most trusted and essential source of news and information, fostering an informed and engaged citizenry for a stronger nation.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full h-80 md:h-full bg-gray-200 dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <img src={content.teamImageUrl} alt="Our team at work" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </AnimatedSection>
        
        {/* Meet The Team Section - Designed for future use */}
        <AnimatedSection>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-12">Meet The Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Placeholder for team members. This can be mapped from an array later. */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 overflow-hidden">
                    {/* Placeholder for team member image */}
                     <Users className="w-full h-full text-gray-400 dark:text-gray-500 p-6" />
                  </div>
                  <h4 className="text-xl font-bold">Team Member</h4>
                  <p className="text-red-500 font-semibold">Role / Position</p>
                </div>
              ))}
            </div>
             <p className="mt-12 text-gray-600 dark:text-gray-400">
              Our full team directory is coming soon.
            </p>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
};

export default AboutUsPage; 