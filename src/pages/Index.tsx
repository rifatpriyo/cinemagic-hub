import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedMovies from '@/components/home/FeaturedMovies';
import FeaturedConcerts from '@/components/home/FeaturedConcerts';
import PromoSection from '@/components/home/PromoSection';

const Index: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>TixWix - Book Movie & Concert Tickets in Bangladesh</title>
        <meta name="description" content="Book movie tickets and concert passes at TixWix Cinema Complex. Experience IMAX, 4DX, Dolby Atmos and live concerts in Dhaka, Bangladesh." />
      </Helmet>
      
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
    </>
  );
};

export default Index;
