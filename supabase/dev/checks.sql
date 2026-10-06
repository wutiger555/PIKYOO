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
  assert test.fails($q$select public.join_game(test.game('g4'))$q$) like 'permission denied%', 'visitor cannot join';
  assert (public.lesson_group_by_code('seedgrp1') -> 'members' -> 0 ->> 'name') = '小安', 'invite page works signed out';
end $$;
reset role;

-- ── player 小安: join, waitlist, leave, ask ──
do $$ begin perform test.login('小安'); end $$;
set role authenticated;
do $$
declare n int;
begin
  assert public.join_game(test.game('g4')) = 'joined', 'free seat → joined (g4 is on the weekend: today''s games may already have started when CI runs)';
  assert public.join_game(test.game('g4')) = 'joined', 'joining twice is a no-op';
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
  insert into public.credentials (coach_id, type, issuer, level, status) values (public.my_coach_id(), 'dupr', 'DUPR', '4.3', 'verified');
  assert (select status from public.credentials where type = 'dupr' and level = '4.3' and coach_id = public.my_coach_id()) = 'self_reported', 'DUPR stays self-reported';
  -- uploads (B4): only into a folder named after yourself
  insert into storage.objects (bucket_id, name) values ('coach-photos', test.uid('Mia 林')::text || '/cover.jpg');
  insert into storage.objects (bucket_id, name) values ('credentials', test.uid('Mia 林')::text || '/cert.jpg');
  assert test.fails(format('insert into storage.objects (bucket_id, name) values (%L, %L)', 'coach-photos', test.uid('趙柏宇')::text || '/x.jpg')) is not null,
    'no uploads into someone else''s folder';
  insert into public.coach_pay_details (coach_id, details) values (public.my_coach_id(), '{"bank_transfer": "台新 812・1234567"}');
end $$;
reset role;

-- ── 小安 pays; group lesson end to end ──
do $$ begin perform test.login('小安'); end $$;
set role authenticated;
do $$ begin assert (select count(*) from storage.objects where bucket_id = 'credentials') = 0, 'other people''s certificate scans are private'; end $$;
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

-- ── sign-up: the LINE id is taken from server-written app metadata only ──
insert into auth.users (id, raw_user_meta_data, raw_app_meta_data) values
  ('00000000-0000-0000-0000-00000000a001', '{"name": "冒充者", "line_user_id": "Uvictim"}', '{}'),
  ('00000000-0000-0000-0000-00000000a002', '{"name": "LINE 使用者"}', '{"line_user_id": "Ureal"}');
do $$ begin
  assert (select line_user_id from public.profile_private where id = '00000000-0000-0000-0000-00000000a001') is null,
    'a LINE id in user-editable metadata is ignored';
  assert (select line_user_id from public.profile_private where id = '00000000-0000-0000-0000-00000000a002') = 'Ureal',
    'the LINE id set by the server is stored';
end $$;
-- what Supabase Auth actually does: insert first, then write app_metadata
insert into auth.users (id, raw_user_meta_data) values ('00000000-0000-0000-0000-00000000a003', '{"name": "後補 LINE"}');
update auth.users set raw_app_meta_data = '{"provider": "email", "line_user_id": "Ulater"}' where id = '00000000-0000-0000-0000-00000000a003';
do $$ begin
  assert (select line_user_id from public.profile_private where id = '00000000-0000-0000-0000-00000000a003') = 'Ulater',
    'a LINE id written to app_metadata after sign-up is stored too';
end $$;

-- ── 首次登入設定: people save their own profile and private settings, nobody else's ──
do $$ begin perform test.login('小安'); end $$;
set role authenticated;
do $$
declare n int;
begin
  update public.profiles set display_name = '小安安', level = 2 where id = test.uid('小安');
  get diagnostics n = row_count; assert n = 1, 'own profile is editable';
  update public.profile_private set home_districts = '{大安區}', onboarded_at = now() where id = test.uid('小安');
  get diagnostics n = row_count; assert n = 1, 'own private settings are editable';
  update public.profile_private set home_districts = '{}' where id = test.uid('葉子');
  get diagnostics n = row_count; assert n = 0, 'someone else''s private settings are not';
  assert test.fails($q$update public.profile_private set line_user_id = 'Uhijack' where id = test.uid('小安')$q$) is not null,
    'the LINE id is server-only';
