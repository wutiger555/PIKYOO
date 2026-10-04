-- 團主編輯球局 (PRD F2-10): hosts already update their game directly (RLS "games: host edits").
-- Add the missing rules: a cancelled game stays as it is, a new start time must be in the future,
-- and people signed up are told when the time, place or fee changes.

/** Hosts edit their game directly; seat counts and the host itself can't be edited that way. */
create or replace function public.games_guard() returns trigger language plpgsql security definer set search_path = '' as $$
declare taken int;
begin
  if tg_op = 'UPDATE' then
    if new.host_id <> old.host_id and not public.is_trusted() then raise exception 'host cannot be changed'; end if;
    if old.cancelled_at is not null and not public.is_trusted() then raise exception 'game cancelled'; end if;
    if new.starts_at <> old.starts_at and new.starts_at <= now() and not public.is_trusted() then
      raise exception 'start time is in the past';
    end if;
    select count(*) into taken from public.game_participants where game_id = new.id and status = 'joined';
    if new.capacity < taken then raise exception 'capacity below joined count (%)', taken; end if;
  end if;
  return new;
end $$;

/** 變更通知: everyone joined or waitlisted (but the host) hears about a new time, place or fee. */
create function public.games_after_edit() returns trigger language plpgsql security definer set search_path = '' as $$
declare r record; changed text[] := '{}';
begin
  if new.starts_at <> old.starts_at or new.ends_at <> old.ends_at then changed := changed || 'time'; end if;
  if new.court_id is distinct from old.court_id or new.location_text <> old.location_text or new.address <> old.address then
    changed := changed || 'place';
  end if;
  if new.fee <> old.fee or new.fee_note <> old.fee_note then changed := changed || 'fee'; end if;
  if cardinality(changed) = 0 then return new; end if;
  for r in select user_id from public.game_participants
           where game_id = new.id and status in ('joined', 'waitlisted') and user_id is not null and user_id <> new.host_id loop
    perform public.notify(r.user_id, 'game_changed', jsonb_build_object('game_id', new.id, 'changed', to_jsonb(changed)));
  end loop;
  return new;
end $$;
revoke execute on function public.games_after_edit() from public, anon, authenticated;

create trigger games_after_edit after update of starts_at, ends_at, court_id, location_text, address, fee, fee_note on public.games
  for each row when (new.cancelled_at is null) execute function public.games_after_edit();
