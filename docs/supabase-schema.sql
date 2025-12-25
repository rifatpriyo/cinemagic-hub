-- =============================================
-- CINEMA TICKET BOOKING - COMPLETE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =============================================

-- Step 1: Create the app_role enum type
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'moderator');

-- Step 2: Create the movies table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  poster TEXT NOT NULL,
  backdrop TEXT,
  genre TEXT[] NOT NULL,
  duration INTEGER NOT NULL,
  rating NUMERIC DEFAULT 0,
  release_date DATE NOT NULL,
  description TEXT NOT NULL,
  director TEXT NOT NULL,
  cast_members TEXT[] NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  trailer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 3: Create the concerts table
CREATE TABLE public.concerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  poster TEXT NOT NULL,
  backdrop TEXT,
  genre TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME WITHOUT TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 4: Create the concert_sections table
CREATE TABLE public.concert_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  concert_id UUID NOT NULL REFERENCES public.concerts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  total_capacity INTEGER NOT NULL,
  available_capacity INTEGER NOT NULL
);

-- Step 5: Create the halls table
CREATE TABLE public.halls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  total_seats INTEGER NOT NULL,
  rows INTEGER NOT NULL,
  seats_per_row INTEGER NOT NULL
);

-- Step 6: Create the showtimes table
CREATE TABLE public.showtimes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  hall_id UUID NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME WITHOUT TIME ZONE NOT NULL,
  price_normal NUMERIC NOT NULL,
  price_deluxe NUMERIC NOT NULL,
  price_super NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 7: Create the seats table
CREATE TABLE public.seats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  showtime_id UUID NOT NULL REFERENCES public.showtimes(id) ON DELETE CASCADE,
  row_letter TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available'
);

-- Step 8: Create the profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'User',
  email TEXT NOT NULL,
  phone TEXT,
  monthly_booking_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 9: Create the user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user'
);

-- Step 10: Create the bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  show_id UUID NOT NULL,
  total_price NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  final_price NUMERIC NOT NULL,
  promo_code TEXT,
  quantity INTEGER,
  section_name TEXT,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'confirmed'
);

-- Step 11: Create the booking_seats table
CREATE TABLE public.booking_seats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  seat_id UUID NOT NULL REFERENCES public.seats(id)
);

-- Step 12: Create the promo_codes table
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 13: Create the reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concert_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Movies policies
CREATE POLICY "Movies are publicly viewable" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Admins can manage movies" ON public.movies FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Concerts policies
CREATE POLICY "Concerts are publicly viewable" ON public.concerts FOR SELECT USING (true);
CREATE POLICY "Admins can manage concerts" ON public.concerts FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Concert sections policies
CREATE POLICY "Concert sections are publicly viewable" ON public.concert_sections FOR SELECT USING (true);
CREATE POLICY "Admins can manage concert sections" ON public.concert_sections FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Halls policies
CREATE POLICY "Halls are publicly viewable" ON public.halls FOR SELECT USING (true);
CREATE POLICY "Admins can manage halls" ON public.halls FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Showtimes policies
CREATE POLICY "Showtimes are publicly viewable" ON public.showtimes FOR SELECT USING (true);
CREATE POLICY "Admins can manage showtimes" ON public.showtimes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Seats policies
CREATE POLICY "Seats are publicly viewable" ON public.seats FOR SELECT USING (true);
CREATE POLICY "Admins can manage seats" ON public.seats FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Booking seats policies
CREATE POLICY "Users can view own booking seats" ON public.booking_seats FOR SELECT 
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_seats.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Users can create booking seats" ON public.booking_seats FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_seats.booking_id AND bookings.user_id = auth.uid()));

-- Promo codes policies
CREATE POLICY "Promo codes are publicly viewable" ON public.promo_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Reviews policies
CREATE POLICY "Reviews are publicly viewable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- SAMPLE DATA (Optional - for demonstration)
-- =============================================

-- Insert sample movies
INSERT INTO public.movies (title, poster, genre, duration, rating, release_date, description, director, cast_members, language) VALUES
('The Dark Knight', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', ARRAY['Action', 'Crime', 'Drama'], 152, 9.0, '2008-07-18', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 'Christopher Nolan', ARRAY['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'], 'English'),
('Inception', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg', ARRAY['Action', 'Sci-Fi', 'Thriller'], 148, 8.8, '2010-07-16', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 'Christopher Nolan', ARRAY['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'], 'English'),
('Interstellar', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', ARRAY['Adventure', 'Drama', 'Sci-Fi'], 169, 8.6, '2014-11-07', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.', 'Christopher Nolan', ARRAY['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'], 'English');

-- Insert sample halls
INSERT INTO public.halls (name, type, total_seats, rows, seats_per_row) VALUES
('Hall A - Premium', 'movie', 100, 10, 10),
('Hall B - Standard', 'movie', 80, 8, 10),
('Concert Arena', 'concert', 500, 25, 20);

-- Insert sample promo codes
INSERT INTO public.promo_codes (code, discount, type, is_active) VALUES
('WELCOME10', 10, 'percentage', true),
('FLAT50', 50, 'fixed', true);

-- Insert sample concerts
INSERT INTO public.concerts (title, artist, poster, genre, date, time, description) VALUES
('Summer Music Festival', 'Various Artists', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500', 'Pop', '2025-03-15', '19:00', 'An amazing summer music festival featuring top artists!');
