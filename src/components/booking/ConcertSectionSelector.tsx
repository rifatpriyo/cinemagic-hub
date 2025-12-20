import React from 'react';
import { ConcertSection } from '@/types';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

interface ConcertSectionSelectorProps {
  sections: ConcertSection[];
  selectedSection: ConcertSection | null;
  quantity: number;
  onSectionSelect: (section: ConcertSection) => void;
  onQuantityChange: (quantity: number) => void;
}

const ConcertSectionSelector: React.FC<ConcertSectionSelectorProps> = ({
  sections,
  selectedSection,
  quantity,
  onSectionSelect,
  onQuantityChange,
}) => {
  const getSectionColor = (name: string) => {
    switch (name) {
      case 'vip': return 'border-primary bg-primary/10 hover:bg-primary/20';
      case 'front': return 'border-accent bg-accent/10 hover:bg-accent/20';
      case 'middle': return 'border-gold bg-gold/10 hover:bg-gold/20';
      case 'back': return 'border-muted-foreground bg-muted/30 hover:bg-muted/50';
      default: return 'border-border bg-card';
    }
  };

  const getSectionName = (name: string) => {
    switch (name) {
      case 'vip': return 'VIP Section';
      case 'front': return 'Front Section';
      case 'middle': return 'Middle Section';
      case 'back': return 'Back Section';
      default: return name;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stage Visual */}
      <div className="relative">
        <div className="h-12 bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20 rounded-lg flex items-center justify-center">
          <span className="text-sm font-semibold text-accent">🎤 STAGE</span>
        </div>
      </div>

      {/* Section Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const isSelected = selectedSection?.id === section.id;
          const isSoldOut = section.availableCapacity === 0;
          
          return (
            <button
              key={section.id}
              onClick={() => !isSoldOut && onSectionSelect(section)}
              disabled={isSoldOut}
              className={cn(
                'p-4 rounded-xl border-2 transition-all duration-300 text-left',
                getSectionColor(section.name),
                isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]',
                isSoldOut && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{getSectionName(section.name)}</h3>
                <span className="text-lg font-bold text-primary">৳{section.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>
                  {isSoldOut ? 'Sold Out' : `${section.availableCapacity} spots available`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quantity Selector */}
      {selectedSection && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Number of Tickets</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-lg font-bold transition-colors"
              >
                −
              </button>
              <span className="w-10 text-center text-xl font-bold">{quantity}</span>
              <button
                onClick={() => onQuantityChange(Math.min(selectedSection.availableCapacity, quantity + 1))}
                className="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-lg font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Max {Math.min(10, selectedSection.availableCapacity)} tickets per booking
          </p>
        </div>
      )}
    </div>
  );
};

export default ConcertSectionSelector;
