-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'User',
  email TEXT NOT NULL,
  phone TEXT,
  monthly_booking_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create movies table
CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  poster TEXT NOT NULL,
  backdrop TEXT,
  genre TEXT[] NOT NULL,
  duration INTEGER NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  release_date DATE NOT NULL,
  description TEXT NOT NULL,
  director TEXT NOT NULL,
  cast_members TEXT[] NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  trailer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create concerts table
CREATE TABLE public.concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  poster TEXT NOT NULL,
  backdrop TEXT,
  genre TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create concert_sections table
CREATE TABLE public.concert_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concert_id UUID REFERENCES public.concerts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (name IN ('front', 'middle', 'back', 'vip')),
  price DECIMAL(10,2) NOT NULL,
  total_capacity INTEGER NOT NULL,
  available_capacity INTEGER NOT NULL
);

-- Create halls table
CREATE TABLE public.halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('movie', 'concert')),
  total_seats INTEGER NOT NULL,
  rows INTEGER NOT NULL,
  seats_per_row INTEGER NOT NULL
);

-- Create showtimes table
CREATE TABLE public.showtimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
  hall_id UUID REFERENCES public.halls(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  price_normal DECIMAL(10,2) NOT NULL,
  price_deluxe DECIMAL(10,2) NOT NULL,
  price_super DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seats table
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  showtime_id UUID REFERENCES public.showtimes(id) ON DELETE CASCADE NOT NULL,
  row_letter TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('normal', 'deluxe', 'super')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'selected', 'sold')),
  UNIQUE (showtime_id, row_letter, seat_number)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('movie', 'concert')),
  show_id UUID NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  promo_code TEXT,
  discount DECIMAL(10,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'used')),
  section_name TEXT,
  quantity INTEGER
);

-- Create booking_seats table for movie seat bookings
CREATE TABLE public.booking_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  seat_id UUID REFERENCES public.seats(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (booking_id, seat_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, movie_id)
);

-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concert_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Create has_role function for admin checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
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

-- Public read policies for movies, concerts, halls, showtimes (anyone can view)
CREATE POLICY "Movies are publicly viewable" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Concerts are publicly viewable" ON public.concerts FOR SELECT USING (true);
CREATE POLICY "Concert sections are publicly viewable" ON public.concert_sections FOR SELECT USING (true);
CREATE POLICY "Halls are publicly viewable" ON public.halls FOR SELECT USING (true);
CREATE POLICY "Showtimes are publicly viewable" ON public.showtimes FOR SELECT USING (true);
CREATE POLICY "Seats are publicly viewable" ON public.seats FOR SELECT USING (true);
CREATE POLICY "Promo codes are publicly viewable" ON public.promo_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Reviews are publicly viewable" ON public.reviews FOR SELECT USING (true);

-- Profile policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Booking policies
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Booking seats policies
CREATE POLICY "Users can view own booking seats" ON public.booking_seats FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid()));
CREATE POLICY "Users can create booking seats" ON public.booking_seats FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid()));

-- Review policies
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Admin policies for content management
CREATE POLICY "Admins can manage movies" ON public.movies FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage concerts" ON public.concerts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage concert sections" ON public.concert_sections FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage halls" ON public.halls FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage showtimes" ON public.showtimes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage seats" ON public.seats FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_concerts_updated_at BEFORE UPDATE ON public.concerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();