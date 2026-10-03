-- The LINE user id now comes from raw_app_meta_data, which only the server (secret key) can write.
-- raw_user_meta_data is user-editable: anyone signing up by email could put a victim's LINE id there, and
-- /api/auth/line, which finds accounts by that id, would then sign the victim into the attacker's account.

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'name', ''), 30), new.raw_user_meta_data ->> 'avatar_url');
  insert into public.profile_private (id, line_user_id) values (new.id, new.raw_app_meta_data ->> 'line_user_id');
  return new;
end $$;
