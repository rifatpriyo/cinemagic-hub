import React from 'react';
import { Seat, ConcertSection } from '@/types';
import { QrCode, Download, Calendar, Clock, MapPin, User, Film, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TicketReceiptProps {
  type: 'movie' | 'concert';
  title: string;
  hallName: string;
  date: string;
  time: string;
  seats?: Seat[];
  section?: ConcertSection;
  quantity?: number;
  userName: string;
  bookingId: string;
  totalPrice: number;
  isFree?: boolean;
  onClose: () => void;
}

const TicketReceipt: React.FC<TicketReceiptProps> = ({
  type,
  title,
  hallName,
  date,
  time,
  seats,
  section,
  quantity,
  userName,
  bookingId,
  totalPrice,
  isFree,
  onClose,
}) => {
  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-gold-dark p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {type === 'movie' ? (
              <Film className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Music className="w-6 h-6 text-primary-foreground" />
            )}
            <span className="text-xl font-bold text-primary-foreground">TixWix</span>
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground">{title}</h2>
          <p className="text-primary-foreground/80 mt-1">E-Ticket Confirmation</p>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="w-40 h-40 bg-foreground rounded-xl flex items-center justify-center">
              <QrCode className="w-32 h-32 text-background" />
            </div>
          </div>

          {/* Booking ID */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Booking ID</p>
            <p className="font-mono font-bold text-lg">{bookingId}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{formatDate(date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-medium">{time}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="text-sm font-medium">{hallName}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{userName}</p>
              </div>
            </div>
          </div>

          {/* Seats/Section */}
          <div className="border-t border-dashed border-border pt-4">
            {type === 'movie' && seats && seats.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Seats</p>
                <div className="flex flex-wrap gap-2">
                  {seats.map(seat => (
                    <span
                      key={seat.id}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-semibold"
                    >
                      {seat.row}{seat.number}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {type === 'concert' && section && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-semibold capitalize">{section.name} Section</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-semibold">{quantity} {quantity === 1 ? 'ticket' : 'tickets'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="border-t border-border pt-4 flex justify-between items-center">
            <span className="font-medium">Total Paid</span>
            <span className="text-2xl font-bold text-gradient-gold">
              {isFree ? 'FREE' : `৳${totalPrice.toLocaleString()}`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button variant="gold" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Instructions */}
          <p className="text-xs text-center text-muted-foreground">
            Please show this QR code at the entrance to the hall.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketReceipt;
