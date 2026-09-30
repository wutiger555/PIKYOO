-- PIKYOO initial schema: profiles, courts, games, coaches, lessons, groups, Q&A, payments, notifications.
-- Design notes live in docs/BACKEND.md §4. Rules that must hold under concurrency (seats, waitlist, group minimums)
-- run in security-definer functions (RPC); tables are read through RLS and written directly only where a row belongs
-- to one person. All times are timestamptz (UTC); the app shows them in Asia/Taipei.

-- ─────────────────────────────── enums ───────────────────────────────

create type public.court_kind as enum ('indoor', 'outdoor', 'covered');                 -- 室內 / 室外 / 風雨
create type public.booking_method as enum ('public_system', 'website', 'line', 'phone', 'walk_in');
create type public.participant_status as enum ('joined', 'waitlisted', 'cancelled', 'late_cancelled', 'attended', 'no_show');
create type public.coach_status as enum ('draft', 'pending', 'approved', 'suspended');
create type public.lesson_kind as enum ('trial', 'private', 'small', 'group');           -- 體驗課 / 一對一 / 小班 / 團體
create type public.plan_unit as enum ('per_person', 'per_lesson', 'per_pack');           -- /人 · /堂 · /10 堂
create type public.pay_method as enum ('line_pay', 'bank_transfer', 'cash');
create type public.lesson_booking_status as enum ('pending', 'confirmed', 'declined', 'expired', 'cancelled', 'attended', 'no_show');
create type public.lesson_group_status as enum ('gathering', 'requested', 'confirmed', 'declined', 'expired', 'cancelled');
create type public.payment_status as enum ('waiting', 'reported', 'paid', 'refunded');
create type public.credential_type as enum ('coach_cert', 'dupr', 'tournament');
create type public.verify_status as enum ('self_reported', 'pending', 'verified', 'rejected');

-- ─────────────────────────────── helpers ───────────────────────────────

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

/** Which kind of private contact detail a text carries, or null. Port of web/src/lib/contact.ts — keep the two in sync. */
create function public.contact_kind(t text) returns text language sql immutable as $$
  select case
    when t ~ '\d[\d\s-]{6,}\d' then '電話號碼'
    when t ~* '[\w.+-]+@[\w-]+\.[a-z]{2,}' then 'Email'
    when t ~* '(line|賴|ig|instagram|wechat|微信)\s*(id)?\s*[:：@]' then 'LINE／IG 帳號'
    when t ~* '加\s*(我|一下)?\s*(的)?\s*(line|賴|好友|ig|instagram|微信)' then 'LINE／IG 帳號'
    when t ~* '(私訊|私下|直接找我|dm\s*我)' then '私下聯絡'
  end
$$;

create function public.assert_no_contact(t text) returns void language plpgsql immutable as $$
declare k text := public.contact_kind(t);
begin
  if k is not null then
    raise exception using errcode = 'P0001', message = 'contact_detail', detail = k,
      hint = format('請不要留%s。為了保障雙方，預約前後的聯絡都在 PIKYOO 裡進行。', k);
  end if;
end $$;

/** Local wall-clock parts in Asia/Taipei: weekday as the UI writes it (一…日) and HH:MI. */
create function public.tpe_weekday(ts timestamptz) returns text language sql immutable as $$
  select (array['一','二','三','四','五','六','日'])[extract(isodow from ts at time zone 'Asia/Taipei')::int]
$$;
create function public.tpe_hhmi(ts timestamptz) returns text language sql immutable as $$
  select to_char(ts at time zone 'Asia/Taipei', 'HH24:MI')
$$;

-- ─────────────────────────────── people ───────────────────────────────

/** Public part of a person: everyone can read it (names on rosters, coach pages). Nothing private goes here. */
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 30),
  avatar_url text,
  /** index into LEVELS: 0 新手 · 1 2.0 · 2 2.5 · 3 3.0 · 4 3.5 · 5 4.0 · 6 4.5+ (web/src/lib/format.ts) */
  level smallint check (level between 0 and 6),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

/** Private part: only the owner reads it. line_user_id and is_admin are written by the server (secret key) only. */
create table public.profile_private (
  id uuid primary key references public.profiles (id) on delete cascade,
  /** LINE user id for our provider (docs/SETUP.md §3.1). Never shown to other users. */
  line_user_id text unique,
  is_admin boolean not null default false,
  /** 常打區域, e.g. {大安區,信義區} */
  home_districts text[] not null default '{}',
  onboarded_at timestamptz,
  notify jsonb not null default '{"line": true, "email": true}',
  created_at timestamptz not null default now()
);

create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_admin from public.profile_private p where p.id = (select auth.uid())), false)
$$;

/** The server itself: a direct database connection (migrations, seed, SQL editor) or the secret key; or an admin.
 *  The guards below let these through and hold everyone else to the rules. */
create function public.is_trusted() returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_admin()
      or coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', 'service_role') = 'service_role'
$$;

/** Every new auth user gets a profile; the LINE / email sign-in fills in the name. */
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'name', ''), 30), new.raw_user_meta_data ->> 'avatar_url');
  insert into public.profile_private (id, line_user_id) values (new.id, new.raw_user_meta_data ->> 'line_user_id');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ─────────────────────────────── courts ───────────────────────────────