end $$;
reset role;

-- ── 開團: anyone signed in hosts their own game, starting in the future; the host takes a seat ──
do $$ begin perform test.login('葉子'); end $$;
set role authenticated;
do $$
declare g uuid;
begin
  insert into public.games (host_id, location_text, starts_at, ends_at, level_min, level_max, capacity)
  values (test.uid('葉子'), '社區球場', now() + interval '1 day', now() + interval '1 day 2 hours', 1, 3, 4) returning id into g;
  assert (select joined_count from public.game_cards where id = g) = 1, 'the host is seated';
  assert test.fails(format($q$insert into public.games (host_id, location_text, starts_at, ends_at, level_min, level_max, capacity)
    values (%L, '社區球場', now() - interval '1 hour', now() + interval '1 hour', 1, 3, 4)$q$, test.uid('葉子'))) like '%row-level security%',
    'a game cannot start in the past';
  assert test.fails(format($q$insert into public.games (host_id, location_text, starts_at, ends_at, level_min, level_max, capacity)
    values (%L, '社區球場', now() + interval '1 day', now() + interval '1 day 2 hours', 1, 3, 4)$q$, test.uid('小安'))) like '%row-level security%',
    'nobody hosts in someone else''s name';
  assert test.fails(format($q$select public.host_remove_participant(id) from public.game_participants where game_id = %L$q$, g)) = 'the host cannot be removed',
    'the host cannot remove themselves';
end $$;
reset role;

-- ── 編輯球局: the host edits their own game; people signed up hear about a new time, place or fee ──
do $$ begin perform test.login('葉子'); end $$;
set role authenticated;
insert into public.games (host_id, location_text, starts_at, ends_at, level_min, level_max, capacity)
values (test.uid('葉子'), '編輯測試', now() + interval '2 days', now() + interval '2 days 2 hours', 1, 3, 2);
do $$ begin perform test.login('小安'); end $$;
select public.join_game((select id from public.games where location_text = '編輯測試'));
do $$ begin perform test.login('阿何'); end $$;
do $$ begin assert public.join_game((select id from public.games where location_text = '編輯測試')) = 'waitlisted', 'the edit game is full'; end $$;
do $$ begin perform test.login('小安'); end $$;
do $$
declare n int;
begin
  update public.games set notes = '不是我的' where location_text = '編輯測試';
  get diagnostics n = row_count; assert n = 0, 'only the host edits a game';
end $$;
do $$ begin perform test.login('葉子'); end $$;
do $$
declare g uuid := (select id from public.games where location_text = '編輯測試');
begin
  update public.games set notes = '球由團主準備' where id = g;
  update public.games set starts_at = starts_at + interval '1 hour', ends_at = ends_at + interval '1 hour', fee = 100 where id = g;
  assert test.fails(format($q$update public.games set starts_at = now() - interval '1 hour' where id = %L$q$, g)) = 'start time is in the past',
    'an edit cannot move the start into the past';
  assert test.fails(format($q$update public.games set capacity = 1 where id = %L$q$, g)) like 'capacity below joined count%',
    'capacity cannot drop below the people already in';
  update public.games set capacity = 3 where id = g;
  assert (select joined_count from public.game_cards where id = g) = 3, 'a bigger game moves the waitlist up';
end $$;
reset role;
do $$
declare g uuid := (select id from public.games where location_text = '編輯測試');
begin
  assert (select count(*) from public.notifications where kind = 'game_changed' and payload ->> 'game_id' = g::text) = 2,
    'one change notice each for the player and the waitlisted (a notes edit sends none)';
  assert (select payload -> 'changed' from public.notifications where kind = 'game_changed' and user_id = test.uid('小安')
    and payload ->> 'game_id' = g::text) = '["time", "fee"]', 'the notice says what changed';
  assert not exists (select 1 from public.notifications where kind = 'game_changed' and user_id = test.uid('葉子')), 'the host is not notified';
end $$;
do $$ begin perform test.login('葉子'); end $$;
set role authenticated;
do $$
declare g uuid := (select id from public.games where location_text = '編輯測試');
begin
  perform public.cancel_game(g);
  assert test.fails(format($q$update public.games set notes = '改回來' where id = %L$q$, g)) = 'game cancelled', 'a cancelled game cannot be edited';
end $$;
reset role;

-- ── 審核 (B4): only admins approve coach pages and certificates; the coach is notified ──
insert into public.coaches (profile_id, slug, name, status) values (test.uid('葉子'), 'yezi', '葉子教練', 'pending');
update public.profile_private set is_admin = true where id = test.uid('阿何');
do $$ begin perform test.login('小安'); end $$;
set role authenticated;
do $$ begin
  assert test.fails(format('select public.review_coach(%L, true)', (select id from public.coaches where slug = 'yezi'))) = 'admins only',
    'a non-admin cannot approve a coach';
end $$;
reset role;
do $$ begin perform test.login('阿何'); end $$;
set role authenticated;
do $$
declare cid uuid := (select id from public.coaches where slug = 'yezi');
        cred uuid := (select id from public.credentials where issuer = 'PPR' and status = 'pending' limit 1);
begin
  perform public.review_coach(cid, true);
  assert (select status = 'approved' and approved_at is not null from public.coaches where id = cid), 'an admin approves a coach page';
  assert test.fails(format('select public.review_coach(%L, false)', cid)) = 'not waiting for review', 'only pages under review are reviewed';
  perform public.review_credential(cred, true);
  assert (select status = 'verified' and reviewed_by = test.uid('阿何') from public.credentials where id = cred), 'an admin verifies a certificate';
end $$;
reset role;
do $$ begin
  assert exists (select 1 from public.notifications where user_id = test.uid('葉子') and kind = 'coach_approved'), 'approval is notified';
  assert exists (select 1 from public.notifications where user_id = test.uid('Mia 林') and kind = 'credential_reviewed'), 'certificate review is notified';
end $$;

-- ── 營運 (B7): numbers and 下架 are admin only; a page taken down disappears for visitors ──
do $$ begin perform test.login('小安'); end $$;
set role authenticated;
do $$ begin
  assert test.fails('select public.admin_stats()') = 'admins only', 'a non-admin cannot read the numbers';
  assert test.fails(format('select public.set_coach_listed(%L, false)', (select id from public.coaches where slug = 'yezi'))) = 'admins only', 'a non-admin cannot take a page down';
end $$;
reset role;
do $$ begin perform test.login('阿何'); end $$;
set role authenticated;
do $$
declare cid uuid := (select id from public.coaches where slug = 'yezi');
begin
  assert (public.admin_stats() ->> 'coaches_public')::int > 0, 'an admin reads the numbers';
  perform public.set_coach_listed(cid, false);
  assert test.fails(format('select public.set_coach_listed(%L, false)', cid)) = 'nothing to change', 'already taken down';
end $$;
reset role;
do $$ begin perform test.visitor(); end $$;
set role anon;
do $$ begin
  assert not exists (select 1 from public.coach_cards where slug = 'yezi'), 'visitors no longer see a page taken down';
end $$;
reset role;
do $$ begin perform test.login('阿何'); end $$;
set role authenticated;
do $$ begin perform public.set_coach_listed((select id from public.coaches where slug = 'yezi'), true); end $$;
reset role;
do $$ begin
  assert (select status = 'approved' from public.coaches where slug = 'yezi'), '恢復 puts it back';
  assert exists (select 1 from public.notifications where user_id = test.uid('葉子') and kind = 'coach_suspended'), 'the coach is told';
end $$;

-- ── 預約 (B5): open sessions, and an expired request stops holding its seat ──
do $$ begin perform test.visitor(); end $$;
set role anon;
do $$ begin
  assert (select count(*) from public.open_sessions('mia', 7)) > 0, 'a visitor sees the coach''s open sessions';
  assert not exists (select 1 from public.open_sessions('mia', 7) where starts_at <= now()), 'no sessions in the past';
  assert not exists (select 1 from public.open_sessions('mia', 7) s
                     where public.tpe_hhmi(s.starts_at) <> all (select jsonb_array_elements_text(c.availability -> public.tpe_weekday(s.starts_at))
                                                                from public.coaches c where c.slug = 'mia')), 'only the coach''s weekly open times';
end $$;
reset role;
do $$
declare pl uuid := (select p.id from public.coach_plans p join public.coaches c on c.id = p.coach_id where c.slug = 'mia' and p.key = 'p1');
        ts timestamptz := test.next_at('二', '19:30');
        before int;
begin
  before := public.lesson_seats_left(pl, ts);
  insert into public.lesson_bookings (coach_id, plan_id, student_id, starts_at, headcount, pay_method, amount, expires_at)
  select coach_id, pl, test.uid('小安'), ts, 1, 'cash', 1500, now() - interval '1 minute' from public.coach_plans where id = pl;
  assert public.lesson_seats_left(pl, ts) = before, 'an expired request does not hold a seat';
end $$;

-- ── 收款雙向確認 (B6): report → 還沒收到 → report again → 確認收到, each step tells the other side ──
do $$ begin perform test.login('葉子'); end $$;
set role authenticated;
do $$
declare p uuid := (select id from public.payments where payer_id = test.uid('葉子') and status = 'waiting' limit 1);
begin
  perform set_config('test.pay', p::text, false);
  perform public.report_payment(p, '11111');
end $$;
reset role;
do $$ begin perform test.login('趙柏宇'); end $$;
set role authenticated;
do $$ begin
  assert test.fails(format('select public.reject_payment_report(%L)', current_setting('test.pay'))) = 'payment not found', 'another coach cannot send it back';
end $$;
reset role;
do $$ begin perform test.login('Mia 林'); end $$;
set role authenticated;
do $$ begin perform public.reject_payment_report(current_setting('test.pay')::uuid); end $$;
reset role;
do $$ begin
  assert (select status = 'waiting' and ref_last5 is null from public.payments where id = current_setting('test.pay')::uuid), '還沒收到 puts it back to 待付款';
  assert exists (select 1 from public.notifications where user_id = test.uid('Mia 林') and kind = 'payment_reported'), 'the coach hears about the report';
  assert exists (select 1 from public.notifications where user_id = test.uid('葉子') and kind = 'payment_not_received'), 'the student hears it was not received';
end $$;
do $$ begin perform test.login('Mia 林'); end $$;
set role authenticated;
do $$ begin perform public.mark_payment_paid(current_setting('test.pay')::uuid); end $$;
reset role;
do $$ begin
  assert exists (select 1 from public.notifications where user_id = test.uid('葉子') and kind = 'payment_received'), 'the student hears it was received';
end $$;

-- LINE push (B6): only pg_cron may kick the sender
set role authenticated;
do $$ begin
  assert test.fails('select public.kick_notify()') like 'permission denied%', 'a signed-in person cannot kick the LINE sender';
end $$;
reset role;

-- Reminders (B6): the evening before, once per person, never for a cancelled game
do $$
declare b uuid := (select id from public.lesson_bookings where student_id = test.uid('小安') and status = 'confirmed' limit 1);
  g uuid := test.game('g4');
  tomorrow timestamptz := ((now() at time zone 'Asia/Taipei')::date + 1 + time '10:00') at time zone 'Asia/Taipei';
