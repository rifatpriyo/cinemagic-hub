import { Movie, Concert, Hall, Showtime, PromoCode, Seat } from '@/types';

export const movies: Movie[] = [
  {
    id: '1',
    title: 'Pushpa 2: The Rule',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=800&fit=crop',
    genre: ['Action', 'Drama'],
    duration: 179,
    rating: 8.5,
    releaseDate: '2024-12-05',
    description: 'Pushpa Raj continues his rise in the smuggling business while facing new challenges.',
    director: 'Sukumar',
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    language: 'Telugu/Hindi',
  },
  {
    id: '2',
    title: 'Mufasa: The Lion King',
    poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&h=800&fit=crop',
    genre: ['Animation', 'Adventure'],
    duration: 118,
    rating: 7.8,
    releaseDate: '2024-12-20',
    description: 'The origin story of Mufasa, the legendary lion king.',
    director: 'Barry Jenkins',
    cast: ['Aaron Pierre', 'Kelvin Harrison Jr.'],
    language: 'English',
  },
  {
    id: '3',
    title: 'Sonic the Hedgehog 3',
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1920&h=800&fit=crop',
    genre: ['Action', 'Comedy'],
    duration: 110,
    rating: 7.5,
    releaseDate: '2024-12-20',
    description: 'Sonic teams up with Shadow to save the world.',
    director: 'Jeff Fowler',
    cast: ['Ben Schwartz', 'Keanu Reeves'],
    language: 'English',
  },
  {
    id: '4',
    title: 'Kraven the Hunter',
    poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&h=800&fit=crop',
    genre: ['Action', 'Thriller'],
    duration: 127,
    rating: 6.9,
    releaseDate: '2024-12-13',
    description: 'The origin story of Marvel\'s notorious villain.',
    director: 'J.C. Chandor',
    cast: ['Aaron Taylor-Johnson', 'Russell Crowe'],
    language: 'English',
  },
  {
    id: '5',
    title: 'Dhaka Attack',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=800&fit=crop',
    genre: ['Thriller', 'Crime'],
    duration: 145,
    rating: 7.2,
    releaseDate: '2024-12-10',
    description: 'A gripping thriller based on true events in Dhaka.',
    director: 'Dipan Ahmed',
    cast: ['Arifin Shuvoo', 'Mahiya Mahi'],
    language: 'Bengali',
  },
  {
    id: '6',
    title: 'Haunted Mansion',
    poster: 'https://images.unsplash.com/photo-1601513237633-eb181288f0aa?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509248961895-40c6e715c3a6?w=1920&h=800&fit=crop',
    genre: ['Horror', 'Comedy'],
    duration: 123,
    rating: 6.5,
    releaseDate: '2024-12-15',
    description: 'A family encounters supernatural beings in their new home.',
    director: 'Justin Simien',
    cast: ['LaKeith Stanfield', 'Tiffany Haddish'],
    language: 'English',
  },
];

export const concerts: Concert[] = [
  {
    id: 'c1',
    title: 'Arijit Singh Live',
    artist: 'Arijit Singh',
    poster: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&h=800&fit=crop',
    genre: 'Bollywood',
    date: '2024-12-25',
    time: '19:00',
    description: 'Experience the soulful voice of Arijit Singh live in concert.',
    sections: [
      { id: 'vip', name: 'vip', price: 5000, totalCapacity: 100, availableCapacity: 45 },
      { id: 'front', name: 'front', price: 3000, totalCapacity: 200, availableCapacity: 120 },
      { id: 'middle', name: 'middle', price: 2000, totalCapacity: 300, availableCapacity: 180 },
      { id: 'back', name: 'back', price: 1000, totalCapacity: 400, availableCapacity: 350 },
    ],
  },
  {
    id: 'c2',
    title: 'Coke Studio Night',
    artist: 'Various Artists',
    poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920&h=800&fit=crop',
    genre: 'Mixed',
    date: '2024-12-28',
    time: '18:00',
    description: 'A night of magical music from Coke Studio artists.',
    sections: [
      { id: 'vip', name: 'vip', price: 4500, totalCapacity: 100, availableCapacity: 60 },
      { id: 'front', name: 'front', price: 2500, totalCapacity: 200, availableCapacity: 90 },
      { id: 'middle', name: 'middle', price: 1500, totalCapacity: 300, availableCapacity: 200 },
      { id: 'back', name: 'back', price: 800, totalCapacity: 400, availableCapacity: 320 },
    ],
  },
  {
    id: 'c3',
    title: 'Rock Night Bangladesh',
    artist: 'Artcell & Warfaze',
    poster: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1920&h=800&fit=crop',
    genre: 'Rock',
    date: '2025-01-05',
    time: '17:00',
    description: 'The biggest rock bands of Bangladesh on one stage!',
    sections: [
      { id: 'vip', name: 'vip', price: 3500, totalCapacity: 100, availableCapacity: 80 },
      { id: 'front', name: 'front', price: 2000, totalCapacity: 200, availableCapacity: 150 },
      { id: 'middle', name: 'middle', price: 1200, totalCapacity: 300, availableCapacity: 250 },
      { id: 'back', name: 'back', price: 600, totalCapacity: 400, availableCapacity: 380 },
    ],
  },
];

