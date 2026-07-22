alter table public.clients
  add column if not exists invited_at timestamptz,
  add column if not exists accepted_at timestamptz;

update public.clients as client
set
  invited_at = coalesce(client.invited_at, client.created_at),
  accepted_at = case
    when auth_user.email_confirmed_at is not null
      then coalesce(client.accepted_at, auth_user.email_confirmed_at)
    else client.accepted_at
  end
from auth.users as auth_user
where client.profile_id = auth_user.id;

create or replace function public.sync_client_invitation_acceptance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null
    and old.email_confirmed_at is null then
    update public.clients
    set accepted_at = coalesce(accepted_at, new.email_confirmed_at)
    where profile_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_client_invitation_acceptance on auth.users;
create trigger sync_client_invitation_acceptance
after update of email_confirmed_at on auth.users
for each row execute function public.sync_client_invitation_acceptance();
