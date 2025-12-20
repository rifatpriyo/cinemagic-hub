import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConcertCard from '@/components/concerts/ConcertCard';
import { concerts } from '@/data/mockData';

const FeaturedConcerts: React.FC = () => {
  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Upcoming Concerts</h2>
            <p className="text-muted-foreground mt-1">Live music experiences at Convention Hall</p>
          </div>
          <Link to="/concerts">
            <Button variant="ghost" className="group">
              View All
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {concerts.map((concert, index) => (
            <div
              key={concert.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ConcertCard concert={concert} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedConcerts;