create table public.courts (
  id uuid primary key default gen_random_uuid(),
  /** URL key, /courts/[slug] */
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  city text not null check (city in ('台北市', '新北市')),
  district text not null,
  address text not null,
  lat double precision,
  lng double precision,
  kind public.court_kind not null,
  court_count smallint not null check (court_count > 0),
  surface text not null default '',
  is_free boolean not null default false,
  price_note text not null default '',
  hours_note text not null default '',
  amenities text[] not null default '{}',
  has_aircon boolean not null default false,
  has_lights boolean not null default false,
  booking_method public.booking_method not null,
  booking_url text,
  booking_note text not null default '',
  rules text not null default '',
  /** [{path, alt}] in the court-photos bucket, first is the cover */
  photos jsonb not null default '[]',
  /** PIKYOO 已確認: set by the ops team after checking on site or by phone */
  verified_at date,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────── games (揪團球局) ───────────────────────────────

create table public.games (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id),
  court_id uuid references public.courts (id),
  /** venue name when the court isn't in the database (or a sub-venue note when it is) */
  location_text text not null default '',
  address text not null default '',
  district text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  level_min smallint not null check (level_min between 0 and 6),
  level_max smallint not null check (level_max between 0 and 6),
  strict_level boolean not null default false,
  capacity smallint not null check (capacity between 2 and 64),
  /** the host takes one of the seats */
  host_counts boolean not null default true,
  fee integer not null default 0 check (fee >= 0),
  fee_note text not null default '',
  cancel_hours smallint not null default 12 check (cancel_hours between 0 and 72),
  beginner_friendly boolean not null default false,
  notes text not null default '' check (char_length(notes) <= 1000),
  /** pickup-game hosts may give a LINE contact (CLAUDE.md, product decisions) */
  host_contact text not null default '',
  /** AI 一貼成局: the pasted original, kept for parser tuning */
  source_text text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (level_min <= level_max),
  check (court_id is not null or location_text <> '')
);
create index games_starts_at on public.games (starts_at) where cancelled_at is null;

create table public.game_participants (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  /** null for a guest the host added by name (代報名) */
  user_id uuid references public.profiles (id),
  guest_name text check (char_length(guest_name) <= 30),
  added_by uuid references public.profiles (id),
  status public.participant_status not null,
  /** also the waitlist order */
  joined_at timestamptz not null default now(),
  cancelled_at timestamptz,
  attendance_marked_at timestamptz,
  check ((user_id is null) <> (guest_name is null))
);
create unique index game_participants_user on public.game_participants (game_id, user_id) where user_id is not null;
create index game_participants_game on public.game_participants (game_id, status, joined_at);

-- ─────────────────────────────── coaches ───────────────────────────────

create table public.coaches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id),
  /** 個人網址 /coaches/[slug] */
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,30}$'),
  /** public coach name, e.g. Mia 林 (may differ from the profile nickname) */
  name text not null check (char_length(name) between 1 and 30),
  status public.coach_status not null default 'draft',
  tagline text not null default '' check (char_length(tagline) <= 60),
  bio text not null default '' check (char_length(bio) <= 1500),
  /** 授課區域 without 區, e.g. {大安,信義} (as the cards show them) */
  areas text[] not null default '{}',
  level_min smallint not null default 0 check (level_min between 0 and 6),
  level_max smallint not null default 6 check (level_max between 0 and 6),
  style text[] not null default '{}',
  beginner_friendly boolean not null default false,
  /** year they started coaching pickleball; 教學年資 is derived */
  coaching_since smallint,
  reply_note text not null default '',
  /** 匹克球檔案 {since, hand, format, background, strengths[]} */
  play jsonb not null default '{}',
  audience text[] not null default '{}',
  languages text[] not null default '{中文}',
  /** weekly open start times (F5-4), {"六": ["09:00", "14:00"], …} */
  availability jsonb not null default '{}',
  /** [{name, sub, court_id?}] */
  venues jsonb not null default '[]',
  steps text[] not null default '{}',
  pay_methods public.pay_method[] not null default '{bank_transfer,cash}',
  policy text not null default '',
  /** [{path, alt, caption?}] in the coach-photos bucket; first is the cover */
  photos jsonb not null default '[]',
  /** 經歷 [{year, text, kind}] */
  timeline jsonb not null default '[]',
  /** coach-picked student quotes [{name, level, text}] until reviews exist */
  quotes jsonb not null default '[]',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (level_min <= level_max)
);

