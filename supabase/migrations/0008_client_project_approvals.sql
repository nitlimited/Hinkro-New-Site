create or replace function public.approve_project_brief(
  target_project_id uuid,
  approval_kind text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_approvals jsonb;
  approval_label text;
  client_name text;
begin
  if public.current_role_of() <> 'client' then
    raise exception 'Only the client can approve a project brief.'
      using errcode = '42501';
  end if;

  if not public.is_project_client(target_project_id) then
    raise exception 'You do not have access to approve this project.'
      using errcode = '42501';
  end if;

  if approval_kind not in ('thread', 'pattern') then
    raise exception 'Unknown project approval type.'
      using errcode = '22023';
  end if;

  select p.approvals ->> approval_kind
    into approval_label
    from public.projects p
    where p.id = target_project_id;

  if approval_label = 'approved' then
    select p.approvals into updated_approvals
      from public.projects p
      where p.id = target_project_id;
    return updated_approvals;
  end if;

  update public.projects
  set approvals = jsonb_set(
    jsonb_set(
      coalesce(approvals, '{}'::jsonb),
      array[approval_kind],
      '"approved"'::jsonb,
      true
    ),
    array[approval_kind || '_at'],
    to_jsonb(now()),
    true
  )
  where id = target_project_id
  returning approvals into updated_approvals;

  select coalesce(full_name, 'Client')
    into client_name
    from public.profiles
    where id = auth.uid();

  approval_label := case approval_kind
    when 'thread' then 'thread colours'
    else 'pattern & design'
  end;

  insert into public.project_updates (
    project_id,
    author_id,
    type,
    body
  ) values (
    target_project_id,
    auth.uid(),
    'approval_granted',
    client_name || ' approved the ' || approval_label || '.'
  );

  return updated_approvals;
end;
$$;

revoke all on function public.approve_project_brief(uuid, text) from public;
grant execute on function public.approve_project_brief(uuid, text) to authenticated;
