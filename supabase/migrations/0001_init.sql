-- Hinkro Platform — initial schema (Phase 0)
-- Run via Supabase SQL editor or `supabase db push`.

-- ============================================================
-- Enums
-- ============================================================
create type user_role as enum ('super_admin', 'admin', 'editor', 'content_manager', 'weaver', 'client');
create type user_status as enum ('active', 'suspended');
create type project_priority as enum ('low', 'normal', 'high', 'urgent');
create type delivery_status as enum ('pending', 'in_transit', 'delivered');
create type payment_status as enum ('unpaid', 'partial', 'paid');
create type update_type as enum (
  'status_change', 'progress', 'note', 'media', 'milestone',
  'pause', 'resume', 'completed', 'question', 'reply'
);
create type media_kind as enum ('image', 'video', 'doc');
create type publish_status as enum ('draft', 'scheduled', 'published');

-- ============================================================
-- Profiles (1:1 with auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  phone text,
  role user_role not null default 'client',
  status user_status not null default 'active',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- auto-create profile on signup; role stays 'client' unless set by admin
create function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- helper: current user's role (bypasses RLS via security definer)
create function current_role_of()
returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create function is_staff_admin()
returns boolean language sql stable as $$
  select current_role_of() in ('super_admin', 'admin');
$$;

create function is_content_staff()
returns boolean language sql stable as $$
  select current_role_of() in ('super_admin', 'admin', 'editor', 'content_manager');
$$;

-- ============================================================
-- Clients (business record; may exist before the person logs in)
-- ============================================================
create table clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) on delete set null,
  name text not null,
  email text,
  phone text,
  country text,
  notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Workflow stages (configurable; seeded below)
-- ============================================================
create table workflow_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into workflow_stages (name, position) values
  ('Order Received', 1), ('Materials Prepared', 2), ('Loom Preparation', 3),
  ('Thread Setup', 4), ('Weaving Started', 5), ('Weaving in Progress', 6),
  ('Design Verification', 7), ('Quality Inspection', 8), ('Finishing', 9),
  ('Packaging', 10), ('Ready for Delivery', 11), ('Completed', 12);

-- ============================================================
-- Projects
-- ============================================================
create sequence project_ref_seq;

create table projects (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique
    default 'HK-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('project_ref_seq')::text, 4, '0'),
  title text not null,
  client_id uuid not null references clients (id),
  weaver_id uuid references profiles (id),
  product_id bigint,
  pattern text,
  measurements jsonb not null default '{}',
  thread_colors text[] not null default '{}',
  accessories jsonb not null default '[]',
  quantity int not null default 1,
  priority project_priority not null default 'normal',
  current_stage_id uuid references workflow_stages (id),
  progress_pct int not null default 0 check (progress_pct between 0 and 100),
  est_start date,
  est_completion date,
  actual_completion date,
  design_notes text,
  delivery_status delivery_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  is_paused boolean not null default false,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger projects_touch before update on projects
  for each row execute function touch_updated_at();

-- helper: is the current user the client on this project?
create function is_project_client(p_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from projects p
    join clients c on c.id = p.client_id
    where p.id = p_project and c.profile_id = auth.uid()
  );
$$;

create function is_project_weaver(p_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from projects where id = p_project and weaver_id = auth.uid());
$$;

-- ============================================================
-- Updates, work logs, media
-- ============================================================
create table project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  author_id uuid not null references profiles (id),
  type update_type not null,
  stage_id uuid references workflow_stages (id),
  progress_pct int check (progress_pct between 0 and 100),
  body text,
  new_est_completion date,
  parent_update_id uuid references project_updates (id),
  created_at timestamptz not null default now()
);

create table work_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  weaver_id uuid not null references profiles (id),
  log_date date not null default current_date,
  hours_worked numeric(5,2),
  progress_made text,
  materials_used text,
  challenges text,
  notes text,
  created_at timestamptz not null default now()
);

create table project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  update_id uuid references project_updates (id) on delete set null,
  work_log_id uuid references work_logs (id) on delete set null,
  storage_path text not null,
  kind media_kind not null default 'image',
  caption text,
  uploaded_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Notifications, push, messages
-- ============================================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects (id) on delete cascade,
  sender_id uuid not null references profiles (id),
  recipient_id uuid references profiles (id),
  audience text check (audience in ('user', 'clients', 'weavers', 'all')),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- fan out notifications when a project update lands
create function notify_on_project_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  proj record;
  client_profile uuid;
  admin_id uuid;