/** 收款資訊 (LINE Pay link, bank account): only the coach, and a student who owes a payment (payment_instructions()). */
create table public.coach_pay_details (
  coach_id uuid primary key references public.coaches (id) on delete cascade,
  details jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create function public.my_coach_id() returns uuid language sql stable security definer set search_path = '' as $$
  select c.id from public.coaches c where c.profile_id = (select auth.uid())
$$;

create table public.credentials (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches (id) on delete cascade,
  type public.credential_type not null,
  /** 協會 / 總會 / PPR / IPTPA / DUPR / TMLP … */
  issuer text not null,
  /** 認證教練 / 丙級教練 / Level 1 / 4.21 … */
  level text not null default '',
  identifier text,
  /** certificate scan in the private credentials bucket */
  document_path text,
  status public.verify_status not null default 'pending',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

/** 方案: what a student books. The UI calls these plans; PRD §7 calls them classes. */
create table public.coach_plans (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches (id) on delete cascade,
  /** short key inside the coach, e.g. trial, p1 */
  key text not null check (key ~ '^[a-z0-9-]{1,20}$'),
  name text not null check (char_length(name) <= 20),
  kind public.lesson_kind not null,
  duration_min smallint not null check (duration_min between 15 and 300),
  /** 2–4 人 */
  size_label text not null default '',
  /** seats in one session */
  capacity smallint not null default 1 check (capacity between 1 and 30),
  /** 可揪朋友一起上: headcount range; null = book alone */
  group_min smallint,
  group_max smallint,
  price integer not null check (price >= 0),
  unit public.plan_unit not null,
  note text not null default '',
  tag text,
  sort smallint not null default 0,
  archived_at timestamptz,
  unique (coach_id, key),
  check ((group_min is null) = (group_max is null)),
  check (group_min is null or (group_min between 2 and group_max and group_max <= capacity))
);

-- ─────────────────────────────── lessons: bookings, groups, payments ───────────────────────────────

/** 揪朋友一起上: an organiser holds a session and gathers friends until the plan's minimum. */
create table public.lesson_groups (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches (id),
  plan_id uuid not null references public.coach_plans (id),
  starts_at timestamptz not null,
  organizer_id uuid not null references public.profiles (id),
  invite_code text not null unique default left(replace(gen_random_uuid()::text, '-', ''), 12),
  status public.lesson_group_status not null default 'gathering',
  note text not null default '',
  /** not full by then → expired, everyone notified */
  deadline_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.lesson_group_members (
  group_id uuid not null references public.lesson_groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.lesson_bookings (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches (id),
  plan_id uuid not null references public.coach_plans (id),
  student_id uuid not null references public.profiles (id),
  group_id uuid unique references public.lesson_groups (id),
  starts_at timestamptz not null,
  headcount smallint not null default 1 check (headcount between 1 and 30),
  note text not null default '' check (char_length(note) <= 500),
  pay_method public.pay_method not null,
  amount integer not null check (amount >= 0),
  status public.lesson_booking_status not null default 'pending',
  /** 48 h to decide (PRD §6.3), or the start time if sooner */
  expires_at timestamptz not null,
  decided_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);
create index lesson_bookings_slot on public.lesson_bookings (coach_id, starts_at) where status in ('pending', 'confirmed');

/** MVP: money goes straight to the coach (LINE Pay link / transfer / cash); the student reports, the coach ticks it off. */
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.lesson_bookings (id) on delete cascade,
  payer_id uuid not null references public.profiles (id),
  amount integer not null check (amount >= 0),
  method public.pay_method not null,
  status public.payment_status not null default 'waiting',
  /** last five digits of a bank transfer */
  ref_last5 text check (ref_last5 ~ '^\d{5}$'),
  reported_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (booking_id, payer_id)
);

-- ─────────────────────────────── Q&A, favourites, reports, notifications ───────────────────────────────

/** 問與答 (PRD F3-11): public once answered; until then only the asker and the coach see it. */
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches (id) on delete cascade,
  asker_id uuid not null references public.profiles (id),
  text text not null check (char_length(text) between 2 and 300),
  answer text check (char_length(answer) <= 600),
  answered_at timestamptz,
  hidden_at timestamptz,
  created_at timestamptz not null default now()
);
create index questions_coach on public.questions (coach_id, created_at);

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('coach', 'court', 'game')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id),
  target_type text not null check (target_type in ('court', 'game', 'coach', 'question', 'profile')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 2 and 500),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

/** Outbox: functions enqueue, a worker (Vercel cron / Edge Function) sends over LINE / email and marks the row. */
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}',
  channel text not null check (channel in ('line', 'email', 'in_app')),
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  attempts smallint not null default 0,
  error text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index notifications_queue on public.notifications (created_at) where status = 'queued';
create index notifications_user on public.notifications (user_id, created_at desc);

create function public.notify(p_user uuid, p_kind text, p_payload jsonb, p_channel text default 'line') returns void
language sql security definer set search_path = '' as $$
  insert into public.notifications (user_id, kind, payload, channel) values (p_user, p_kind, p_payload, p_channel)
$$;

-- ─────────────────────────────── updated_at ───────────────────────────────

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger courts_touch before update on public.courts for each row execute function public.touch_updated_at();
create trigger games_touch before update on public.games for each row execute function public.touch_updated_at();
create trigger coaches_touch before update on public.coaches for each row execute function public.touch_updated_at();

-- ─────────────────────────────── guards (what RLS can't express per column) ───────────────────────────────

/** Coaches can't approve themselves: only draft → pending is theirs; status, owner and approval belong to admins. */
create function public.coaches_guard() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_trusted() then return new; end if;
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'pending') then raise exception 'coach status is set by PIKYOO'; end if;
    new.approved_at := null;
    return new;
  end if;
  if new.profile_id <> old.profile_id or new.approved_at is distinct from old.approved_at
     or (new.status <> old.status and not (old.status = 'draft' and new.status = 'pending')) then
    raise exception 'coach status is set by PIKYOO';
  end if;
  return new;
end $$;
create trigger coaches_guard before insert or update on public.coaches for each row execute function public.coaches_guard();

/** A coach uploads credentials; only admins verify them. DUPR stays self-reported until the DUPR integration. */
create function public.credentials_guard() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_trusted() then return new; end if;
  if tg_op = 'UPDATE' and (old.status in ('verified', 'rejected') or new.coach_id <> old.coach_id) then
    raise exception 'reviewed credentials are locked';
  end if;
  new.status := case when new.type = 'dupr' then 'self_reported'::public.verify_status else 'pending'::public.verify_status end;
  new.reviewed_by := null;
  new.reviewed_at := null;
  return new;
end $$;
create trigger credentials_guard before insert or update on public.credentials for each row execute function public.credentials_guard();

/** Questions: no contact details (F3-11). Askers can only write the question; answers go through answer_question(). */
create function public.questions_guard() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.assert_no_contact(new.text);
  if tg_op = 'INSERT' and not public.is_trusted() then
    new.answer := null; new.answered_at := null; new.hidden_at := null;
  end if;
  return new;
end $$;
create trigger questions_guard before insert on public.questions for each row execute function public.questions_guard();

/** Hosts edit their game directly; seat counts and the host itself can't be edited that way. */
create function public.games_guard() returns trigger language plpgsql security definer set search_path = '' as $$
declare taken int;
begin
  if tg_op = 'UPDATE' then
    if new.host_id <> old.host_id and not public.is_trusted() then raise exception 'host cannot be changed'; end if;
    select count(*) into taken from public.game_participants where game_id = new.id and status = 'joined';
    if new.capacity < taken then raise exception 'capacity below joined count (%)', taken; end if;
  end if;
  return new;
