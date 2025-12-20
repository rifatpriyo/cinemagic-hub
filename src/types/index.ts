export interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  genre: string[];
  duration: number;
  rating: number;
  releaseDate: string;
  description: string;
  director: string;
  cast: string[];
  language: string;
  trailerUrl?: string;
}

export interface Concert {
  id: string;
  title: string;
  artist: string;
  poster: string;
  backdrop?: string;
  genre: string;
  date: string;
  time: string;
  description: string;
  sections: ConcertSection[];
}

export interface ConcertSection {
  id: string;
  name: 'front' | 'middle' | 'back' | 'vip';
  price: number;
  totalCapacity: number;
  availableCapacity: number;
}

export interface Hall {
  id: string;
  name: string;
  type: 'movie' | 'concert';
  totalSeats: number;
  rows: number;
  seatsPerRow: number;
}

export interface Showtime {
  id: string;
  movieId: string;
  hallId: string;
  date: string;
  time: string;
  price: {
    normal: number;
    deluxe: number;
    super: number;
  };
  availableSeats: Seat[];
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'normal' | 'deluxe' | 'super';
  status: 'available' | 'selected' | 'sold';
}

export interface Booking {
  id: string;
  userId: string;
  type: 'movie' | 'concert';
  showId: string;
  seats?: Seat[];
  section?: ConcertSection;
  quantity?: number;
  totalPrice: number;
  promoCode?: string;
  discount: number;
  finalPrice: number;
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'used';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  bookings: Booking[];
  monthlyBookingCount: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  movieId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  isActive: boolean;
}

export interface Ticket {
  id: string;
  booking: Booking;
  movieOrConcert: Movie | Concert;
  hall: Hall;
  showtime: Showtime;
  user: User;
  qrCode: string;
}
