import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Music } from 'lucide-react';
import { Concert } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ConcertCardProps {
  concert: Concert;
}

const ConcertCard: React.FC<ConcertCardProps> = ({ concert }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const lowestPrice = Math.min(...concert.sections.map(s => s.price));

  return (
    <Link to={`/concert/${concert.id}`}>
      <div className="group relative overflow-hidden rounded-xl bg-card border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={concert.poster}
            alt={concert.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          {/* Genre Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-accent text-accent-foreground">
              <Music className="w-3 h-3 mr-1" />
              {concert.genre}
            </Badge>
          </div>

          {/* Date Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-foreground">
                <Calendar className="w-4 h-4 text-accent" />
                <span>{formatDate(concert.date)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-foreground">
                <Clock className="w-4 h-4 text-accent" />
                <span>{concert.time}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
            {concert.title}
          </h3>
          <p className="text-sm text-muted-foreground">{concert.artist}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">From</span>
            <span className="font-bold text-accent">৳{lowestPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ConcertCard;
