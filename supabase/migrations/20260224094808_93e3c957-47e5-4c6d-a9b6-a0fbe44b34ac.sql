
-- Create football_matches table
CREATE TABLE public.football_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_logo TEXT NOT NULL,
  away_logo TEXT NOT NULL,
  stadium TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  league TEXT NOT NULL DEFAULT 'MLS',
  poster TEXT NOT NULL,
  backdrop TEXT,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create football_sections table for stadium sections
CREATE TABLE public.football_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.football_matches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  total_capacity INTEGER NOT NULL,
  available_capacity INTEGER NOT NULL,
  color TEXT NOT NULL DEFAULT '#22c55e'
);

-- Enable RLS
ALTER TABLE public.football_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_sections ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Football matches are publicly viewable" ON public.football_matches FOR SELECT USING (true);
CREATE POLICY "Admins can manage football matches" ON public.football_matches FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Football sections are publicly viewable" ON public.football_sections FOR SELECT USING (true);
CREATE POLICY "Admins can manage football sections" ON public.football_sections FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
