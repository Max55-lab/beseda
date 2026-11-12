-- Beseda backend — initial schema, search, RLS.
-- Run with: supabase db push  (or psql -f this file)

create extension if not exists "uuid-ossp";
create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.dialects (
  id          text primary key,
  name        text not null,
  color       text not null,
  description text
);

create table if not exists public.places (
  id          text primary key,
  name        text not null,
  region      text not null,
  dialect_id  text not null references public.dialects(id),
  lat         double precision not null,
  lng         double precision not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role         text not null default 'user'
               check (role in ('user','contributor','moderator','admin')),
  bio          text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.words (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  place_id        text not null references public.places(id) on delete cascade,
  word            text not null,
  pronunciation   text,
  part_of_speech  text,
  meaning         text not null,
  example         text,
  translation     text,
  english_meaning text,
  theme           text not null,
  source          text,
  status          text not null default 'pending'
                  check (status in ('draft','pending','published','rejected','archived')),
  contributor_id  uuid references public.profiles(id),
  reviewer_id     uuid references public.profiles(id),
  reviewed_at     timestamptz,
  review_note     text,
  audio_id        uuid,
  search_vector   tsvector,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.phrases (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  phrase         text not null,
  meaning        text not null,
  example        text,
  theme          text,
  source         text,
  status         text not null default 'published'
                 check (status in ('draft','pending','published','rejected','archived')),
  contributor_id uuid references public.profiles(id),
  reviewer_id    uuid references public.profiles(id),
  reviewed_at    timestamptz,
  review_note    text,
  audio_id       uuid,
  search_vector  tsvector,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.dictionary_entries (
  id             uuid primary key default gen_random_uuid(),
  english        text not null,
  croatian       text not null,
  frequency_rank int,
  source         text not null default 'igaly-rjecnik',
  status         text not null default 'published'
                 check (status in ('published','hidden')),
  search_vector  tsvector,
  created_at     timestamptz not null default now()
);

create table if not exists public.collections (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collection_words (
  collection_id uuid not null references public.collections(id) on delete cascade,
  word_id       uuid not null references public.words(id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (collection_id, word_id)
);

create table if not exists public.audio_assets (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null,
  mime_type     text not null,
  duration_ms   int,
  speaker_place text,
  recorded_by   uuid references public.profiles(id),
  recorded_at   timestamptz,
  license       text not null default 'CC-BY-4.0',
  status        text not null default 'pending'
                check (status in ('pending','approved','rejected')),
  created_at    timestamptz not null default now()
);

alter table public.words
  add constraint words_audio_fk foreign key (audio_id) references public.audio_assets(id) on delete set null;
alter table public.phrases
  add constraint phrases_audio_fk foreign key (audio_id) references public.audio_assets(id) on delete set null;

create table if not exists public.audit_events (
  id          bigserial primary key,
  actor_id    uuid references public.profiles(id),
  entity_type text not null,
  entity_id   text not null,
  action      text not null,
  diff        jsonb,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists words_place_idx     on public.words(place_id);
create index if not exists words_status_idx    on public.words(status);
create index if not exists words_theme_idx     on public.words(theme);
create index if not exists words_search_gin    on public.words using gin (search_vector);
create index if not exists phrases_search_gin  on public.phrases using gin (search_vector);
create index if not exists dict_search_gin     on public.dictionary_entries using gin (search_vector);
create index if not exists dict_english_trgm  on public.dictionary_entries using gin (english gin_trgm_ops);
create index if not exists dict_croatian_trgm on public.dictionary_entries using gin (croatian gin_trgm_ops);
create index if not exists audio_status_idx    on public.audio_assets(status);

-- ============================================================
-- Search vectors
-- ============================================================

create or replace function public.words_search_trigger() returns trigger
language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(new.word,''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.meaning,''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.example,''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.translation,''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.english_meaning,''))), 'D');
  new.updated_at := now();
  return new;
end $$;

create trigger words_search before insert or update on public.words
  for each row execute function public.words_search_trigger();

create or replace function public.phrases_search_trigger() returns trigger
language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(new.phrase,''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.meaning,''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.example,''))), 'C');
  new.updated_at := now();
  return new;
end $$;

create trigger phrases_search before insert or update on public.phrases
  for each row execute function public.phrases_search_trigger();

create or replace function public.dictionary_search_trigger() returns trigger
language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(new.english,''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.croatian,''))), 'B');
  return new;
end $$;

create trigger dictionary_search before insert or update on public.dictionary_entries
  for each row execute function public.dictionary_search_trigger();

-- ============================================================
-- updated_at triggers
-- ============================================================

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create trigger places_touch before update on public.places
  for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger collections_touch before update on public.collections
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Auto-create profile on signup
-- ============================================================

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Role helper
-- ============================================================

create or replace function public.current_role() returns text
language sql stable security definer as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'anon');
$$;

-- ============================================================
-- RLS
-- ============================================================

