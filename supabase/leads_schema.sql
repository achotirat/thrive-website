create extension if not exists pgcrypto;

create table if not exists public.leads (
  lead_id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  phone text not null,
  line_id text,
  email text,
  age integer,
  service_interest text,
  preferred_date date,
  message text,
  source_page text,

  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  fbclid text,
  wbraid text,
  gbraid text,

  landing_page text,
  referrer text,
  device_type text,
  user_agent text,
  session_id text,

  consent_at timestamptz,
  consent_version text,

  quiz_id text,
  quiz_result_id text,
  quiz_result_title text,
  quiz_scores jsonb,
  quiz_answers jsonb,
  nurture_segment text,

  status text not null default 'new',
  status_changed_at timestamptz default now(),
  assigned_to text,
  followup_at timestamptz,
  notes text,

  constraint leads_status_check check (
    status in ('new', 'qualified', 'contacted', 'booked', 'visited', 'paid', 'lost', 'spam')
  )
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_phone_idx on public.leads (phone);
create index if not exists leads_campaign_idx on public.leads (utm_source, utm_medium, utm_campaign);
create index if not exists leads_click_ids_idx on public.leads (gclid, fbclid, wbraid, gbraid);

alter table public.leads
add column if not exists status_changed_at timestamptz default now();

alter table public.leads
add column if not exists quiz_id text,
add column if not exists quiz_result_id text,
add column if not exists quiz_result_title text,
add column if not exists quiz_scores jsonb,
add column if not exists quiz_answers jsonb,
add column if not exists nurture_segment text;

create index if not exists leads_quiz_segment_idx
on public.leads (quiz_id, quiz_result_id, nurture_segment);

create table if not exists public.lead_status_history (
  history_id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(lead_id) on delete cascade,
  changed_at timestamptz not null default now(),
  old_status text,
  new_status text not null,
  changed_by text,

  constraint lead_status_history_new_status_check check (
    new_status in ('new', 'qualified', 'contacted', 'booked', 'visited', 'paid', 'lost', 'spam')
  ),
  constraint lead_status_history_old_status_check check (
    old_status is null or old_status in ('new', 'qualified', 'contacted', 'booked', 'visited', 'paid', 'lost', 'spam')
  )
);

create index if not exists lead_status_history_lead_id_idx
on public.lead_status_history (lead_id, changed_at desc);

alter table public.leads enable row level security;
alter table public.lead_status_history enable row level security;

-- No anon policies are created intentionally.
-- Inserts from the public website must go through Netlify Functions using
-- SUPABASE_SERVICE_ROLE_KEY stored only in Netlify environment variables.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();
