-- 揪朋友一起上: a gathering group holds max(members, plan minimum) seats instead of just its members.
-- Before, solo bookings could take the seats the organiser's friends were about to use, leaving the
-- group unable to reach its minimum. Seats above the minimum stay open to anyone (BACKEND §4.2, §13).

/** Seats left in one of a coach's sessions for a plan. A session belongs to the first plan booked into it;
 *  a gathering group holds as many seats as it has members, and at least the plan's minimum. */
create or replace function public.lesson_seats_left(p_plan uuid, p_starts_at timestamptz) returns int
language plpgsql stable security definer set search_path = '' as $$
declare pl public.coach_plans; other_plan boolean; used int;
begin
  select * into pl from public.coach_plans where id = p_plan;
  if not found then return 0; end if;
  select exists (select 1 from public.lesson_bookings b where b.coach_id = pl.coach_id and b.starts_at = p_starts_at
                   and b.status in ('pending', 'confirmed') and b.plan_id <> p_plan)
      or exists (select 1 from public.lesson_groups lg where lg.coach_id = pl.coach_id and lg.starts_at = p_starts_at
                   and lg.status = 'gathering' and lg.plan_id <> p_plan)
    into other_plan;
  if other_plan then return 0; end if;
  select coalesce((select sum(b.headcount) from public.lesson_bookings b
                    where b.plan_id = p_plan and b.starts_at = p_starts_at and b.status in ('pending', 'confirmed')), 0)
       + coalesce((select sum(greatest((select count(*) from public.lesson_group_members m where m.group_id = lg.id),
                                       coalesce(pl.group_min, 1)))
                    from public.lesson_groups lg
                    where lg.plan_id = p_plan and lg.starts_at = p_starts_at and lg.status = 'gathering'), 0)
    into used;
  return greatest(pl.capacity - used, 0);
end $$;

/** 揪朋友一起上 (F3-10) step 1: hold the session (the plan's minimum) and get an invite code. */
create or replace function public.create_lesson_group(p_plan uuid, p_starts_at timestamptz, p_note text)
returns public.lesson_groups language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); c public.coaches; pl public.coach_plans; g public.lesson_groups;
begin
  if me is null then raise exception 'sign in first' using errcode = '28000'; end if;
  c := public.assert_session(p_plan, p_starts_at);
  select * into pl from public.coach_plans where id = p_plan;
  if pl.group_min is null then raise exception 'this plan is booked alone'; end if;
  perform pg_advisory_xact_lock(hashtext(c.id::text || p_starts_at::text));
  if public.lesson_seats_left(p_plan, p_starts_at) < pl.group_min then raise exception 'not enough seats'; end if;
  insert into public.lesson_groups (coach_id, plan_id, starts_at, organizer_id, note, deadline_at)
  values (c.id, p_plan, p_starts_at, me, coalesce(p_note, ''), greatest(p_starts_at - interval '24 hours', now() + interval '1 hour'))
  returning * into g;
  insert into public.lesson_group_members (group_id, user_id) values (g.id, me);
  return g;
end $$;

/** Friends below the minimum use the seats the group already holds; beyond it they need a free seat. */
create or replace function public.join_lesson_group(p_code text) returns uuid language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); g public.lesson_groups; pl public.coach_plans; n int;
begin
  if me is null then raise exception 'sign in first' using errcode = '28000'; end if;
  select * into g from public.lesson_groups where invite_code = p_code for update;
  if not found then raise exception 'invite not found'; end if;
  if exists (select 1 from public.lesson_group_members where group_id = g.id and user_id = me) then return g.id; end if;
  if g.status <> 'gathering' or g.deadline_at <= now() then raise exception 'group is closed'; end if;
  select * into pl from public.coach_plans where id = g.plan_id;
  select count(*) into n from public.lesson_group_members where group_id = g.id;
  perform pg_advisory_xact_lock(hashtext(g.coach_id::text || g.starts_at::text));
  if n >= pl.group_max or (n >= pl.group_min and public.lesson_seats_left(g.plan_id, g.starts_at) < 1) then
    raise exception 'group is full';
  end if;
  insert into public.lesson_group_members (group_id, user_id) values (g.id, me);
  perform public.notify(g.organizer_id, 'group_joined', jsonb_build_object('group_id', g.id), 'in_app');
  return g.id;
end $$;
