-- B7 營運: the admin page's numbers (PRD F9-5) and taking a coach page down / back up (F9-3).
-- Games are taken down with cancel_game(), which already lets admins in and tells everyone signed up.

/** 數字 for the admin page: people, coaches, games and bookings, the last 7 days where it matters. */
create function public.admin_stats() returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare week timestamptz := now() - interval '7 days';
begin
  if not public.is_admin() then raise exception 'admins only' using errcode = '42501'; end if;
  return jsonb_build_object(
    'users', (select count(*) from public.profiles where deleted_at is null),
    'users_7d', (select count(*) from public.profiles where deleted_at is null and created_at >= week),
    'coaches_public', (select count(*) from public.coaches where status = 'approved'),
    'coaches_pending', (select count(*) from public.coaches where status = 'pending'),
    'games_upcoming', (select count(*) from public.games where cancelled_at is null and starts_at >= now()),
    'joins_7d', (select count(*) from public.game_participants where joined_at >= week and status <> 'cancelled'),
    'bookings_7d', (select count(*) from public.lesson_bookings where created_at >= week),
    'confirmed_7d', (select count(*) from public.lesson_bookings where created_at >= week and status in ('confirmed', 'attended')));
end $$;

/** 下架 hides a public coach page (suspended), 恢復 puts it back; the coach is told either way. */
create function public.set_coach_listed(p_coach uuid, p_listed boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare c public.coaches;
begin
  if not public.is_admin() then raise exception 'admins only' using errcode = '42501'; end if;
  select * into c from public.coaches where id = p_coach for update;
  if not found then raise exception 'coach not found'; end if;
  if c.status <> (case when p_listed then 'suspended' else 'approved' end)::public.coach_status then raise exception 'nothing to change'; end if;
  update public.coaches set status = (case when p_listed then 'approved' else 'suspended' end)::public.coach_status where id = p_coach;
  perform public.notify(c.profile_id, case when p_listed then 'coach_approved' else 'coach_suspended' end, jsonb_build_object('coach_id', p_coach));
end $$;

revoke execute on function public.admin_stats(), public.set_coach_listed(uuid, boolean) from public, anon;
grant execute on function public.admin_stats(), public.set_coach_listed(uuid, boolean) to authenticated;
