-- Supabase Auth inserts a new user first and writes its app_metadata in a later update, so handle_new_user
-- (AFTER INSERT) never saw the LINE id and /api/auth/line couldn't find the account on the next sign-in.
-- Copy it whenever the server-written app_metadata line_user_id changes; app_metadata is not user-editable.

create function public.sync_line_user_id() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.profile_private set line_user_id = new.raw_app_meta_data ->> 'line_user_id' where id = new.id;
  return new;
end $$;
revoke execute on function public.sync_line_user_id() from public, anon, authenticated;

create trigger on_auth_user_line_id after update of raw_app_meta_data on auth.users for each row
  when (old.raw_app_meta_data ->> 'line_user_id' is distinct from new.raw_app_meta_data ->> 'line_user_id')
  execute function public.sync_line_user_id();

-- accounts created before this fix (skip deleted ones: delete_my_account clears the id on purpose)
update public.profile_private pp set line_user_id = u.raw_app_meta_data ->> 'line_user_id'
from auth.users u, public.profiles p
where u.id = pp.id and p.id = pp.id and pp.line_user_id is null and p.deleted_at is null
  and u.raw_app_meta_data ->> 'line_user_id' is not null;