end $$;
create trigger games_guard before update on public.games for each row execute function public.games_guard();

-- ─────────────────────────────── games: RPC ───────────────────────────────

/** Moves waitlisted players up while there are free seats; returns how many were promoted. */
create function public.promote_waitlist(p_game uuid) returns int language plpgsql security definer set search_path = '' as $$
declare g public.games; free int; n int := 0; r record;
begin
  select * into g from public.games where id = p_game;
  if g.cancelled_at is not null or g.starts_at <= now() then return 0; end if;
  select g.capacity - count(*) into free from public.game_participants where game_id = p_game and status = 'joined';
  for r in select id, user_id from public.game_participants
           where game_id = p_game and status = 'waitlisted' order by joined_at limit greatest(free, 0) loop
    update public.game_participants set status = 'joined' where id = r.id;
    -- TODO(B3): under 3 h before start this should be a 30-minute invite instead (PRD §6.2)
    if r.user_id is not null then
      perform public.notify(r.user_id, 'game_promoted', jsonb_build_object('game_id', p_game));
    end if;
    n := n + 1;
  end loop;
  return n;
end $$;

create function public.games_after_insert() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.host_counts then
    insert into public.game_participants (game_id, user_id, added_by, status) values (new.id, new.host_id, new.host_id, 'joined');
  end if;
  return new;
end $$;
create trigger games_after_insert after insert on public.games for each row execute function public.games_after_insert();

create function public.games_after_capacity() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.promote_waitlist(new.id);
  return new;
end $$;
create trigger games_after_capacity after update of capacity on public.games
  for each row when (new.capacity > old.capacity) execute function public.games_after_capacity();

/** 報名: a seat if one is free, otherwise the waitlist. Re-joining after cancelling reuses the row. */
create function public.join_game(p_game uuid) returns public.participant_status
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); g public.games; taken int; st public.participant_status; cur public.participant_status;
begin
  if me is null then raise exception 'sign in first' using errcode = '28000'; end if;
  select * into g from public.games where id = p_game for update;
  if not found then raise exception 'game not found'; end if;
  if g.cancelled_at is not null then raise exception 'game cancelled'; end if;
  if g.starts_at <= now() then raise exception 'game already started'; end if;
  if g.strict_level then
    if not exists (select 1 from public.profiles p where p.id = me and p.level between g.level_min and g.level_max) then
      raise exception 'level outside this game''s range';
    end if;
  end if;
  select status into cur from public.game_participants where game_id = p_game and user_id = me;
  if cur in ('joined', 'waitlisted') then return cur; end if;
  select count(*) into taken from public.game_participants where game_id = p_game and status = 'joined';
  st := case when taken < g.capacity then 'joined' else 'waitlisted' end;
  insert into public.game_participants (game_id, user_id, added_by, status) values (p_game, me, me, st)
  on conflict (game_id, user_id) where user_id is not null
  do update set status = excluded.status, joined_at = now(), cancelled_at = null;
  return st;
end $$;

/** 取消報名: free before the host's cancel window, late_cancelled after it; the waitlist moves up. */
create function public.leave_game(p_game uuid) returns public.participant_status
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); g public.games; cur public.participant_status; st public.participant_status;
begin
  select * into g from public.games where id = p_game for update;
  if not found then raise exception 'game not found'; end if;
  if g.host_id = me then raise exception 'hosts cancel the game instead'; end if;
  select status into cur from public.game_participants where game_id = p_game and user_id = me;
  if cur is null or cur not in ('joined', 'waitlisted') then raise exception 'not registered'; end if;
  st := case when cur = 'joined' and now() > g.starts_at - make_interval(hours => g.cancel_hours) then 'late_cancelled' else 'cancelled' end;
  update public.game_participants set status = st, cancelled_at = now() where game_id = p_game and user_id = me;
  if cur = 'joined' then perform public.promote_waitlist(p_game); end if;
  return st;
end $$;

/** 代報名: the host adds someone who isn't on PIKYOO. */
create function public.host_add_guest(p_game uuid, p_name text) returns public.participant_status
language plpgsql security definer set search_path = '' as $$
declare g public.games; taken int; st public.participant_status;
begin
  select * into g from public.games where id = p_game for update;
  if not found or g.host_id <> auth.uid() then raise exception 'only the host can add people'; end if;
  if g.cancelled_at is not null then raise exception 'game cancelled'; end if;
  select count(*) into taken from public.game_participants where game_id = p_game and status = 'joined';
  st := case when taken < g.capacity then 'joined' else 'waitlisted' end;
  insert into public.game_participants (game_id, guest_name, added_by, status) values (p_game, left(trim(p_name), 30), auth.uid(), st);
  return st;
end $$;

