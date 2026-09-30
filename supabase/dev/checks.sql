-- Behaviour checks for the schema, run by dev/check.sh on the seeded throwaway database.
-- Each block signs in as a seed user (test.login) and asserts what that person can and cannot do.

create schema test;
grant usage on schema test to anon, authenticated;
create function test.login(who text) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', md5('pikyoo-seed:' || who)::uuid, 'role', 'authenticated')::text, false)
$$;
create function test.visitor() returns void language sql as $$
  select set_config('request.jwt.claims', '{"role": "anon"}', false)
$$;
create function test.uid(who text) returns uuid language sql immutable as $$ select md5('pikyoo-seed:' || who)::uuid $$;
create function test.game(key text) returns uuid language sql immutable as $$ select md5('pikyoo-seed-game:' || key)::uuid $$;
/** The next <weekday> after today in Taipei at hh:mi (at least one day ahead). */
create function test.next_at(wd text, hhmi text) returns timestamptz language sql stable as $$
  select min(ts) from (
    select ((date_trunc('day', now() at time zone 'Asia/Taipei') + make_interval(days => d) + hhmi::time) at time zone 'Asia/Taipei') ts
    from generate_series(1, 7) d) x
  where public.tpe_weekday(ts) = wd
$$;
/** Runs sql and returns the error message, or null if it succeeded. */
create function test.fails(sql text) returns text language plpgsql as $$
begin
  execute sql;
  return null;
exception when others then
  return sqlerrm;
end $$;
grant execute on all functions in schema test to anon, authenticated;

-- ── visitor ──
do $$ begin perform test.visitor(); end $$;
set role anon;
do $$
begin
  assert (select count(*) from public.courts) = 6, 'visitor sees courts';
  assert (select count(*) from public.coach_cards) = 4, 'visitor sees approved coaches';
  assert (select count(*) from public.game_cards) = 6, 'visitor sees games';
  assert (select joined_count from public.game_cards where id = test.game('g5')) = 6, 'g5 has 6 joined';
  assert (select waitlist_count from public.game_cards where id = test.game('g5')) = 2, 'g5 has 2 waitlisted';
  assert (select price_from from public.coach_cards where slug = 'mia') = 600, 'mia from 600';
  assert (select certified from public.coach_cards where slug = 'mia') and not (select certified from public.coach_cards where slug = 'ray'), 'certified excludes DUPR';
  assert not exists (select 1 from public.questions where answer is null), 'unanswered questions hidden from visitors';
  assert test.fails('select * from public.lesson_bookings') like 'permission denied%', 'visitor cannot read bookings';
  assert test.fails('select * from public.profile_private') like 'permission denied%', 'visitor cannot read private profiles';
  assert test.fails('select * from public.coach_pay_details') like 'permission denied%', 'visitor cannot read pay details';
  assert test.fails($q$select public.join_game(test.game('g2'))$q$) like 'permission denied%', 'visitor cannot join';
  assert (public.lesson_group_by_code('seedgrp1') -> 'members' -> 0 ->> 'name') = '小安', 'invite page works signed out';
end $$;
reset role;

-- ── player 小安: join, waitlist, leave, ask ──
do $$ begin perform test.login('小安'); end $$;
set role authenticated;
do $$
declare n int;
begin
  assert public.join_game(test.game('g2')) = 'joined', 'free seat → joined';
  assert public.join_game(test.game('g2')) = 'joined', 'joining twice is a no-op';
  assert public.join_game(test.game('g5')) = 'waitlisted', 'full → waitlisted';
  assert public.leave_game(test.game('g5')) = 'cancelled', 'leave the waitlist';
  assert (select count(*) from public.profile_private) = 1, 'only my private row';
  update public.games set fee = 0 where id = test.game('g1');
  get diagnostics n = row_count;
  assert n = 0, 'cannot edit someone else''s game';
  assert test.fails($q$update public.profile_private set is_admin = true$q$) like 'permission denied%', 'cannot make myself admin';
  assert (select count(*) from public.lesson_bookings) = 1, 'I see my own request only';
  assert test.fails($q$insert into public.questions (coach_id, asker_id, text) values
    ((select id from public.coaches where slug = 'mia'), auth.uid(), '可以加我 LINE 嗎 我的 line id: abc')$q$) = 'contact_detail', 'contact details blocked';
  insert into public.questions (coach_id, asker_id, text) values ((select id from public.coaches where slug = 'mia'), auth.uid(), '請問雨天會改室內嗎？');
  assert exists (select 1 from public.questions where text = '請問雨天會改室內嗎？'), 'my unanswered question is visible to me';
  assert test.fails($q$insert into public.coaches (profile_id, slug, name, status) values (auth.uid(), 'an', '小安', 'approved')$q$) = 'coach status is set by PIKYOO', 'cannot self-approve';
  assert test.fails($q$select public.request_booking((select id from public.coach_plans where key = 'trial' and coach_id = (select id from public.coaches where slug = 'mia')),
    test.next_at('日', '10:00'), 5, '', 'line_pay')$q$) = 'not enough seats', 'trial holds 4';
  assert test.fails($q$select public.request_booking((select id from public.coach_plans where key = 'trial' and coach_id = (select id from public.coaches where slug = 'mia')),
    test.next_at('一', '10:00'), 1, '', 'line_pay')$q$) = 'coach has no session at that time', 'only published sessions';
  perform public.request_booking((select id from public.coach_plans where key = 'p1' and coach_id = (select id from public.coaches where slug = 'mia')),
    test.next_at('二', '19:30'), 1, '想練反手', 'bank_transfer');
  assert test.fails($q$select public.request_booking((select id from public.coach_plans where key = 'trial' and coach_id = (select id from public.coaches where slug = 'mia')),
    test.next_at('二', '19:30'), 1, '', 'line_pay')$q$) = 'not enough seats', 'a session belongs to the first plan booked into it';
end $$;
reset role;

-- ── coach Mia: decide, answer, edit ──
do $$ begin perform test.login('Mia 林'); end $$;
set role authenticated;
do $$
declare b uuid; q uuid;
begin
  assert (select count(*) from public.lesson_bookings where status = 'pending') = 3, 'Mia sees her 3 pending requests';
  select id into b from public.lesson_bookings where student_id = test.uid('小安') and note = '想練反手';
  perform public.decide_booking(b, true);
  assert (select status from public.lesson_bookings where id = b) = 'confirmed', 'confirmed';
  assert (select count(*) from public.payments where booking_id = b and amount = 1500) = 1, 'one payment row for a solo booking';
  select id into q from public.questions where text = '請問雨天會改室內嗎？';
  assert test.fails(format('select public.answer_question(%L, %L)', q, '私訊我就好')) = 'contact_detail', 'answers are checked too';
  perform public.answer_question(q, '會，改到大安運動中心室內場。');
  update public.coaches set tagline = '專帶第一次拿拍的人' where slug = 'mia';
  assert test.fails($q$update public.coaches set status = 'suspended' where slug = 'mia'$q$) = 'coach status is set by PIKYOO', 'coach cannot change status';
  insert into public.credentials (coach_id, type, issuer, level, status) values (public.my_coach_id(), 'coach_cert', 'PPR', 'Certified', 'verified');
  assert (select status from public.credentials where issuer = 'PPR' and coach_id = public.my_coach_id()) = 'pending', 'new credentials wait for review';
  insert into public.coach_pay_details (coach_id, details) values (public.my_coach_id(), '{"bank_transfer": "台新 812・1234567"}');
end $$;
reset role;

-- ── 小安 pays; group lesson end to end ──
do $$ begin perform test.login('小安'); end $$;
set role authenticated;
do $$
declare p uuid; g public.lesson_groups;
begin
  select id into p from public.payments where payer_id = auth.uid();
  assert (public.payment_instructions(p) ->> 'details') = '台新 812・1234567', 'student sees how to pay after confirmation';
  perform public.report_payment(p, '12345');
  g := public.create_lesson_group((select id from public.coach_plans where key = 'small' and coach_id = (select id from public.coaches where slug = 'mia')),
         test.next_at('六', '09:00'), '同事一起');
  perform set_config('test.code', g.invite_code, false);
  perform set_config('test.group', g.id::text, false);
  assert test.fails(format('select public.submit_lesson_group(%L, %L)', g.id, 'line_pay')) = 'need 3 people, have 1', 'group needs its minimum';
end $$;
do $$ begin perform test.login('葉子'); end $$;
do $$ begin perform public.join_lesson_group(current_setting('test.code')); end $$;
do $$ begin perform test.login('Jason'); end $$;
do $$ begin perform public.join_lesson_group(current_setting('test.code')); end $$;
do $$ begin perform test.login('小安'); end $$;
do $$ begin perform public.submit_lesson_group(current_setting('test.group')::uuid, 'line_pay'); end $$;
do $$ begin perform test.login('Mia 林'); end $$;
do $$
declare b uuid; p uuid;
begin
  select id into b from public.lesson_bookings where group_id = current_setting('test.group')::uuid;
  assert (select headcount from public.lesson_bookings where id = b) = 3, 'one request for three people';
  perform public.decide_booking(b, true);
  assert (select count(*) from public.payments where booking_id = b and amount = 800) = 3, 'each member pays their share';
  select id into p from public.payments where payer_id = test.uid('小安') and status = 'reported';
  perform public.mark_payment_paid(p);
end $$;
do $$ begin perform test.login('趙柏宇'); end $$;
do $$ begin
  assert (select count(*) from public.lesson_bookings) = 0, 'another coach sees none of Mia''s bookings';
  assert (select count(*) from public.payments) = 0, 'or her payments';
end $$;
reset role;

-- ── waitlist promotion and the host's tools ──
do $$ begin perform test.login('葉子'); end $$;
set role authenticated;
do $$ begin assert public.leave_game(test.game('g5')) = 'cancelled', 'early cancel is free'; end $$;
reset role;
do $$
begin
  assert (select status from public.game_participants where game_id = test.game('g5') and user_id = test.uid('候補1')) = 'joined', 'first on the waitlist moves up';
  assert (select status from public.game_participants where game_id = test.game('g5') and user_id = test.uid('候補2')) = 'waitlisted', 'second stays';
  assert exists (select 1 from public.notifications where user_id = test.uid('候補1') and kind = 'game_promoted'), 'promotion is notified';
end $$;
do $$ begin perform test.login('小安'); end $$;
set role authenticated;
do $$ begin assert test.fails($q$select public.cancel_game(test.game('g5'))$q$) = 'only the host can cancel', 'only the host cancels'; end $$;
do $$ begin perform test.login('阿睿'); end $$;
do $$
begin
  assert public.host_add_guest(test.game('g5'), '阿睿的朋友') = 'waitlisted', 'guest goes to the waitlist when full';
  update public.games set capacity = 8 where id = test.game('g5');
  assert (select joined_count from public.game_cards where id = test.game('g5')) = 8, 'more seats pull the waitlist up';
  assert test.fails($q$update public.games set capacity = 4 where id = test.game('g5')$q$) like 'capacity below joined count%', 'cannot shrink below joined';
  perform public.cancel_game(test.game('g5'));
  assert (select cancelled_at is not null from public.games where id = test.game('g5')), 'cancelled';
end $$;
reset role;
do $$ begin assert (select count(*) from public.notifications where kind = 'game_cancelled') = 6, 'everyone signed up is told (not the host or the guest)'; end $$;

-- ── a gathering group holds its minimum (Mia 小班課: 4 seats, 3–4 people) ──
do $$ begin perform test.login('小安'); end $$;
set role authenticated;
do $$
declare g public.lesson_groups;
begin
  g := public.create_lesson_group((select id from public.coach_plans where key = 'small' and coach_id = (select id from public.coaches where slug = 'mia')),
         test.next_at('五', '20:00'), '');
  perform set_config('test.hold_code', g.invite_code, false);
  assert public.lesson_seats_left(g.plan_id, g.starts_at) = 1, 'a group of 1 holds the 3-person minimum';
end $$;
do $$ begin perform test.login('Jason'); end $$;
do $$ begin perform public.request_booking((select id from public.coach_plans where key = 'small' and coach_id = (select id from public.coaches where slug = 'mia')),
  test.next_at('五', '20:00'), 1, '', 'line_pay'); end $$;
do $$ begin perform test.login('Peggy'); end $$;
do $$ begin
  assert test.fails($q$select public.request_booking((select id from public.coach_plans where key = 'small' and coach_id = (select id from public.coaches where slug = 'mia')),
    test.next_at('五', '20:00'), 1, '', 'line_pay')$q$) = 'not enough seats', 'held seats are not for solo bookings';
  assert test.fails($q$select public.create_lesson_group((select id from public.coach_plans where key = 'small' and coach_id = (select id from public.coaches where slug = 'mia')),
    test.next_at('五', '20:00'), '')$q$) = 'not enough seats', 'a second group needs room for its own minimum';
end $$;
do $$ begin perform test.login('葉子'); end $$;
do $$ begin perform public.join_lesson_group(current_setting('test.hold_code')); end $$;
do $$ begin perform test.login('阿何'); end $$;
do $$ begin perform public.join_lesson_group(current_setting('test.hold_code')); end $$;
do $$ begin perform test.login('小周'); end $$;
do $$ begin assert test.fails(format('select public.join_lesson_group(%L)', current_setting('test.hold_code'))) = 'group is full',
  'past the minimum a friend needs a free seat'; end $$;
reset role;

-- ── housekeeping and account deletion ──
update public.lesson_bookings set expires_at = now() - interval '1 minute' where status = 'pending';
select public.expire_stale();
do $$ begin assert not exists (select 1 from public.lesson_bookings where status = 'pending'), 'stale requests expire'; end $$;
do $$ begin perform test.login('Wendy'); end $$;
set role authenticated;
do $$ begin perform public.delete_my_account(); end $$;
reset role;
do $$ begin assert (select display_name from public.profiles where id = test.uid('Wendy')) = '已刪除使用者', 'deleted accounts are anonymised'; end $$;
