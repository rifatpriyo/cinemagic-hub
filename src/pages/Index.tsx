import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedMovies from '@/components/home/FeaturedMovies';
import FeaturedConcerts from '@/components/home/FeaturedConcerts';
import PromoSection from '@/components/home/PromoSection';

const Index: React.FC = () => {
  useEffect(() => {
    document.title = 'TixWix - Book Movie & Concert Tickets in Bangladesh';
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <HeroSection />
        <FeaturedMovies />
        <FeaturedConcerts />
        <PromoSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
