import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MovieCard from '@/components/movies/MovieCard';
import { supabase } from '@/integrations/supabase/client';

interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  genre: string[];
  duration: number;
  rating: number;
  release_date: string;
  description: string;
  director: string;
  cast_members: string[];
  language: string;
  trailer_url?: string;
}

const FeaturedMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('release_date', { ascending: false })
        .limit(4);

      if (error) throw error;
      setMovies(data || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform database movie to component format
  const transformMovie = (movie: Movie) => ({
    id: movie.id,
    title: movie.title,
    poster: movie.poster,
    backdrop: movie.backdrop,
    genre: movie.genre,
    duration: movie.duration,
    rating: movie.rating || 0,
    releaseDate: movie.release_date,
    description: movie.description,
    director: movie.director,
    cast: movie.cast_members,
    language: movie.language,
    trailerUrl: movie.trailer_url,
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Now Showing</h2>
            <p className="text-muted-foreground mt-1">Catch the latest blockbusters</p>
          </div>
          <Link to="/movies">
            <Button variant="ghost" className="group">
              View All
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <MovieCard movie={transformMovie(movie)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No movies available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedMovies;