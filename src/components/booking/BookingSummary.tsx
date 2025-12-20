import React, { useState } from 'react';
import { Seat, ConcertSection, PromoCode } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { promoCodes } from '@/data/mockData';
import { Tag, Check, X, Gift } from 'lucide-react';
import { toast } from 'sonner';

interface BookingSummaryProps {
  type: 'movie' | 'concert';
  selectedSeats?: Seat[];
  selectedSection?: ConcertSection | null;
  quantity?: number;
  prices?: { normal: number; deluxe: number; super: number };
  isFreeShow?: boolean;
  onPromoApply: (discount: number) => void;
  onProceed: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  type,
  selectedSeats = [],
  selectedSection,
  quantity = 1,
  prices,
  isFreeShow = false,
  onPromoApply,
  onProceed,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const calculateSubtotal = () => {
    if (type === 'movie' && prices) {
      return selectedSeats.reduce((total, seat) => {
        return total + prices[seat.type];
      }, 0);
    }
    if (type === 'concert' && selectedSection) {
      return selectedSection.price * quantity;
    }
    return 0;
  };

  const subtotal = calculateSubtotal();
  const discount = appliedPromo 
    ? appliedPromo.type === 'percentage' 
      ? (subtotal * appliedPromo.discount) / 100 
      : appliedPromo.discount
    : 0;
  const total = isFreeShow ? 0 : Math.max(0, subtotal - discount);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    const promo = promoCodes.find(p => p.code.toUpperCase() === code && p.isActive);
    
    if (promo) {
      setAppliedPromo(promo);
      onPromoApply(promo.type === 'percentage' ? (subtotal * promo.discount) / 100 : promo.discount);
      toast.success(`Promo code applied! ${promo.discount}${promo.type === 'percentage' ? '%' : '৳'} off`);
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    onPromoApply(0);
  };

  const canProceed = type === 'movie' ? selectedSeats.length > 0 : selectedSection && quantity > 0;

  return (
    <div className="glass-card p-6 space-y-6 sticky top-24">
      <h3 className="text-lg font-semibold">Booking Summary</h3>

      {/* Selected Items */}
      {type === 'movie' && selectedSeats.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Selected Seats</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seat => (
              <span
                key={seat.id}
                className="px-2 py-1 bg-primary/20 text-primary rounded text-sm font-medium"
              >
                {seat.row}{seat.number}
              </span>
            ))}
          </div>
          {prices && (
            <div className="space-y-1 text-sm">
              {['normal', 'deluxe', 'super'].map(type => {
                const count = selectedSeats.filter(s => s.type === type).length;
                if (count === 0) return null;
                return (
                  <div key={type} className="flex justify-between text-muted-foreground">
                    <span className="capitalize">{type} × {count}</span>
                    <span>৳{(prices[type as keyof typeof prices] * count).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {type === 'concert' && selectedSection && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Selected Section</h4>
          <div className="flex justify-between">
            <span className="capitalize">{selectedSection.name} Section × {quantity}</span>
            <span>৳{(selectedSection.price * quantity).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Free Show Badge */}
      {isFreeShow && (
        <div className="flex items-center gap-2 p-3 bg-success/20 rounded-lg text-success">
          <Gift className="w-5 h-5" />
          <span className="text-sm font-medium">🎉 This is your FREE 5th show!</span>
        </div>
      )}

      {/* Promo Code */}
      {!isFreeShow && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Promo Code
          </h4>
          {appliedPromo ? (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span className="font-medium">{appliedPromo.code}</span>
                <span className="text-sm text-muted-foreground">
                  (-{appliedPromo.discount}{appliedPromo.type === 'percentage' ? '%' : '৳'})
                </span>
              </div>
              <button onClick={handleRemovePromo} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="flex-1"
              />
              <Button variant="secondary" onClick={handleApplyPromo}>
                Apply
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>৳{subtotal.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Discount</span>
            <span>-৳{discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-gradient-gold">
            {isFreeShow ? 'FREE!' : `৳${total.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Proceed Button */}
      <Button
        variant="gold"
        className="w-full"
        size="lg"
        disabled={!canProceed}
        onClick={onProceed}
      >
        {canProceed 
          ? `Proceed to Payment ${isFreeShow ? '(FREE)' : ''}`
          : type === 'movie' ? 'Select seats to continue' : 'Select a section'
        }
      </Button>
    </div>
  );
};

export default BookingSummary;