begin
  select p.*, c.profile_id as client_profile_id, c.name as client_name
    into proj
    from projects p join clients c on c.id = p.client_id
    where p.id = new.project_id;

  -- notify the client (if they have logged in at least once)
  client_profile := proj.client_profile_id;
  if client_profile is not null and new.author_id <> client_profile then
    insert into notifications (user_id, type, title, body, data)
    values (client_profile, new.type::text, 'Update on ' || proj.reference,
            coalesce(new.body, 'Your project has a new update.'),
            jsonb_build_object('project_id', new.project_id, 'update_id', new.id));
  end if;

  -- notify the weaver when someone else (client question, admin note) posts
  if proj.weaver_id is not null and new.author_id <> proj.weaver_id then
    insert into notifications (user_id, type, title, body, data)
    values (proj.weaver_id, new.type::text, 'Activity on ' || proj.reference,
            coalesce(new.body, 'New activity on an assigned project.'),
            jsonb_build_object('project_id', new.project_id, 'update_id', new.id));
  end if;

  -- notify admins
  for admin_id in select id from profiles where role in ('super_admin', 'admin') and id <> new.author_id loop
    insert into notifications (user_id, type, title, body, data)
    values (admin_id, new.type::text, proj.reference || ' — ' || new.type::text,
            coalesce(new.body, ''), jsonb_build_object('project_id', new.project_id, 'update_id', new.id));
  end loop;

  return new;
end $$;

create trigger project_update_notify
  after insert on project_updates
  for each row execute function notify_on_project_update();

-- ============================================================
-- Catalog (products, accessories, categories) + blog + media library
-- ============================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  kind text not null check (kind in ('product', 'accessory', 'blog')),
  position int not null default 0,
  image_url text
);

create table products (
  id bigint generated by default as identity primary key,
  slug text not null unique,
  name text not null,
  type text not null default 'simple',
  categories text[] not null default '{}',
  tags text[] not null default '{}',
  colors text[] not null default '{}',
  is_accessory boolean not null default false,
  is_featured boolean not null default false,
  stock_text text not null default 'In stock',
  prices jsonb not null default '{}',
  short_description text,
  description text,
  seo jsonb not null default '{}',
  status publish_status not null default 'published',
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_touch before update on products
  for each row execute function touch_updated_at();

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id bigint not null references products (id) on delete cascade,
  src text not null,
  alt text,
  position int not null default 0,
  role text not null default 'gallery' check (role in ('primary', 'gallery', 'hover'))
);

create table product_variations (
  id uuid primary key default gen_random_uuid(),
  product_id bigint not null references products (id) on delete cascade,
  attributes jsonb not null default '{}',
  prices jsonb not null default '{}'
);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  featured_image text,
  status publish_status not null default 'draft',
  publish_at timestamptz,
  seo jsonb not null default '{}',
  author_id uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger blog_posts_touch before update on blog_posts
  for each row execute function touch_updated_at();

create table media_library (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  kind media_kind not null default 'image',
  title text,
  alt text,
  caption text,
  description text,
  folder text not null default '',
  size_bytes bigint,
  exclude_from_sitemap boolean not null default false,
  uploaded_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Invites + audit log
-- ============================================================
create table project_invites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  client_id uuid not null references clients (id) on delete cascade,
  email text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id),
  action text not null,
  entity_type text not null,
  entity_id text,
  diff jsonb,
  created_at timestamptz not null default now()
);

create function audit_row_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into audit_logs (actor_id, action, entity_type, entity_id, diff)
  values (
    auth.uid(), lower(tg_op), tg_table_name,
    coalesce((case when tg_op = 'DELETE' then old.id::text else new.id::text end), ''),
    case when tg_op = 'UPDATE' then jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
         when tg_op = 'DELETE' then jsonb_build_object('old', to_jsonb(old))
         else jsonb_build_object('new', to_jsonb(new)) end
  );
  return coalesce(new, old);
end $$;

create trigger audit_projects after insert or update or delete on projects
  for each row execute function audit_row_change();
create trigger audit_profiles after update or delete on profiles
  for each row execute function audit_row_change();
create trigger audit_products after insert or update or delete on products
  for each row execute function audit_row_change();

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table profiles enable row level security;
alter table clients enable row level security;
alter table workflow_stages enable row level security;
alter table projects enable row level security;
alter table project_updates enable row level security;
alter table work_logs enable row level security;
alter table project_media enable row level security;
alter table notifications enable row level security;
alter table push_subscriptions enable row level security;
alter table messages enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variations enable row level security;
alter table blog_posts enable row level security;
alter table media_library enable row level security;
alter table project_invites enable row level security;
alter table audit_logs enable row level security;

-- profiles: everyone sees own row; admins see all; only super_admin changes roles (enforced in trigger below)
create policy profiles_self_read on profiles for select using (id = auth.uid() or is_staff_admin());
create policy profiles_self_update on profiles for update using (id = auth.uid() or is_staff_admin());
create policy profiles_admin_insert on profiles for insert with check (is_staff_admin());
create policy profiles_admin_delete on profiles for delete using (current_role_of() = 'super_admin');

