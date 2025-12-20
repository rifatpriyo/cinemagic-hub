import React from 'react';
import { Seat } from '@/types';
import { cn } from '@/lib/utils';

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  rows: number;
  seatsPerRow: number;
}

const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeats,
  onSeatSelect,
  rows,
  seatsPerRow,
}) => {
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const getSeatStatus = (seat: Seat) => {
    if (seat.status === 'sold') return 'sold';
    if (selectedSeats.find(s => s.id === seat.id)) return 'selected';
    return 'available';
  };

  const getSeatClasses = (seat: Seat) => {
    const status = getSeatStatus(seat);
    const baseClasses = 'w-6 h-6 md:w-7 md:h-7 rounded-t-lg text-[10px] font-medium flex items-center justify-center transition-all duration-200 cursor-pointer';
    
    if (status === 'sold') {
      return cn(baseClasses, 'bg-seat-sold text-muted-foreground/50 cursor-not-allowed');
    }
    
    if (status === 'selected') {
      return cn(baseClasses, 'bg-seat-selected text-primary-foreground scale-110 shadow-lg shadow-primary/30');
    }
    
    // Available seats by type
    if (seat.type === 'super') {
      return cn(baseClasses, 'bg-seat-super/80 hover:bg-seat-super text-white hover:scale-110');
    }
    if (seat.type === 'deluxe') {
      return cn(baseClasses, 'bg-seat-deluxe/80 hover:bg-seat-deluxe text-white hover:scale-110');
    }
    return cn(baseClasses, 'bg-seat-available hover:bg-primary/60 text-foreground hover:scale-110');
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'sold') return;
    onSeatSelect(seat);
  };

  // Group seats by row
  const seatsByRow: { [key: string]: Seat[] } = {};
  seats.forEach(seat => {
    if (!seatsByRow[seat.row]) {
      seatsByRow[seat.row] = [];
    }
    seatsByRow[seat.row].push(seat);
  });

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="relative mx-auto max-w-md">
        <div className="h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
        <div className="text-center text-sm text-muted-foreground mt-2">SCREEN THIS WAY</div>
      </div>

      {/* Seat Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-lg bg-seat-available" />
          <span className="text-muted-foreground">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-lg bg-seat-deluxe" />
          <span className="text-muted-foreground">Deluxe</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-lg bg-seat-super" />
          <span className="text-muted-foreground">Super</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-lg bg-seat-sold" />
          <span className="text-muted-foreground">Sold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-lg bg-seat-selected" />
          <span className="text-muted-foreground">Selected</span>
        </div>
      </div>

      {/* Seats Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-block min-w-full">
          <div className="flex flex-col items-center gap-2">
            {Object.entries(seatsByRow).map(([rowLabel, rowSeats]) => (
              <div key={rowLabel} className="flex items-center gap-1.5">
                <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                  {rowLabel}
                </span>
                <div className="flex gap-1">
                  {rowSeats.map((seat, index) => (
                    <React.Fragment key={seat.id}>
                      {/* Aisle gap in the middle */}
                      {index === Math.floor(seatsPerRow / 2) && (
                        <div className="w-4" />
                      )}
                      <button
                        className={getSeatClasses(seat)}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === 'sold'}
                        title={`${seat.row}${seat.number} - ${seat.type}`}
                      >
                        {seat.number}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
                <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                  {rowLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
