update public.projects as project
set approvals = jsonb_build_object(
  'thread', 'pending',
  'thread_at', null,
  'pattern', 'pending',
  'pattern_at', null
)
where exists (
  select 1
  from public.project_updates as project_update
  join public.profiles as author on author.id = project_update.author_id
  where project_update.project_id = project.id
    and project_update.type = 'approval_granted'
    and author.role in ('super_admin', 'admin')
)
and not exists (
  select 1
  from public.project_updates as project_update
  join public.profiles as author on author.id = project_update.author_id
  where project_update.project_id = project.id
    and project_update.type = 'approval_granted'
    and author.role = 'client'
);

insert into public.project_updates (project_id, author_id, type, body)
select
  project.id,
  (
    select project_update.author_id
    from public.project_updates as project_update
    join public.profiles as author on author.id = project_update.author_id
    where project_update.project_id = project.id
      and project_update.type = 'approval_granted'
      and author.role in ('super_admin', 'admin')
    order by project_update.created_at desc
    limit 1
  ),
  'note',
  'Previous admin approvals were cleared. The assigned client must approve the project brief.'
from public.projects as project
where project.approvals ->> 'thread' = 'pending'
  and project.approvals ->> 'pattern' = 'pending'
  and exists (
    select 1
    from public.project_updates as project_update
    join public.profiles as author on author.id = project_update.author_id
    where project_update.project_id = project.id
      and project_update.type = 'approval_granted'
      and author.role in ('super_admin', 'admin')
  )
  and not exists (
    select 1
    from public.project_updates as project_update
    where project_update.project_id = project.id
      and project_update.body = 'Previous admin approvals were cleared. The assigned client must approve the project brief.'
  );
