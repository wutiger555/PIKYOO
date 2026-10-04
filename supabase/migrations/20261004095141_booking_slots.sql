-- B5 預約 (simple first, PLAN D7). Two changes:
-- 1. A pending request past its 48-hour window no longer holds seats. Expiry is read from expires_at instead of
--    waiting for expire_stale() to run on a schedule (decide_booking already refuses expired requests).
-- 2. open_sessions(): a coach's bookable sessions for the next days with seats left per plan, in one call
--    (the booking page now, the app later).

create or replace function public.lesson_seats_left(p_plan uuid, p_starts_at timestamptz) returns int
language plpgsql stable security definer set search_path = '' as $$
declare pl public.coach_plans; other_plan boolean; used int;
begin
  select * into pl from public.coach_plans where id = p_plan;
  if not found then return 0; end if;
  select exists (select 1 from public.lesson_bookings b where b.coach_id = pl.coach_id and b.starts_at = p_starts_at
                   and (b.status = 'confirmed' or (b.status = 'pending' and b.expires_at > now())) and b.plan_id <> p_plan)
      or exists (select 1 from public.lesson_groups lg where lg.coach_id = pl.coach_id and lg.starts_at = p_starts_at
                   and lg.status = 'gathering' and lg.plan_id <> p_plan)
    into other_plan;
  if other_plan then return 0; end if;
  select coalesce((select sum(b.headcount) from public.lesson_bookings b
                    where b.plan_id = p_plan and b.starts_at = p_starts_at
                      and (b.status = 'confirmed' or (b.status = 'pending' and b.expires_at > now()))), 0)
       + coalesce((select sum(greatest((select count(*) from public.lesson_group_members m where m.group_id = lg.id),
                                       coalesce(pl.group_min, 1)))
                    from public.lesson_groups lg
                    where lg.plan_id = p_plan and lg.starts_at = p_starts_at and lg.status = 'gathering'), 0)
    into used;
  return greatest(pl.capacity - used, 0);
end $$;

/** 可預約時段: every weekly open time of an approved coach in the next p_days days (Taipei), per active plan,
 *  with the seats still free. Sessions that already started are left out. */
create function public.open_sessions(p_coach_slug text, p_days int default 7)
returns table (plan_key text, starts_at timestamptz, seats_left int)
language sql stable security definer set search_path = '' as $$
  select pl.key, s.ts, public.lesson_seats_left(pl.id, s.ts)
  from public.coaches c
  cross join lateral (
    select ((d::date + t::time) at time zone 'Asia/Taipei') as ts
    from generate_series((now() at time zone 'Asia/Taipei')::date, (now() at time zone 'Asia/Taipei')::date + (least(greatest(p_days, 1), 14) - 1), interval '1 day') d,
         jsonb_array_elements_text(coalesce(c.availability -> public.tpe_weekday((d::date + time '12:00') at time zone 'Asia/Taipei'), '[]')) t
  ) s
  join public.coach_plans pl on pl.coach_id = c.id and pl.archived_at is null
  where c.slug = p_coach_slug and c.status = 'approved' and s.ts > now()
  order by s.ts, pl.sort
$$;
grant execute on function public.open_sessions(text, int) to anon, authenticated;
