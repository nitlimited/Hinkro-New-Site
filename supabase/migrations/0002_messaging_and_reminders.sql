-- Phase 2: message fan-out + deadline reminders

-- ============================================================
-- Fan messages out to notifications
-- ============================================================
create function notify_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target uuid;
begin
  if new.audience = 'user' and new.recipient_id is not null then
    insert into notifications (user_id, type, title, body, data)
    values (new.recipient_id, 'message', 'New message from Hinkro Kente',
            left(new.body, 180), jsonb_build_object('message_id', new.id, 'project_id', new.project_id));
  else
    for target in
      select id from profiles
      where status = 'active'
        and id <> new.sender_id
        and (
          (new.audience = 'all') or
          (new.audience = 'clients' and role = 'client') or
          (new.audience = 'weavers' and role = 'weaver')
        )
    loop
      insert into notifications (user_id, type, title, body, data)
      values (target, 'message', 'Announcement from Hinkro Kente',
              left(new.body, 180), jsonb_build_object('message_id', new.id));
    end loop;
  end if;
  return new;
end $$;

create trigger message_notify
  after insert on messages
  for each row execute function notify_on_message();

-- ============================================================
-- Deadline reminders (projects due within 3 days, not completed)
-- Runs daily. Requires the pg_cron extension (enabled by default on
-- Supabase; if unavailable, call remind_upcoming_deadlines() manually
-- or from a scheduled edge function.)
-- ============================================================
create function remind_upcoming_deadlines()
returns void language plpgsql security definer set search_path = public as $$
declare
  proj record;
  admin_id uuid;
begin
  for proj in
    select p.*, c.profile_id as client_profile
    from projects p join clients c on c.id = p.client_id
    where p.actual_completion is null
      and p.is_paused = false
      and p.est_completion is not null
      and p.est_completion between current_date and current_date + 3
      -- avoid duplicate reminders on the same day
      and not exists (
        select 1 from notifications n
        where n.type = 'deadline'
          and (n.data ->> 'project_id')::uuid = p.id
          and n.created_at::date = current_date
      )
  loop
    if proj.weaver_id is not null then
      insert into notifications (user_id, type, title, body, data)
      values (proj.weaver_id, 'deadline',
              proj.reference || ' is due ' || to_char(proj.est_completion, 'DD Mon'),
              'Estimated completion is approaching. Update the project or adjust the date.',
              jsonb_build_object('project_id', proj.id));
    end if;
    for admin_id in select id from profiles where role in ('super_admin','admin') loop
      insert into notifications (user_id, type, title, body, data)
      values (admin_id, 'deadline',
              proj.reference || ' is due ' || to_char(proj.est_completion, 'DD Mon'),
              'Deadline approaching for ' || proj.title || '.',
              jsonb_build_object('project_id', proj.id));
    end loop;
  end loop;
end $$;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'hinkro-deadline-reminders',
      '0 6 * * *',
      $cron$ select remind_upcoming_deadlines(); $cron$
    );
  end if;
end $$;