create function public.host_remove_participant(p_participant uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare gp public.game_participants; g public.games;
begin
  select * into gp from public.game_participants where id = p_participant;
  select * into g from public.games where id = gp.game_id for update;
  if not found or g.host_id <> auth.uid() then raise exception 'only the host can remove people'; end if;
  if gp.user_id = g.host_id then raise exception 'the host cannot be removed'; end if;
  update public.game_participants set status = 'cancelled', cancelled_at = now() where id = p_participant;
  if gp.user_id is not null then perform public.notify(gp.user_id, 'game_removed', jsonb_build_object('game_id', g.id)); end if;
  if gp.status = 'joined' then perform public.promote_waitlist(g.id); end if;
end $$;

create function public.cancel_game(p_game uuid) returns void language plpgsql security definer set search_path = '' as $$
declare g public.games; r record;
begin
  select * into g from public.games where id = p_game for update;
  if not found or (g.host_id <> auth.uid() and not public.is_admin()) then raise exception 'only the host can cancel'; end if;
  if g.cancelled_at is not null then return; end if;
  update public.games set cancelled_at = now() where id = p_game;
  for r in select user_id from public.game_participants
           where game_id = p_game and status in ('joined', 'waitlisted') and user_id is not null and user_id <> g.host_id loop
    perform public.notify(r.user_id, 'game_cancelled', jsonb_build_object('game_id', p_game));
  end loop;
end $$;

-- ─────────────────────────────── lessons: RPC ───────────────────────────────

/** Seats left in one of a coach's sessions for a plan. A session belongs to the first plan booked into it;
 *  a gathering group holds as many seats as it has members. */
create function public.lesson_seats_left(p_plan uuid, p_starts_at timestamptz) returns int
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
       + coalesce((select count(*) from public.lesson_group_members m join public.lesson_groups lg on lg.id = m.group_id
                    where lg.plan_id = p_plan and lg.starts_at = p_starts_at and lg.status = 'gathering'), 0)
    into used;
  return greatest(pl.capacity - used, 0);
end $$;

/** Checks that a session exists (the coach publishes that weekday + time) and returns the plan's coach row. */
create function public.assert_session(p_plan uuid, p_starts_at timestamptz) returns public.coaches
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
  return c;
end $$;

/** 送出預約申請 (F3-7): pending until the coach answers, 48 h at most. */
create function public.request_booking(p_plan uuid, p_starts_at timestamptz, p_headcount int, p_note text, p_pay public.pay_method)
returns uuid language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); c public.coaches; pl public.coach_plans; v_id uuid;
begin
  if me is null then raise exception 'sign in first' using errcode = '28000'; end if;
  c := public.assert_session(p_plan, p_starts_at);
  if c.profile_id = me then raise exception 'coaches cannot book themselves'; end if;
  select * into pl from public.coach_plans where coach_plans.id = p_plan;
  if not (p_pay = any (c.pay_methods)) then raise exception 'coach does not take this payment method'; end if;
  perform pg_advisory_xact_lock(hashtext(c.id::text || p_starts_at::text));
  if p_headcount < 1 or public.lesson_seats_left(p_plan, p_starts_at) < p_headcount then raise exception 'not enough seats'; end if;
  insert into public.lesson_bookings (coach_id, plan_id, student_id, starts_at, headcount, note, pay_method, amount, expires_at)
  values (c.id, p_plan, me, p_starts_at, p_headcount, coalesce(p_note, ''), p_pay,
          pl.price * case when pl.unit = 'per_person' then p_headcount else 1 end,
          least(now() + interval '48 hours', p_starts_at))
  returning lesson_bookings.id into v_id;
  perform public.notify(c.profile_id, 'booking_requested', jsonb_build_object('booking_id', v_id));
  return v_id;
end $$;

/** 教練確認／婉拒 (F5-5). Confirming opens one payment row per person (a group splits the bill). */
create function public.decide_booking(p_booking uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare b public.lesson_bookings; pl public.coach_plans; each_amount int; r record;
begin
  select * into b from public.lesson_bookings where id = p_booking for update;
  if not found or b.coach_id is distinct from public.my_coach_id() then raise exception 'not your booking'; end if;
  if b.status <> 'pending' or b.expires_at <= now() then raise exception 'booking is no longer pending'; end if;
  update public.lesson_bookings set status = case when p_accept then 'confirmed'::public.lesson_booking_status else 'declined' end,
    decided_at = now() where id = p_booking;
  if b.group_id is not null then
    update public.lesson_groups set status = case when p_accept then 'confirmed'::public.lesson_group_status else 'declined' end where id = b.group_id;
  end if;
  select * into pl from public.coach_plans where id = b.plan_id;
  each_amount := case when b.group_id is not null and pl.unit = 'per_person' then pl.price else b.amount end;
  for r in select b.student_id as uid where b.group_id is null
           union select m.user_id from public.lesson_group_members m where m.group_id = b.group_id loop
    if p_accept then
      insert into public.payments (booking_id, payer_id, amount, method) values (p_booking, r.uid, each_amount, b.pay_method);
    end if;
    perform public.notify(r.uid, case when p_accept then 'booking_confirmed' else 'booking_declined' end, jsonb_build_object('booking_id', p_booking));
  end loop;
end $$;

create function public.cancel_booking(p_booking uuid) returns void language plpgsql security definer set search_path = '' as $$
declare b public.lesson_bookings; c public.coaches;
begin
  select * into b from public.lesson_bookings where id = p_booking for update;
  if not found or b.student_id <> auth.uid() then raise exception 'not your booking'; end if;
  if b.status not in ('pending', 'confirmed') then raise exception 'booking already closed'; end if;
  -- the coach's cancel policy (late fee) is applied by hand for now; see docs/BACKEND.md §8
  update public.lesson_bookings set status = 'cancelled', cancelled_at = now() where id = p_booking;
  if b.group_id is not null then update public.lesson_groups set status = 'cancelled' where id = b.group_id; end if;
  select * into c from public.coaches where id = b.coach_id;
  perform public.notify(c.profile_id, 'booking_cancelled', jsonb_build_object('booking_id', p_booking));
end $$;

/** 揪朋友一起上 (F3-10) step 1: hold the session and get an invite code. */
create function public.create_lesson_group(p_plan uuid, p_starts_at timestamptz, p_note text)
returns public.lesson_groups language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); c public.coaches; pl public.coach_plans; g public.lesson_groups;
begin
  if me is null then raise exception 'sign in first' using errcode = '28000'; end if;
  c := public.assert_session(p_plan, p_starts_at);
  select * into pl from public.coach_plans where id = p_plan;
  if pl.group_min is null then raise exception 'this plan is booked alone'; end if;
  perform pg_advisory_xact_lock(hashtext(c.id::text || p_starts_at::text));
  if public.lesson_seats_left(p_plan, p_starts_at) < 1 then raise exception 'not enough seats'; end if;
  insert into public.lesson_groups (coach_id, plan_id, starts_at, organizer_id, note, deadline_at)
  values (c.id, p_plan, p_starts_at, me, coalesce(p_note, ''), greatest(p_starts_at - interval '24 hours', now() + interval '1 hour'))
  returning * into g;
  insert into public.lesson_group_members (group_id, user_id) values (g.id, me);
  return g;
