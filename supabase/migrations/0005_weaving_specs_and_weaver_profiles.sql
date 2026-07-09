-- Phase 5: detailed weaving briefs, client approval gates, weaver profiles

-- ============================================================
-- New update types for the approval workflow
-- ============================================================
alter type update_type add value if not exists 'approval_request';
alter type update_type add value if not exists 'approval_granted';

-- ============================================================
-- Project: weaving spec + client approval gates
-- ============================================================
alter table projects
  add column if not exists spec jsonb not null default '{}',
  add column if not exists approvals jsonb not null default
    '{"thread":"pending","thread_at":null,"pattern":"pending","pattern_at":null}';

-- spec shape (jsonb):
--   design_yards, plain_yards (numbers; total = design + plain)
--   gender ('man'|'woman'), garment_type ('3_pieces'|'dansikran')
--   has_border, has_shimmers, is_ombre, has_embroidery (bool)
--   thread_type ('silk'|'rayon')
--   ombre_colors: [{ color, percentage }]

-- ============================================================
-- Attachment purpose: progress photos vs assignment references
-- ============================================================
alter table project_media
  add column if not exists purpose text not null default 'progress'
    check (purpose in ('progress', 'inspiration', 'embroidery_symbol'));

-- Clients need to see inspiration + embroidery references before work starts,
-- which the existing project_media RLS (client can read their project's media)
-- already covers.

-- ============================================================
-- Embroidery stage (only surfaced per-project when the brief needs it)
-- ============================================================
do $$
begin
  if not exists (select 1 from workflow_stages where lower(name) = 'embroidery') then
    update workflow_stages set position = position + 1 where position >= 9;
    insert into workflow_stages (name, position) values ('Embroidery', 9);
  end if;
end $$;

-- ============================================================
-- Weaver profiles
-- ============================================================
create table if not exists weaver_profiles (
  profile_id uuid primary key references profiles (id) on delete cascade,
  years_experience int,
  specialties text[] not null default '{}',
  bio text,
  portrait_url text,
  hometown text,
  languages text[] not null default '{}',
  -- admin-only fields:
  address text,
  id_number text,
  emergency_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger weaver_profiles_touch before update on weaver_profiles
  for each row execute function touch_updated_at();

alter table weaver_profiles enable row level security;

-- Weavers see/manage their own row; admins manage all.
create policy weaver_profiles_self on weaver_profiles for select
  using (profile_id = auth.uid() or is_staff_admin());
create policy weaver_profiles_self_update on weaver_profiles for update
  using (profile_id = auth.uid() or is_staff_admin());
create policy weaver_profiles_admin_write on weaver_profiles for insert
  with check (is_staff_admin());
create policy weaver_profiles_admin_delete on weaver_profiles for delete
  using (is_staff_admin());

-- Client-safe public view: only the fields clients may see. No address,
-- phone, ID number, or emergency contact. Readable by any signed-in user.
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
