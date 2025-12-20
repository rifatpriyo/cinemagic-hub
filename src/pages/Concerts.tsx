import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ConcertCard from '@/components/concerts/ConcertCard';
import { concerts } from '@/data/mockData';

const Concerts: React.FC = () => {
  useEffect(() => {
    document.title = 'Upcoming Concerts - TixWix Convention Hall';
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Upcoming Concerts</h1>
            <p className="text-muted-foreground">Live music experiences at our Convention Hall</p>
          </div>

          {/* Concerts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {concerts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No concerts scheduled at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for upcoming events!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Concerts;
