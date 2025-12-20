import React from 'react';
import { Gift, Percent, Star, Ticket } from 'lucide-react';

const PromoSection: React.FC = () => {
  const features = [
    {
      icon: Gift,
      title: '5th Show Free',
      description: 'Book 4 shows in a month and get your 5th one absolutely free!',
      color: 'text-primary',
    },
    {
      icon: Percent,
      title: 'Promo Codes',
      description: 'Use FIRSTORDER for 10% off on your first booking.',
      color: 'text-accent',
    },
    {
      icon: Star,
      title: 'Premium Halls',
      description: 'Experience IMAX, 4DX, and Dolby Atmos technology.',
      color: 'text-gold',
    },
    {
      icon: Ticket,
      title: 'Instant E-Tickets',
      description: 'Get your tickets instantly with QR code access.',
      color: 'text-success',
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Why Choose TixWix?</h2>
          <p className="text-muted-foreground">The best entertainment booking experience</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 text-center space-y-4 animate-slide-up hover:border-primary/30 transition-colors"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-secondary ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
