-- B6 part 3: the evening before (20:00 Taipei, PRD F6), remind everyone with a confirmed lesson or a joined game tomorrow.
-- Rows go into the same queue, so they show under the bell and kick_notify pushes them to LINE.

create function public.remind_tomorrow() returns void language plpgsql security definer set search_path = '' as $$
declare v_day date := (now() at time zone 'Asia/Taipei')::date + 1;
begin
  -- a group booking reminds every member, not only the organiser who booked
  insert into public.notifications (user_id, kind, payload, channel)
  select u.user_id, 'lesson_reminder', jsonb_build_object('booking_id', b.id, 'at', public.tpe_hhmi(b.starts_at)), 'line'
  from public.lesson_bookings b
  cross join lateral (select b.student_id as user_id union select m.user_id from public.lesson_group_members m where m.group_id = b.group_id) u
  where b.status = 'confirmed' and (b.starts_at at time zone 'Asia/Taipei')::date = v_day
    and not exists (select 1 from public.notifications n where n.user_id = u.user_id and n.kind = 'lesson_reminder' and n.payload ->> 'booking_id' = b.id::text);

  insert into public.notifications (user_id, kind, payload, channel)
  select p.user_id, 'game_reminder', jsonb_build_object('game_id', g.id, 'at', public.tpe_hhmi(g.starts_at)), 'line'
  from public.games g join public.game_participants p on p.game_id = g.id
  where g.cancelled_at is null and p.status = 'joined' and p.user_id is not null and (g.starts_at at time zone 'Asia/Taipei')::date = v_day
    and not exists (select 1 from public.notifications n where n.user_id = p.user_id and n.kind = 'game_reminder' and n.payload ->> 'game_id' = g.id::text);
end $$;
revoke execute on function public.remind_tomorrow() from public, anon, authenticated;

do $$ begin
  if exists (select from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('remind-tomorrow', '0 12 * * *', 'select public.remind_tomorrow()');  -- 12:00 UTC = 20:00 Taipei
  end if;
end $$;