begin
  update public.lesson_bookings set starts_at = tomorrow where id = b;
  update public.games set starts_at = tomorrow, ends_at = tomorrow + interval '2 hours', cancelled_at = null where id = g;
  perform public.remind_tomorrow();
  perform public.remind_tomorrow();
  assert (select count(*) from public.notifications where user_id = test.uid('小安') and kind = 'lesson_reminder' and payload ->> 'booking_id' = b::text) = 1, 'one lesson reminder, even if the job runs twice';
  assert (select count(*) from public.notifications where kind = 'game_reminder' and payload ->> 'game_id' = g::text)
       = (select count(*) from public.game_participants where game_id = g and status = 'joined' and user_id is not null), 'every joined player gets one game reminder';
  assert (select count(*) from public.game_participants where game_id = g and status = 'joined' and user_id is not null) > 0, 'the check covers someone';
end $$;
set role authenticated;
do $$ begin
  assert test.fails('select public.remind_tomorrow()') like 'permission denied%', 'only pg_cron sends reminders';
end $$;
reset role;

-- Payment reminders with the transfer QR: the 20:00 reminder says 還沒付款 when the reader's payment waits (not cash),
-- and the coach's 提醒 button nudges once per 12 hours, only for their own waiting payments
do $$
declare b uuid := (select b.id from public.lesson_bookings b join public.coaches c on c.id = b.coach_id
                   where b.student_id = test.uid('小安') and b.status = 'confirmed' and c.slug = 'mia' limit 1);
  tomorrow timestamptz := ((now() at time zone 'Asia/Taipei')::date + 1 + time '19:30') at time zone 'Asia/Taipei';
  pay uuid;
begin
  assert b is not null, 'the check needs 小安 to have a confirmed lesson with Mia';
  update public.lesson_bookings set starts_at = tomorrow where id = b;
  insert into public.payments (booking_id, payer_id, amount, method) values (b, test.uid('小安'), 600, 'bank_transfer')
  on conflict (booking_id, payer_id) do update set status = 'waiting', method = 'bank_transfer', reported_at = null, paid_at = null, ref_last5 = null
  returning id into pay;
  perform set_config('test.duepay', pay::text, false);
  delete from public.notifications where kind = 'lesson_reminder' and payload ->> 'booking_id' = b::text;
  perform public.remind_tomorrow();
  assert (select (payload ->> 'unpaid')::boolean and payload ->> 'method' = 'bank_transfer' from public.notifications where user_id = test.uid('小安') and kind = 'lesson_reminder' and payload ->> 'booking_id' = b::text), 'an unpaid transfer is flagged in the reminder, with its method';
  -- the coach turned 自動提醒未付款 off: the reminder goes out plain
  insert into public.coach_pay_details (coach_id, remind_unpaid) select coach_id, false from public.lesson_bookings where id = b
  on conflict (coach_id) do update set remind_unpaid = false;
  delete from public.notifications where kind = 'lesson_reminder' and payload ->> 'booking_id' = b::text;
  perform public.remind_tomorrow();
  assert (select not (payload ->> 'unpaid')::boolean from public.notifications where user_id = test.uid('小安') and kind = 'lesson_reminder' and payload ->> 'booking_id' = b::text), 'with the switch off the reminder does not say 還沒付款';
  update public.coach_pay_details set remind_unpaid = true where coach_id = (select coach_id from public.lesson_bookings where id = b);
end $$;
do $$ begin perform test.login('趙柏宇'); end $$;
set role authenticated;
do $$ begin
  assert test.fails(format('select public.remind_payment(%L)', current_setting('test.duepay'))) = 'payment not found', 'another coach cannot nudge the student';
end $$;
reset role;
do $$ begin perform test.login('Mia 林'); end $$;
set role authenticated;
do $$ begin
  perform public.remind_payment(current_setting('test.duepay')::uuid);
  assert test.fails(format('select public.remind_payment(%L)', current_setting('test.duepay'))) = '12 小時內已經提醒過這位學生', 'one nudge per 12 hours';
end $$;
reset role;
do $$ begin
  assert exists (select 1 from public.notifications where user_id = test.uid('小安') and kind = 'payment_due' and payload ->> 'payment_id' = current_setting('test.duepay')), 'the student gets the nudge';
  update public.payments set status = 'paid', paid_at = now() where id = current_setting('test.duepay')::uuid;
end $$;
