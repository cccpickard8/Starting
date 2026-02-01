-- BookSwap Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type book_condition as enum ('like_new', 'very_good', 'good', 'acceptable');

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  username text unique,
  bio text,
  avatar_url text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Books table
create table public.books (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  google_books_id text,
  title text not null,
  author text not null,
  isbn text,
  cover_url text,
  description text,
  condition book_condition not null,
  notes text,
  available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  from_user_id uuid references public.profiles on delete cascade not null,
  to_user_id uuid references public.profiles on delete cascade not null,
  book_id uuid references public.books on delete set null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Wishlists table (books users want)
create table public.wishlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  google_books_id text,
  title text not null,
  author text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, google_books_id)
);

-- Indexes for performance
create index books_user_id_idx on public.books(user_id);
create index books_available_idx on public.books(available);
create index books_title_idx on public.books using gin(to_tsvector('english', title));
create index books_author_idx on public.books using gin(to_tsvector('english', author));
create index messages_from_user_id_idx on public.messages(from_user_id);
create index messages_to_user_id_idx on public.messages(to_user_id);
create index messages_created_at_idx on public.messages(created_at desc);
create index wishlists_user_id_idx on public.wishlists(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.messages enable row level security;
alter table public.wishlists enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Books policies
create policy "Available books are viewable by everyone"
  on public.books for select
  using (true);

create policy "Users can insert own books"
  on public.books for insert
  with check (auth.uid() = user_id);

create policy "Users can update own books"
  on public.books for update
  using (auth.uid() = user_id);

create policy "Users can delete own books"
  on public.books for delete
  using (auth.uid() = user_id);

-- Messages policies
create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = from_user_id);

create policy "Users can update messages they received (mark as read)"
  on public.messages for update
  using (auth.uid() = to_user_id);

-- Wishlists policies
create policy "Wishlists are viewable by everyone"
  on public.wishlists for select
  using (true);

create policy "Users can insert own wishlist items"
  on public.wishlists for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own wishlist items"
  on public.wishlists for delete
  using (auth.uid() = user_id);

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger on_books_updated
  before update on public.books
  for each row execute procedure public.handle_updated_at();

-- Full-text search function for books
create or replace function search_books(search_query text)
returns setof books as $$
begin
  return query
  select *
  from books
  where available = true
    and (
      to_tsvector('english', title) @@ plainto_tsquery('english', search_query)
      or to_tsvector('english', author) @@ plainto_tsquery('english', search_query)
      or title ilike '%' || search_query || '%'
      or author ilike '%' || search_query || '%'
    )
  order by created_at desc;
end;
$$ language plpgsql;
