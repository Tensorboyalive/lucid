-- lucid. initial schema. 2026-04-18
-- Six tables. Every surface of the product has a first-class persistence layer.
-- Row Level Security is enabled on every table. Demo policies allow anonymous
-- reads and writes; lock these down before production.

set statement_timeout to '30s';

-- -----------------------------------------------------------------------------
-- creators
-- A normalized record for every Instagram handle we have ever researched.
-- Lets the product rebuild a profile without re-scraping.
-- -----------------------------------------------------------------------------
create table if not exists creators (
  id            uuid primary key default gen_random_uuid(),
  handle        text not null unique,
  display_name  text,
  followers     text,
  avg_score     numeric(3, 1),
  last_scraped  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists creators_handle_idx on creators (handle);

-- -----------------------------------------------------------------------------
-- reels
-- Each reel we have ingested for a creator. Caption, metrics, hook type, a
-- duration, and the Alpha engine's neuro score if available.
-- -----------------------------------------------------------------------------
create table if not exists reels (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null references creators (id) on delete cascade,
  external_id     text,                                   -- Instagram short code
  post_url        text,
  caption         text,
  thumbnail_url   text,
  views           text,
  hook_type       text,
  duration_sec    integer,
  score_estimate  numeric(3, 1),
  scored_at       timestamptz,
  neuro_scores    jsonb,                                  -- {reward, emotion, attention, memory, overall}
  scenes          jsonb,                                  -- Scene[] from the Beta engine
  created_at      timestamptz not null default now()
);

create index if not exists reels_creator_idx on reels (creator_id);
create index if not exists reels_external_id_idx on reels (external_id);
create index if not exists reels_score_idx on reels (score_estimate desc);

-- -----------------------------------------------------------------------------
-- patterns
-- Gamma engine pattern analysis per creator. Accumulated across runs so we can
-- track how a creator's viral formula shifts over time.
-- -----------------------------------------------------------------------------
create table if not exists patterns (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references creators (id) on delete cascade,
  title       text not null,
  body        text not null,
  rank        integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists patterns_creator_rank_idx on patterns (creator_id, rank);

-- -----------------------------------------------------------------------------
-- scores
-- Every individual scoring run a user has triggered. Lets the product show
-- "your last 10 reels" and compute improvement over time.
-- -----------------------------------------------------------------------------
create table if not exists scores (
  id             uuid primary key default gen_random_uuid(),
  source_url     text,
  source_kind    text not null check (source_kind in ('instagram_url', 'upload', 'demo')),
  duration_ms    integer,
  overall        numeric(3, 1) not null,
  reward         numeric(3, 1) not null,
  emotion        numeric(3, 1) not null,
  attention      numeric(3, 1) not null,
  memory         numeric(3, 1) not null,
  verdict        text,
  scenes         jsonb,
  weaknesses     jsonb,
  top_moment     jsonb,
  bottom_moment  jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists scores_created_idx on scores (created_at desc);
create index if not exists scores_overall_idx on scores (overall desc);

-- -----------------------------------------------------------------------------
-- rewrites
-- Every rewrite plan Gamma has produced. Linked back to a score if the rewrite
-- was triggered from a prior scoring session.
-- -----------------------------------------------------------------------------
create table if not exists rewrites (
  id                     uuid primary key default gen_random_uuid(),
  score_id               uuid references scores (id) on delete set null,
  draft                  text not null,
  reference              text,
  target_duration_sec    integer not null,
  predicted_score        numeric(3, 1) not null,
  predicted_lift         numeric(3, 1) not null,
  summary                text,
  shots                  jsonb not null,
  research_context       jsonb,
  created_at             timestamptz not null default now()
);

create index if not exists rewrites_score_idx on rewrites (score_id);
create index if not exists rewrites_created_idx on rewrites (created_at desc);

-- -----------------------------------------------------------------------------
-- rewrite_turns
-- Conversation log between the user and the Gamma engine while refining a
-- rewrite. Lets us replay a session or train a better system prompt later.
-- -----------------------------------------------------------------------------
create table if not exists rewrite_turns (
  id          uuid primary key default gen_random_uuid(),
  rewrite_id  uuid not null references rewrites (id) on delete cascade,
  role        text not null check (role in ('user', 'gamma')),
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists rewrite_turns_rewrite_idx on rewrite_turns (rewrite_id, created_at);

-- -----------------------------------------------------------------------------
-- row level security
-- The demo allows anonymous reads and inserts. Before shipping to production,
-- replace these policies with auth-aware versions keyed off auth.uid().
-- -----------------------------------------------------------------------------
alter table creators      enable row level security;
alter table reels         enable row level security;
alter table patterns      enable row level security;
alter table scores        enable row level security;
alter table rewrites      enable row level security;
alter table rewrite_turns enable row level security;

create policy "demo read creators"       on creators      for select using (true);
create policy "demo write creators"      on creators      for insert with check (true);
create policy "demo update creators"     on creators      for update using (true);

create policy "demo read reels"          on reels         for select using (true);
create policy "demo write reels"         on reels         for insert with check (true);

create policy "demo read patterns"       on patterns      for select using (true);
create policy "demo write patterns"      on patterns      for insert with check (true);

create policy "demo read scores"         on scores        for select using (true);
create policy "demo write scores"        on scores        for insert with check (true);

create policy "demo read rewrites"       on rewrites      for select using (true);
create policy "demo write rewrites"      on rewrites      for insert with check (true);

create policy "demo read rewrite_turns"  on rewrite_turns for select using (true);
create policy "demo write rewrite_turns" on rewrite_turns for insert with check (true);

-- -----------------------------------------------------------------------------
-- seed
-- Four creator profiles to make the demo land on first load. The Alpha engine
-- ran on April 11 against these, so these numbers are receipts.
-- -----------------------------------------------------------------------------
insert into creators (handle, display_name, followers, avg_score)
values
  ('@mrbeast',          'Jimmy Donaldson',    '74.8M', 8.6),
  ('@zachking',         'Zach King',          '32.1M', 8.2),
  ('@brittany.broski',  'Brittany Broski',    '6.4M',  7.9),
  ('@tensorboy',        'Manav Gupta',        '260K',  8.4)
on conflict (handle) do nothing;
