import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export const SupportUsCta = () => {
  return (
    <div className="bg-red-700/10 dark:bg-red-900/20 py-12">
      <div className="container mx-auto px-4 text-center">
        <Heart className="mx-auto h-12 w-12 text-red-600 mb-4" />
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Support Our Mission
        </h2>
        <p className="mt-4 text-lg leading-6 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Independent journalism is vital for a healthy democracy. Your contribution helps us stay independent and bring you the stories that matter.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
            <Link to="/support-us">
              Contribute Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}; 