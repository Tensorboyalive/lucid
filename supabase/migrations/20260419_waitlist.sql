-- lucid. waitlist signups. 2026-04-19
-- A dead-simple funnel: email + optional source + timestamp.
-- Source captures WHERE the signup came from ("waitlist-page", "landing-hero",
-- or any custom referrer the user pastes the link on) so we can see which
-- channels actually drive signups before we bother with a proper attribution
-- stack.

set statement_timeout to '30s';

-- -----------------------------------------------------------------------------
-- waitlist_signups
-- Email is stored case-preserved but uniqueness is enforced case-insensitively
-- via a functional index on lower(email). This avoids needing the citext
-- extension and still blocks "A@x.com" + "a@x.com" duplicates.
-- -----------------------------------------------------------------------------
create table if not exists waitlist_signups (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      text,                    -- "waitlist-page", "landing-hero", etc.
  referrer    text,                    -- document.referrer at signup time
  user_agent  text,                    -- truncated (256 chars); abuse forensics only
  ip_hash     text,                    -- sha256(ip + daily-salt); opaque to us
  created_at  timestamptz not null default now()
);

create unique index if not exists waitlist_signups_email_lower_uidx
  on waitlist_signups (lower(email));

create index if not exists waitlist_signups_created_idx
  on waitlist_signups (created_at desc);

create index if not exists waitlist_signups_source_idx
  on waitlist_signups (source);

-- -----------------------------------------------------------------------------
-- row level security
-- Anon can INSERT but NOT SELECT. This is deliberate: we want the API's
-- anon-keyed client to record a signup from a browser form, but we do NOT
-- want anyone to scrape the waitlist through the public key. Listing the
-- waitlist is a service-role-only operation going forward.
-- -----------------------------------------------------------------------------
alter table waitlist_signups enable row level security;

create policy "waitlist anon insert"
  on waitlist_signups
  for insert
  with check (true);

-- No anon select policy is created on purpose. Without a SELECT policy,
-- RLS blocks all reads from the anon key, which is what we want.