alter table public.dialects            enable row level security;
alter table public.places             enable row level security;
alter table public.profiles           enable row level security;
alter table public.words              enable row level security;
alter table public.phrases            enable row level security;
alter table public.dictionary_entries enable row level security;
alter table public.collections        enable row level security;
alter table public.collection_words   enable row level security;
alter table public.audio_assets       enable row level security;
alter table public.audit_events       enable row level security;

-- dialects & places: public read
create policy "dialects_read_all"  on public.dialects for select using (true);
create policy "places_read_all"    on public.places   for select using (true);
create policy "dialects_write_mod" on public.dialects for all
  using (public.current_role() in ('moderator','admin'))
  with check (public.current_role() in ('moderator','admin'));
create policy "places_write_mod"  on public.places   for all
  using (public.current_role() in ('moderator','admin'))
  with check (public.current_role() in ('moderator','admin'));

-- profiles: public read, self update
create policy "profiles_read_all"   on public.profiles for select using (true);
create policy "profiles_update_self" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_update_mod"  on public.profiles for update
  using (public.current_role() in ('moderator','admin'))
  with check (public.current_role() in ('moderator','admin'));

-- words
create policy "words_read_published" on public.words for select using (status = 'published');
create policy "words_read_own"       on public.words for select
  using (auth.uid() is not null and contributor_id = auth.uid());
create policy "words_read_mod"       on public.words for select
  using (public.current_role() in ('moderator','admin'));
create policy "words_insert_auth"    on public.words for insert
  with check (auth.uid() is not null and contributor_id = auth.uid()
              and status in ('draft','pending'));
create policy "words_update_owner"   on public.words for update
  using (contributor_id = auth.uid() and status in ('draft','pending','rejected'))
  with check (contributor_id = auth.uid() and status in ('draft','pending','rejected'));
create policy "words_update_mod"     on public.words for update
  using (public.current_role() in ('moderator','admin'))
  with check (public.current_role() in ('moderator','admin'));
create policy "words_delete_owner"   on public.words for delete
  using (contributor_id = auth.uid() and status in ('draft','pending','rejected'));
create policy "words_delete_admin"    on public.words for delete
  using (public.current_role() = 'admin');

-- phrases
create policy "phrases_read_published" on public.phrases for select using (status = 'published');
create policy "phrases_read_own"       on public.phrases for select
  using (auth.uid() is not null and contributor_id = auth.uid());
create policy "phrases_read_mod"       on public.phrases for select
  using (public.current_role() in ('moderator','admin'));
create policy "phrases_insert_auth"    on public.phrases for insert
  with check (auth.uid() is not null and contributor_id = auth.uid()
              and status in ('draft','pending'));
create policy "phrases_update_owner"   on public.phrases for update
  using (contributor_id = auth.uid() and status in ('draft','pending','rejected'))
  with check (contributor_id = auth.uid() and status in ('draft','pending','rejected'));
create policy "phrases_update_mod"     on public.phrases for update
  using (public.current_role() in ('moderator','admin'))
  with check (public.current_role() in ('moderator','admin'));
create policy "phrases_delete_owner"   on public.phrases for delete
  using (contributor_id = auth.uid() and status in ('draft','pending','rejected'));
create policy "phrases_delete_admin"   on public.phrases for delete
  using (public.current_role() = 'admin');

-- dictionary_entries: public read published; mod write
create policy "dict_read_all" on public.dictionary_entries for select using (status = 'published');
create policy "dict_write_mod" on public.dictionary_entries for all
  using (public.current_role() in ('moderator','admin'))
  with check (public.current_role() in ('moderator','admin'));

-- collections: owner only
create policy "collections_owner_all" on public.collections for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "collections_read_mod"  on public.collections for select
  using (public.current_role() in ('moderator','admin'));

-- collection_words: owner of parent collection
create policy "cw_owner_all" on public.collection_words for all
  using (exists (select 1 from public.collections c
                 where c.id = collection_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.collections c
                      where c.id = collection_id and c.owner_id = auth.uid()));

-- audio_assets
create policy "audio_read_approved" on public.audio_assets for select using (status = 'approved');
create policy "audio_read_own"      on public.audio_assets for select
  using (auth.uid() is not null and recorded_by = auth.uid());
create policy "audio_read_mod"     on public.audio_assets for select
  using (public.current_role() in ('moderator','admin'));
create policy "audio_insert_auth"   on public.audio_assets for insert
  with check (auth.uid() is not null and recorded_by = auth.uid()
              and status in ('pending'));
create policy "audio_update_mod"    on public.audio_assets for update
  using (public.current_role() in ('moderator','admin'))
  with check (public.current_role() in ('moderator','admin'));
create policy "audio_delete_owner"  on public.audio_assets for delete
  using (recorded_by = auth.uid() and status in ('pending','rejected'));
create policy "audio_delete_admin"  on public.audio_assets for delete
  using (public.current_role() = 'admin');

-- audit_events: mod/admin read; insert via service role only (no policy = deny for clients)
create policy "audit_read_mod" on public.audit_events for select
  using (public.current_role() in ('moderator','admin'));
