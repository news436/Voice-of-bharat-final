import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LiveStreamSectionProps {
  streams: any[];
}

export const LiveStreamSection = ({ streams }: LiveStreamSectionProps) => {
  if (streams.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2 inline-block relative">
          <Radio className="h-6 w-6 text-black dark:text-white mr-2 inline-block" />
        Live Now
          <span className="block h-1 bg-red-600 rounded-full mt-1 w-full" style={{ maxWidth: '100%' }} />
      </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((stream) => (
          <Link to={`/live/${stream.id}`} key={stream.id}>
          <Card className="hover:shadow-2xl transition-shadow border-black h-full">
            <CardContent className="p-4">
              <div className="relative">
                {stream.thumbnail_url ? (
                  <img
                    src={stream.thumbnail_url}
                    alt={stream.title}
                    className="w-full h-48 object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center">
                    <Radio className="h-12 w-12 text-black dark:text-white" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-black text-white animate-pulse">
                    <Radio className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <h3 className="font-semibold text-lg line-clamp-2 text-black dark:text-white">{stream.title}</h3>
                {stream.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{stream.description}</p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-500">
                    Started: {new Date(stream.created_at).toLocaleTimeString()}
                  </span>
                  <Button size="sm" className="bg-black text-white hover:bg-gray-900">
                    Watch Now
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};
