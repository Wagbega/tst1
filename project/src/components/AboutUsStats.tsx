import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Zap, Smile, Calendar } from 'lucide-react';
import type { Database } from '../types/supabase';

type AboutUsStat = Database['public']['Tables']['about_us_stats']['Row'];

export default function AboutUsStats() {
  const [stats, setStats] = useState<AboutUsStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from('about_us_stats')
          .select('*')
          .order('order', { ascending: true });

        if (error) throw error;
        
        console.log('About Us Stats data:', data); // Debug log
        
        if (!data || data.length === 0) {
          throw new Error('No stats data found');
        }
        
        setStats(data);
      } catch (err) {
        console.error('Error fetching about us stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Display a message if no stats are found
  if (stats.length === 0) {
    return (
      <div className="text-center text-yellow-600 p-4">
        <p>No stats data available. Please check the database.</p>
      </div>
    );
  }

  // Function to render the appropriate icon based on the icon name
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'check-circle':
        return <CheckCircle className="w-10 h-10 text-green-500" />;
      case 'zap':
        return <Zap className="w-10 h-10 text-yellow-500" />;
      case 'smile':
        return <Smile className="w-10 h-10 text-blue-500" />;
      case 'calendar':
        return <Calendar className="w-10 h-10 text-purple-500" />;
      default:
        return <CheckCircle className="w-10 h-10 text-green-500" />;
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white p-6 rounded-lg shadow-md text-center transform transition duration-300 hover:scale-105">
              <div className="flex justify-center mb-4">
                {renderIcon(stat.icon)}
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-600 mt-2">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}