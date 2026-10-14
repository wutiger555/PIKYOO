-- 課後筆記 (2026-10-14 coach interview): after a lesson the coach writes what was practised and what's next.
-- A shared note is the student's too: they see it under 我的課 and get an in-app notice. A private one stays the coach's.
-- Notes follow the 問與答 rule: no phone, LINE or IG handles (assert_no_contact), so they don't become a private channel.

create table public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.lesson_bookings (id) on delete cascade,
  coach_id uuid not null references public.coaches (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  shared boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lesson_notes_student on public.lesson_notes (student_id, created_at desc) where shared;
create index lesson_notes_coach on public.lesson_notes (coach_id, student_id, created_at desc);
create trigger lesson_notes_touch before update on public.lesson_notes for each row execute function public.touch_updated_at();

alter table public.lesson_notes enable row level security;
-- reads only; every write goes through write_lesson_note() / delete_lesson_note()
create policy "lesson_notes: coach reads own" on public.lesson_notes for select to authenticated
  using (coach_id = (select public.my_coach_id()));
create policy "lesson_notes: student reads shared" on public.lesson_notes for select to authenticated
  using (shared and student_id = (select auth.uid()));
grant select on public.lesson_notes to authenticated;

/** Write (p_note null) or edit a note on one of the coach's lessons that has started. Sharing it, for the first time,
 *  tells the student. Returns the note id. */
create function public.write_lesson_note(p_booking uuid, p_body text, p_shared boolean, p_note uuid default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  b public.lesson_bookings;
  me uuid := public.my_coach_id();
  was_shared boolean := false;
  id uuid;
begin
  if me is null then raise exception 'sign in as a coach first'; end if;
  select * into b from public.lesson_bookings where lesson_bookings.id = p_booking;
  if b.id is null or b.coach_id <> me then raise exception 'not your lesson'; end if;
  if b.status not in ('confirmed', 'attended', 'no_show') then raise exception 'lesson not confirmed'; end if;
  if b.starts_at > now() then raise exception 'lesson not started yet'; end if;
  p_body := btrim(coalesce(p_body, ''));
  if p_body = '' then raise exception 'note is empty'; end if;
  perform public.assert_no_contact(p_body);
  if p_note is null then
    insert into public.lesson_notes (booking_id, coach_id, student_id, body, shared)
    values (b.id, me, b.student_id, p_body, p_shared) returning lesson_notes.id into id;
  else
    select n.shared into was_shared from public.lesson_notes n where n.id = p_note and n.coach_id = me;
    if not found then raise exception 'note not found'; end if;
    update public.lesson_notes set body = p_body, shared = p_shared where lesson_notes.id = p_note returning lesson_notes.id into id;
  end if;
  if p_shared and not was_shared then
    perform public.notify(b.student_id, 'lesson_note', jsonb_build_object('booking_id', b.id, 'note_id', id), 'in_app');
  end if;
  return id;
end $$;

create function public.delete_lesson_note(p_note uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.lesson_notes where id = p_note and coach_id = public.my_coach_id();
  if not found then raise exception 'note not found'; end if;
end $$;

revoke execute on function public.write_lesson_note(uuid, text, boolean, uuid), public.delete_lesson_note(uuid) from public, anon;
grant execute on function public.write_lesson_note(uuid, text, boolean, uuid), public.delete_lesson_note(uuid) to authenticated;