export const halls: Hall[] = [
  { id: 'h1', name: 'Hall 1 - IMAX', type: 'movie', totalSeats: 200, rows: 10, seatsPerRow: 20 },
  { id: 'h2', name: 'Hall 2 - 4DX', type: 'movie', totalSeats: 150, rows: 10, seatsPerRow: 15 },
  { id: 'h3', name: 'Hall 3 - Premium', type: 'movie', totalSeats: 180, rows: 9, seatsPerRow: 20 },
  { id: 'h4', name: 'Hall 4 - Standard', type: 'movie', totalSeats: 200, rows: 10, seatsPerRow: 20 },
  { id: 'h5', name: 'Hall 5 - Standard', type: 'movie', totalSeats: 200, rows: 10, seatsPerRow: 20 },
  { id: 'h6', name: 'Hall 6 - Dolby', type: 'movie', totalSeats: 160, rows: 8, seatsPerRow: 20 },
  { id: 'h7', name: 'Convention Hall', type: 'concert', totalSeats: 1000, rows: 0, seatsPerRow: 0 },
];

const generateSeats = (rows: number, seatsPerRow: number): Seat[] => {
  const seats: Seat[] = [];
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let r = 0; r < rows; r++) {
    for (let s = 1; s <= seatsPerRow; s++) {
      const type: Seat['type'] = r < 2 ? 'super' : r < 4 ? 'deluxe' : 'normal';
      const isSold = Math.random() < 0.3;
      seats.push({
        id: `${rowLabels[r]}${s}`,
        row: rowLabels[r],
        number: s,
        type,
        status: isSold ? 'sold' : 'available',
      });
    }
  }
  return seats;
};

export const showtimes: Showtime[] = [
  {
    id: 'st1',
    movieId: '1',
    hallId: 'h1',
    date: '2024-12-20',
    time: '10:00',
    price: { normal: 350, deluxe: 500, super: 700 },
    availableSeats: generateSeats(10, 20),
  },
  {
    id: 'st2',
    movieId: '1',
    hallId: 'h1',
    date: '2024-12-20',
    time: '14:00',
    price: { normal: 400, deluxe: 550, super: 750 },
    availableSeats: generateSeats(10, 20),
  },
  {
    id: 'st3',
    movieId: '1',
    hallId: 'h2',
    date: '2024-12-20',
    time: '18:00',
    price: { normal: 450, deluxe: 600, super: 800 },
    availableSeats: generateSeats(10, 15),
  },
  {
    id: 'st4',
    movieId: '2',
    hallId: 'h3',
    date: '2024-12-20',
    time: '11:00',
    price: { normal: 350, deluxe: 500, super: 700 },
    availableSeats: generateSeats(9, 20),
  },
  {
    id: 'st5',
    movieId: '2',
    hallId: 'h4',
    date: '2024-12-20',
    time: '15:00',
    price: { normal: 350, deluxe: 500, super: 700 },
    availableSeats: generateSeats(10, 20),
  },
  {
    id: 'st6',
    movieId: '3',
    hallId: 'h5',
    date: '2024-12-20',
    time: '12:00',
    price: { normal: 350, deluxe: 500, super: 700 },
    availableSeats: generateSeats(10, 20),
  },
  {
    id: 'st7',
    movieId: '4',
    hallId: 'h6',
    date: '2024-12-20',
    time: '20:00',
    price: { normal: 400, deluxe: 550, super: 750 },
    availableSeats: generateSeats(8, 20),
  },
];

export const promoCodes: PromoCode[] = [
  { code: 'FIRSTORDER', discount: 10, type: 'percentage', isActive: true },
  { code: 'PRIYORCHOTOBHAI', discount: 90, type: 'percentage', isActive: true },
  { code: 'TIXWIX50', discount: 50, type: 'fixed', isActive: true },
];

export const genres = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Thriller',
  'Animation',
  'Adventure',
  'Crime',
  'Romance',
  'Sci-Fi',
];
