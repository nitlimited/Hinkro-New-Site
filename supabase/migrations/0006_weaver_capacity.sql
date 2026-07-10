-- Phase 3/5 scheduling polish: weaver production capacity and availability.

alter table weaver_profiles
  add column if not exists loom_count int not null default 1 check (loom_count >= 0),
  add column if not exists occupied_looms int not null default 0 check (occupied_looms >= 0),
  add column if not exists avg_weaving_hours_per_day numeric(4,1) check (avg_weaving_hours_per_day >= 0),
  add column if not exists avg_days_per_cloth numeric(5,1) check (avg_days_per_cloth >= 0),
  add column if not exists queue_length int not null default 0 check (queue_length >= 0),
  add column if not exists unavailable_until date,
  add column if not exists availability_note text,
  add column if not exists reliability_score int not null default 70 check (reliability_score between 0 and 100),
  add column if not exists quality_score int not null default 70 check (quality_score between 0 and 100);

create or replace view weaver_public as
  select
    w.profile_id,
    p.full_name,
    w.years_experience,
    w.specialties,
    w.bio,
    w.portrait_url
  from weaver_profiles w
  join profiles p on p.id = w.profile_id
  where p.status = 'active';

grant select on weaver_public to authenticated;