end $$;

/** Invite page: anyone with the link sees who is in and what's booked (no ids beyond the group's). */
create function public.lesson_group_by_code(p_code text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', g.id, 'status', g.status, 'starts_at', g.starts_at, 'deadline_at', g.deadline_at, 'note', g.note,
    'coach', jsonb_build_object('slug', c.slug, 'name', c.name),
    'plan', jsonb_build_object('key', pl.key, 'name', pl.name, 'price', pl.price, 'unit', pl.unit, 'group_min', pl.group_min, 'group_max', pl.group_max),
    'members', (select coalesce(jsonb_agg(jsonb_build_object('name', p.display_name, 'avatar_url', p.avatar_url, 'organizer', m.user_id = g.organizer_id) order by m.joined_at), '[]')
                from public.lesson_group_members m join public.profiles p on p.id = m.user_id where m.group_id = g.id))
  from public.lesson_groups g join public.coaches c on c.id = g.coach_id join public.coach_plans pl on pl.id = g.plan_id
  where g.invite_code = p_code
$$;

create function public.join_lesson_group(p_code text) returns uuid language plpgsql security definer set search_path = '' as $$
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
  if n >= pl.group_max or public.lesson_seats_left(g.plan_id, g.starts_at) < 1 then raise exception 'group is full'; end if;
  insert into public.lesson_group_members (group_id, user_id) values (g.id, me);
  perform public.notify(g.organizer_id, 'group_joined', jsonb_build_object('group_id', g.id), 'in_app');
  return g.id;
end $$;

create function public.leave_lesson_group(p_group uuid) returns void language plpgsql security definer set search_path = '' as $$
declare g public.lesson_groups;
begin
  select * into g from public.lesson_groups where id = p_group for update;
  if not found or g.status <> 'gathering' then raise exception 'group is not gathering'; end if;
  if g.organizer_id = auth.uid() then
    update public.lesson_groups set status = 'cancelled' where id = p_group;
  else
    delete from public.lesson_group_members where group_id = p_group and user_id = auth.uid();
  end if;
end $$;

/** 人數到了 → one booking request for the whole group. */
create function public.submit_lesson_group(p_group uuid, p_pay public.pay_method) returns uuid
language plpgsql security definer set search_path = '' as $$
declare g public.lesson_groups; pl public.coach_plans; c public.coaches; n int; v_id uuid;
begin
  select * into g from public.lesson_groups where id = p_group for update;
  if not found or g.organizer_id <> auth.uid() then raise exception 'only the organiser can send it'; end if;
  if g.status <> 'gathering' then raise exception 'group already sent'; end if;
  select * into pl from public.coach_plans where id = g.plan_id;
  select * into c from public.coaches where id = g.coach_id;
  if not (p_pay = any (c.pay_methods)) then raise exception 'coach does not take this payment method'; end if;
  select count(*) into n from public.lesson_group_members where group_id = g.id;
  if n < pl.group_min then raise exception 'need % people, have %', pl.group_min, n; end if;
  update public.lesson_groups set status = 'requested' where id = p_group;
  insert into public.lesson_bookings (coach_id, plan_id, student_id, group_id, starts_at, headcount, note, pay_method, amount, expires_at)
  values (g.coach_id, g.plan_id, g.organizer_id, g.id, g.starts_at, n, g.note, p_pay,
          pl.price * case when pl.unit = 'per_person' then n else 1 end, least(now() + interval '48 hours', g.starts_at))
  returning lesson_bookings.id into v_id;
  perform public.notify(c.profile_id, 'booking_requested', jsonb_build_object('booking_id', v_id));
  return v_id;
end $$;

/** 回報已付款: the student reports (with the transfer's last five digits); the coach then marks it paid. */
create function public.report_payment(p_payment uuid, p_last5 text) returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.payments set status = 'reported', reported_at = now(), ref_last5 = nullif(p_last5, '')
  where id = p_payment and payer_id = auth.uid() and status = 'waiting';
  if not found then raise exception 'payment not found'; end if;
end $$;

create function public.mark_payment_paid(p_payment uuid) returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.payments p set status = 'paid', paid_at = now()
  from public.lesson_bookings b
  where p.id = p_payment and b.id = p.booking_id and b.coach_id = public.my_coach_id() and p.status in ('waiting', 'reported');
  if not found then raise exception 'payment not found'; end if;
end $$;

/** What a student sees after the coach confirms: amount, method and the coach's details for that method. */
create function public.payment_instructions(p_payment uuid) returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('amount', p.amount, 'method', p.method, 'status', p.status, 'details', d.details -> (p.method::text))
  from public.payments p join public.lesson_bookings b on b.id = p.booking_id
  left join public.coach_pay_details d on d.coach_id = b.coach_id
  where p.id = p_payment and p.payer_id = (select auth.uid())
$$;

/** 問與答: only the coach answers; the same contact rule applies to the answer. */
create function public.answer_question(p_question uuid, p_answer text) returns void language plpgsql security definer set search_path = '' as $$
declare q public.questions;
begin
  perform public.assert_no_contact(p_answer);
  update public.questions set answer = p_answer, answered_at = now()
  where id = p_question and coach_id = public.my_coach_id() returning * into q;
  if not found then raise exception 'question not found'; end if;
  perform public.notify(q.asker_id, 'question_answered', jsonb_build_object('question_id', q.id));
end $$;

