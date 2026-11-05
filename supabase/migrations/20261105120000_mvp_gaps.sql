-- MVP gaps (docs/FLOWS.md §4): what a real coach and student need before launch.
--   1. 這天不開放: a coach closes single dates (trip, tournament); those sessions disappear from booking.
--   2. 取消這堂: the coach cancels a lesson (illness, rain); the student is told, unpaid payment rows go away.
--   3. 評價: after a lesson the student rates it 1–5 with a line of text; coach pages show the average.
--   4. 送審前要有收款資訊: a coach can't submit the page until students would have somewhere to pay.

-- ── 1. closed dates ──
create table public.coach_closed_days (
  coach_id uuid not null references public.coaches (id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  primary key (coach_id, day)
);
alter table public.coach_closed_days enable row level security;
create policy "closed days: own" on public.coach_closed_days for all to authenticated
  using (coach_id = public.my_coach_id()) with check (coach_id = public.my_coach_id());
grant select, insert, delete on public.coach_closed_days to authenticated;

create or replace function public.assert_session(p_plan uuid, p_starts_at timestamptz) returns public.coaches
language plpgsql stable security definer set search_path = '' as $$
declare c public.coaches; pl public.coach_plans;
begin
  select * into pl from public.coach_plans where id = p_plan and archived_at is null;
  if not found then raise exception 'plan not found'; end if;
  select * into c from public.coaches where id = pl.coach_id;
  if c.status <> 'approved' then raise exception 'coach not bookable'; end if;
  if p_starts_at <= now() then raise exception 'session already started'; end if;
  if not coalesce((c.availability -> public.tpe_weekday(p_starts_at)) ? public.tpe_hhmi(p_starts_at), false) then
    raise exception 'coach has no session at that time';
  end if;
  if exists (select 1 from public.coach_closed_days d where d.coach_id = c.id and d.day = (p_starts_at at time zone 'Asia/Taipei')::date) then
    raise exception 'coach is off that day';
  end if;
  return c;
end $$;

create or replace function public.open_sessions(p_coach_slug text, p_days int default 7)
returns table (plan_key text, starts_at timestamptz, seats_left int)
language sql stable security definer set search_path = '' as $$
  select pl.key, s.ts, public.lesson_seats_left(pl.id, s.ts)
  from public.coaches c
  cross join lateral (
    select ((d::date + t::time) at time zone 'Asia/Taipei') as ts
    from generate_series((now() at time zone 'Asia/Taipei')::date, (now() at time zone 'Asia/Taipei')::date + (least(greatest(p_days, 1), 14) - 1), interval '1 day') d,
         jsonb_array_elements_text(coalesce(c.availability -> public.tpe_weekday((d::date + time '12:00') at time zone 'Asia/Taipei'), '[]')) t
    where not exists (select 1 from public.coach_closed_days x where x.coach_id = c.id and x.day = d::date)
  ) s
  join public.coach_plans pl on pl.coach_id = c.id and pl.archived_at is null
  where c.slug = p_coach_slug and c.status = 'approved' and s.ts > now()
  order by s.ts, pl.sort
$$;

-- ── 2. the coach cancels a lesson ──
create function public.coach_cancel_booking(p_booking uuid, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare b public.lesson_bookings; v_paid boolean;
begin
  select * into b from public.lesson_bookings where id = p_booking for update;
  if not found or b.coach_id is distinct from public.my_coach_id() then raise exception 'not your lesson'; end if;
  if b.status not in ('pending', 'confirmed') then raise exception 'booking already closed'; end if;
  if b.starts_at <= now() then raise exception 'lesson already started'; end if;
  p_reason := left(btrim(coalesce(p_reason, '')), 60);
  perform public.assert_no_contact(p_reason);
  update public.lesson_bookings set status = 'cancelled', cancelled_at = now() where id = p_booking;
  if b.group_id is not null then update public.lesson_groups set status = 'cancelled' where id = b.group_id; end if;
  -- money already paid stays on record (the coach refunds it); anything not paid yet is simply dropped
  v_paid := exists (select 1 from public.payments where booking_id = p_booking and status = 'paid');
  delete from public.payments where booking_id = p_booking and status in ('waiting', 'reported');
  perform public.notify(b.student_id, 'booking_cancelled_by_coach',
    jsonb_build_object('booking_id', p_booking, 'at', public.tpe_hhmi(b.starts_at), 'reason', p_reason, 'paid', v_paid));
end $$;
revoke execute on function public.coach_cancel_booking(uuid, text) from public, anon;
grant execute on function public.coach_cancel_booking(uuid, text) to authenticated;

-- ── 3. reviews ──
create table public.lesson_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.lesson_bookings (id) on delete cascade,
  coach_id uuid not null references public.coaches (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  body text not null default '' check (char_length(body) <= 300),
  created_at timestamptz not null default now()
);
create index lesson_reviews_coach on public.lesson_reviews (coach_id, created_at desc);
alter table public.lesson_reviews enable row level security;
-- reviews are public on public coach pages, like answered questions
create policy "reviews: read public" on public.lesson_reviews for select to anon, authenticated
  using (exists (select 1 from public.coaches c where c.id = coach_id and c.status = 'approved') or student_id = (select auth.uid()));
grant select on public.lesson_reviews to anon, authenticated;

/** 評價: the student of a lesson that has happened, once per lesson (changing it later overwrites). */
create function public.review_lesson(p_booking uuid, p_stars int, p_body text) returns void
language plpgsql security definer set search_path = '' as $$
declare b public.lesson_bookings;
begin
  select * into b from public.lesson_bookings where id = p_booking;
  if not found or b.student_id is distinct from auth.uid() then raise exception 'not your lesson'; end if;
  if b.status not in ('confirmed', 'attended') or b.starts_at > now() then raise exception 'lesson not taken yet'; end if;
  if p_stars not between 1 and 5 then raise exception 'stars must be 1 to 5'; end if;
  p_body := left(btrim(coalesce(p_body, '')), 300);
  perform public.assert_no_contact(p_body);
  insert into public.lesson_reviews (booking_id, coach_id, student_id, stars, body)
  values (b.id, b.coach_id, b.student_id, p_stars, p_body)
  on conflict (booking_id) do update set stars = excluded.stars, body = excluded.body, created_at = now();
end $$;
revoke execute on function public.review_lesson(uuid, int, text) from public, anon;
grant execute on function public.review_lesson(uuid, int, text) to authenticated;

/** Average and count per coach, for cards and coach pages (a coach with none shows 新加入). */
create view public.coach_ratings with (security_invoker = true) as
  select coach_id, round(avg(stars)::numeric, 1) as rating, count(*)::int as reviews
  from public.lesson_reviews group by coach_id;
grant select on public.coach_ratings to anon, authenticated;

/** The morning after a lesson, ask the student for a review (once per lesson). */
create function public.ask_reviews() returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (user_id, kind, payload, channel)
  select b.student_id, 'review_request', jsonb_build_object('booking_id', b.id, 'coach', c.name), 'line'
  from public.lesson_bookings b join public.coaches c on c.id = b.coach_id
  where b.status in ('confirmed', 'attended') and b.starts_at between now() - interval '2 days' and now() - interval '3 hours'
    and not exists (select 1 from public.lesson_reviews r where r.booking_id = b.id)
    and not exists (select 1 from public.notifications n where n.user_id = b.student_id and n.kind = 'review_request' and n.payload ->> 'booking_id' = b.id::text);
end $$;
revoke execute on function public.ask_reviews() from public, anon, authenticated;

do $$ begin
  if exists (select from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('ask-reviews', '0 2 * * *', 'select public.ask_reviews()');  -- 02:00 UTC = 10:00 Taipei
  end if;
end $$;

-- ── 4. payout details before 送審 ──
create function public.coaches_payout_ready() returns trigger language plpgsql security definer set search_path = '' as $$
declare d jsonb;
begin
  if public.is_trusted() or not (old.status = 'draft' and new.status = 'pending') then return new; end if;
  select details into d from public.coach_pay_details where coach_id = new.id;
  if ('bank_transfer' = any (new.pay_methods) and (d -> 'bank_transfer') is null)
     or ('line_pay' = any (new.pay_methods) and (d -> 'line_pay') is null) then
    raise exception 'payout details missing';
  end if;
  return new;
end $$;
create trigger coaches_payout_ready before update on public.coaches for each row execute function public.coaches_payout_ready();
