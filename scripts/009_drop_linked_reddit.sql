-- Remove the linked_reddit column from profiles (Reddit provider dropped)
alter table public.profiles drop column if exists linked_reddit;