create function public.hide_question(p_question uuid, p_hidden boolean) returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.questions set hidden_at = case when p_hidden then now() end
  where id = p_question and (coach_id = public.my_coach_id() or public.is_admin());
  if not found then raise exception 'question not found'; end if;
end $$;

create function public.questions_after_insert() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.notify((select c.profile_id from public.coaches c where c.id = new.coach_id), 'question_asked', jsonb_build_object('question_id', new.id));
  return new;
end $$;
create trigger questions_after_insert after insert on public.questions for each row execute function public.questions_after_insert();

/** Housekeeping, run every few minutes by pg_cron (docs/BACKEND.md §6): expire unanswered bookings and unfilled groups. */
create function public.expire_stale() returns void language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  for r in update public.lesson_bookings set status = 'expired' where status = 'pending' and expires_at <= now()
           returning id, student_id, group_id loop
    perform public.notify(r.student_id, 'booking_expired', jsonb_build_object('booking_id', r.id));
    if r.group_id is not null then update public.lesson_groups set status = 'expired' where id = r.group_id; end if;
  end loop;
  for r in update public.lesson_groups set status = 'expired' where status = 'gathering' and deadline_at <= now() returning id loop
    perform public.notify(m.user_id, 'group_expired', jsonb_build_object('group_id', r.id))
    from public.lesson_group_members m where m.group_id = r.id;
  end loop;
end $$;

/** 刪除帳號 (F1-5): the profile stays as 已刪除使用者 so rosters and bookings keep their history. */
create function public.delete_my_account() returns void language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'sign in first' using errcode = '28000'; end if;
  update public.profiles set display_name = '已刪除使用者', avatar_url = null, level = null, deleted_at = now() where id = me;
  update public.profile_private set line_user_id = null, home_districts = '{}', notify = '{}' where id = me;
  delete from public.favorites where user_id = me;
  update public.game_participants gp set status = 'cancelled', cancelled_at = now()
  from public.games g where g.id = gp.game_id and gp.user_id = me and gp.status in ('joined', 'waitlisted') and g.starts_at > now();
  -- the route handler then bans the auth user with the secret key so the LINE identity can sign up fresh
end $$;

-- ─────────────────────────────── read models ───────────────────────────────

/** Game list / detail: counts and host name in one row. Runs with the caller's rights. */
create view public.game_cards with (security_invoker = true) as
select g.*,
  p.display_name as host_name,
  p.avatar_url as host_avatar_url,
  c.slug as court_slug, c.name as court_name, c.kind as court_kind, c.court_count,
  (select count(*) from public.game_participants x where x.game_id = g.id and x.status = 'joined')::int as joined_count,
  (select count(*) from public.game_participants x where x.game_id = g.id and x.status = 'waitlisted')::int as waitlist_count,
  (select count(*) from public.games h where h.host_id = g.host_id and h.cancelled_at is null)::int as host_game_count
from public.games g
join public.profiles p on p.id = g.host_id
left join public.courts c on c.id = g.court_id;

/** Coach list: facts the cards filter and sort on. Student counts are aggregates only (bookings stay private). */
create function public.coach_stats() returns table (coach_id uuid, students int, lessons int)
language sql stable security definer set search_path = '' as $$
  select b.coach_id, count(distinct coalesce(m.user_id, b.student_id))::int, count(distinct b.id)::int
  from public.lesson_bookings b left join public.lesson_group_members m on m.group_id = b.group_id
  where b.status in ('confirmed', 'attended')
  group by b.coach_id
$$;

create view public.coach_cards with (security_invoker = true) as
select c.*,
  (select min(pl.price) from public.coach_plans pl where pl.coach_id = c.id and pl.archived_at is null
     and pl.unit <> 'per_pack') as price_from,
  (select coalesce(array_agg(distinct pl.kind), '{}') from public.coach_plans pl where pl.coach_id = c.id and pl.archived_at is null) as kinds,
  exists (select 1 from public.credentials cr where cr.coach_id = c.id and cr.status = 'verified' and cr.type = 'coach_cert') as certified,
  coalesce((select s.students from public.coach_stats() s where s.coach_id = c.id), 0) as students
from public.coaches c;

-- ─────────────────────────────── row level security ───────────────────────────────

alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.courts enable row level security;
alter table public.games enable row level security;
alter table public.game_participants enable row level security;
alter table public.coaches enable row level security;
alter table public.credentials enable row level security;
alter table public.coach_pay_details enable row level security;
alter table public.coach_plans enable row level security;
alter table public.lesson_groups enable row level security;
alter table public.lesson_group_members enable row level security;
alter table public.lesson_bookings enable row level security;
alter table public.payments enable row level security;
alter table public.questions enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

-- profiles: public names; you edit your own
create policy "profiles: read" on public.profiles for select using (true);
create policy "profiles: edit own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "private: read own" on public.profile_private for select to authenticated using (id = (select auth.uid()));
create policy "private: edit own" on public.profile_private for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- courts: public; ops team edits
create policy "courts: read" on public.courts for select using (published or public.is_admin());
create policy "courts: admin" on public.courts for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- games: public; hosts create and edit their own (seats move through RPC)
create policy "games: read" on public.games for select using (true);
create policy "games: host creates" on public.games for insert to authenticated
  with check (host_id = (select auth.uid()) and cancelled_at is null and starts_at > now());
create policy "games: host edits" on public.games for update to authenticated
  using (host_id = (select auth.uid()) or public.is_admin()) with check (host_id = (select auth.uid()) or public.is_admin());
create policy "participants: read" on public.game_participants for select using (true);

-- coaches: approved pages are public; the owner sees and edits theirs at any status
create policy "coaches: read" on public.coaches for select
  using (status = 'approved' or profile_id = (select auth.uid()) or public.is_admin());
