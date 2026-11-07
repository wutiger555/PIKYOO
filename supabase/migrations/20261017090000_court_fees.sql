-- 場地費 and where each slot is (2026-10-17 court-fee research, docs/PRD.md F3-4 / F4-2).
-- courts: a published reference price (range per hour per court) with when PIKYOO checked it, and a partner flag
-- reserved for venue partnerships. coaches: which venue each weekly slot is at; the per-person fee lives inside the
-- existing venues jsonb ({name, sub, court_slug, fee?, fee_to?}). The platform shows the two side by side and never
-- collects the fee.
alter table public.courts
  add column fee_low integer check (fee_low >= 0),
  add column fee_high integer check (fee_high >= 0),
  add column fee_checked_at date,
  add column fee_source text,
  add column partner boolean not null default false,
  add constraint courts_fee_range check (fee_low is null or fee_high is null or fee_low <= fee_high);

alter table public.coaches add column slot_venues jsonb not null default '{}';

-- coach_cards was created with `select c.*`, which froze the column list; recreate it so slot_venues comes through.
drop view public.coach_cards;
create view public.coach_cards with (security_invoker = true) as
select c.*,
  (select min(pl.price) from public.coach_plans pl where pl.coach_id = c.id and pl.archived_at is null
     and pl.unit <> 'per_pack') as price_from,
  (select coalesce(array_agg(distinct pl.kind), '{}') from public.coach_plans pl where pl.coach_id = c.id and pl.archived_at is null) as kinds,
  exists (select 1 from public.credentials cr where cr.coach_id = c.id and cr.status = 'verified' and cr.type = 'coach_cert') as certified,
  coalesce((select s.students from public.coach_stats() s where s.coach_id = c.id), 0) as students
from public.coaches c;
grant select on public.coach_cards to anon, authenticated;