create function guard_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and current_role_of() <> 'super_admin' then
    raise exception 'only super administrators can change roles';
  end if;
  if new.status is distinct from old.status and not is_staff_admin() then
    raise exception 'only administrators can change account status';
  end if;
  return new;
end $$;

create trigger profiles_guard_role before update on profiles
  for each row execute function guard_role_change();

-- clients
create policy clients_admin_all on clients for all using (is_staff_admin());
create policy clients_self_read on clients for select using (profile_id = auth.uid());

-- workflow stages: readable by any signed-in user; managed by admins
create policy stages_read on workflow_stages for select using (auth.uid() is not null);
create policy stages_admin_write on workflow_stages for all using (is_staff_admin());

-- projects
create policy projects_admin_all on projects for all using (is_staff_admin());
create policy projects_weaver_read on projects for select using (weaver_id = auth.uid());
create policy projects_weaver_update on projects for update using (weaver_id = auth.uid());
create policy projects_client_read on projects for select using (is_project_client(id));

-- project updates
create policy updates_admin_all on project_updates for all using (is_staff_admin());
create policy updates_weaver_rw on project_updates for select using (is_project_weaver(project_id));
create policy updates_weaver_insert on project_updates for insert
  with check (is_project_weaver(project_id) and author_id = auth.uid());
create policy updates_client_read on project_updates for select using (is_project_client(project_id));
create policy updates_client_question on project_updates for insert
  with check (is_project_client(project_id) and author_id = auth.uid() and type in ('question', 'reply'));

-- work logs
create policy worklogs_admin_all on work_logs for all using (is_staff_admin());
create policy worklogs_weaver_all on work_logs for all
  using (is_project_weaver(project_id) and weaver_id = auth.uid());
create policy worklogs_client_read on work_logs for select using (is_project_client(project_id));

-- project media
create policy media_admin_all on project_media for all using (is_staff_admin());
create policy media_weaver_rw on project_media for select using (is_project_weaver(project_id));
create policy media_weaver_insert on project_media for insert
  with check (is_project_weaver(project_id) and uploaded_by = auth.uid());
create policy media_client_read on project_media for select using (is_project_client(project_id));

-- notifications / push: strictly own rows
create policy notif_own on notifications for select using (user_id = auth.uid());
create policy notif_own_update on notifications for update using (user_id = auth.uid());
create policy push_own on push_subscriptions for all using (user_id = auth.uid());

-- messages
create policy messages_admin_all on messages for all using (is_staff_admin());
create policy messages_own on messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid()
         or (audience = 'all')
         or (audience = 'clients' and current_role_of() = 'client')
         or (audience = 'weavers' and current_role_of() = 'weaver'));
create policy messages_send on messages for insert with check (sender_id = auth.uid());

-- catalog + blog + media library: public read of published; content staff manage
create policy categories_read on categories for select using (true);
create policy categories_write on categories for all using (is_content_staff());
create policy products_read on products for select using (status = 'published' or is_content_staff());
create policy products_write on products for all using (is_content_staff());
create policy product_images_read on product_images for select using (true);
create policy product_images_write on product_images for all using (is_content_staff());
create policy variations_read on product_variations for select using (true);
create policy variations_write on product_variations for all using (is_content_staff());
create policy blog_read on blog_posts for select using (status = 'published' or is_content_staff());
create policy blog_write on blog_posts for all using (is_content_staff());
create policy medialib_read on media_library for select using (auth.uid() is not null);
create policy medialib_write on media_library for all using (is_content_staff());

-- invites + audit: admin only (invite acceptance goes through an edge function with service role)
create policy invites_admin on project_invites for all using (is_staff_admin());
create policy audit_admin_read on audit_logs for select using (is_staff_admin());

-- ============================================================
-- Storage buckets
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('project-media', 'project-media', false),
  ('products', 'products', true),
  ('media-library', 'media-library', true)
on conflict (id) do nothing;

create policy storage_project_media_read on storage.objects for select
  using (bucket_id = 'project-media' and (
    is_staff_admin()
    or is_project_weaver(((string_to_array(name, '/'))[1])::uuid)
    or is_project_client(((string_to_array(name, '/'))[1])::uuid)
  ));
create policy storage_project_media_write on storage.objects for insert
  with check (bucket_id = 'project-media' and (
    is_staff_admin() or is_project_weaver(((string_to_array(name, '/'))[1])::uuid)
  ));
create policy storage_public_read on storage.objects for select
  using (bucket_id in ('products', 'media-library'));
create policy storage_content_write on storage.objects for insert
  with check (bucket_id in ('products', 'media-library') and is_content_staff());