create policy "coaches: apply" on public.coaches for insert to authenticated with check (profile_id = (select auth.uid()));
create policy "coaches: edit own" on public.coaches for update to authenticated
  using (profile_id = (select auth.uid()) or public.is_admin()) with check (profile_id = (select auth.uid()) or public.is_admin());

create policy "credentials: read" on public.credentials for select
  using ((status in ('verified', 'self_reported') and exists (select 1 from public.coaches c where c.id = coach_id))
         or coach_id = public.my_coach_id() or public.is_admin());
create policy "credentials: own" on public.credentials for insert to authenticated with check (coach_id = public.my_coach_id());
create policy "credentials: edit own" on public.credentials for update to authenticated
  using (coach_id = public.my_coach_id() or public.is_admin()) with check (coach_id = public.my_coach_id() or public.is_admin());
create policy "credentials: delete own" on public.credentials for delete to authenticated
  using (coach_id = public.my_coach_id() or public.is_admin());

create policy "plans: read" on public.coach_plans for select
  using (exists (select 1 from public.coaches c where c.id = coach_id));   -- rides on "coaches: read"
create policy "pay details: own" on public.coach_pay_details for all to authenticated
  using (coach_id = public.my_coach_id()) with check (coach_id = public.my_coach_id());
create policy "plans: own" on public.coach_plans for all to authenticated
  using (coach_id = public.my_coach_id()) with check (coach_id = public.my_coach_id());

-- bookings, groups, payments: only the people in them (writes go through RPC)
-- membership is checked through a security-definer function so the groups ↔ members policies don't recurse
create function public.is_group_member(p_group uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.lesson_group_members m where m.group_id = p_group and m.user_id = (select auth.uid()))
$$;
create policy "bookings: parties" on public.lesson_bookings for select to authenticated
  using (student_id = (select auth.uid()) or coach_id = public.my_coach_id() or (group_id is not null and public.is_group_member(group_id)));
create policy "groups: parties" on public.lesson_groups for select to authenticated
  using (coach_id = public.my_coach_id() or public.is_group_member(id));
create policy "group members: parties" on public.lesson_group_members for select to authenticated
  using (public.is_group_member(group_id)
         or exists (select 1 from public.lesson_groups g where g.id = group_id and g.coach_id = public.my_coach_id()));
create policy "payments: parties" on public.payments for select to authenticated
  using (payer_id = (select auth.uid())
         or exists (select 1 from public.lesson_bookings b where b.id = booking_id and b.coach_id = public.my_coach_id()));

-- Q&A: answered ones are public; your own and your coach page's are visible to you
create policy "questions: read" on public.questions for select
  using ((answer is not null and hidden_at is null) or asker_id = (select auth.uid()) or coach_id = public.my_coach_id() or public.is_admin());
create policy "questions: ask" on public.questions for insert to authenticated
  with check (asker_id = (select auth.uid()) and exists (select 1 from public.coaches c where c.id = coach_id and c.status = 'approved'));

create policy "favorites: own" on public.favorites for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "reports: file" on public.reports for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "reports: read" on public.reports for select to authenticated using (reporter_id = (select auth.uid()) or public.is_admin());
create policy "reports: admin" on public.reports for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "notifications: own" on public.notifications for select to authenticated using (user_id = (select auth.uid()));

-- ─────────────────────────────── privileges ───────────────────────────────
-- Supabase grants everything to anon/authenticated by default and relies on RLS; we narrow it so a missing policy
-- fails closed, and expose only the RPCs the app calls.

revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles, public.courts, public.games, public.game_participants, public.coaches, public.credentials,
  public.coach_plans, public.questions, public.game_cards, public.coach_cards to anon, authenticated;
grant select on public.profile_private, public.lesson_bookings, public.lesson_groups, public.lesson_group_members,
  public.payments, public.favorites, public.reports, public.notifications to authenticated;
grant update (display_name, avatar_url, level) on public.profiles to authenticated;
grant update (home_districts, onboarded_at, notify) on public.profile_private to authenticated;
grant insert, update, delete on public.courts to authenticated;                                -- RLS: admins only
grant insert on public.games to authenticated;
grant update (court_id, location_text, address, district, starts_at, ends_at, level_min, level_max, strict_level, capacity,
  fee, fee_note, cancel_hours, beginner_friendly, notes, host_contact) on public.games to authenticated;
grant insert, update on public.coaches to authenticated;
grant insert, update, delete on public.credentials, public.coach_plans to authenticated;
grant select, insert, update on public.coach_pay_details to authenticated;
grant insert (coach_id, asker_id, text) on public.questions to authenticated;
grant insert, delete on public.favorites to authenticated;
grant insert on public.reports to authenticated;
grant update (status) on public.reports to authenticated;
grant update (read_at) on public.notifications to authenticated;

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.contact_kind(text), public.tpe_weekday(timestamptz), public.tpe_hhmi(timestamptz), public.lesson_seats_left(uuid, timestamptz), public.lesson_group_by_code(text),
  public.coach_stats(), public.is_admin(), public.my_coach_id(), public.is_group_member(uuid) to anon, authenticated;
grant execute on function public.join_game(uuid), public.leave_game(uuid), public.host_add_guest(uuid, text),
  public.host_remove_participant(uuid), public.cancel_game(uuid),
  public.request_booking(uuid, timestamptz, int, text, public.pay_method), public.decide_booking(uuid, boolean),
  public.cancel_booking(uuid), public.create_lesson_group(uuid, timestamptz, text), public.join_lesson_group(text),
  public.leave_lesson_group(uuid), public.submit_lesson_group(uuid, public.pay_method),
  public.report_payment(uuid, text), public.mark_payment_paid(uuid), public.payment_instructions(uuid),
  public.answer_question(uuid, text), public.hide_question(uuid, boolean), public.delete_my_account() to authenticated;
