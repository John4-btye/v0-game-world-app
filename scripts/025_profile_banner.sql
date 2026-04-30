-- Add profile banner customization fields

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banner_preset text DEFAULT 'aurora';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banner_url text;

