-- Payment reminders that carry the transfer QR (docs/PAYMENTS.md §1.5): the reminder links to the student's 我的預約,
-- which shows the TWQR code for the coach's account. LINE bills per message, so nothing new is sent on top:
--   1. The 20:00 「明天有課」 reminder says 「還沒付款」 when the reader's payment is still waiting (not for cash,
--      which the coach collects on court with the same QR).
--   2. The coach's 「LINE 提醒」 button on 收款 queues a payment_due notice, at most once every 12 hours per payment.

create or replace function public.remind_tomorrow() returns void language plpgsql security definer set search_path = '' as $$
declare v_day date := (now() at time zone 'Asia/Taipei')::date + 1;
begin
  -- a group booking reminds every member, not only the organiser who booked
  insert into public.notifications (user_id, kind, payload, channel)
  select u.user_id, 'lesson_reminder',
    jsonb_build_object('booking_id', b.id, 'at', public.tpe_hhmi(b.starts_at),
      'unpaid', exists (select 1 from public.payments p where p.booking_id = b.id and p.payer_id = u.user_id and p.status = 'waiting' and p.method <> 'cash'),
      'method', (select p.method from public.payments p where p.booking_id = b.id and p.payer_id = u.user_id)),
    'line'
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

/** 提醒付款: the coach nudges a student whose payment is still waiting. */
create function public.remind_payment(p_payment uuid) returns void language plpgsql security definer set search_path = '' as $$
declare v_payer uuid; v_booking uuid; v_amount integer; v_at text; v_method public.pay_method;
begin
  select p.payer_id, p.booking_id, p.amount, public.tpe_hhmi(b.starts_at), p.method into v_payer, v_booking, v_amount, v_at, v_method
  from public.payments p join public.lesson_bookings b on b.id = p.booking_id
  where p.id = p_payment and b.coach_id = public.my_coach_id() and p.status = 'waiting' and b.status = 'confirmed';
  if not found then raise exception 'payment not found'; end if;
  if exists (select 1 from public.notifications n where n.kind = 'payment_due' and n.payload ->> 'payment_id' = p_payment::text
             and n.created_at > now() - interval '12 hours') then
    raise exception '12 小時內已經提醒過這位學生';
  end if;
  perform public.notify(v_payer, 'payment_due', jsonb_build_object('payment_id', p_payment, 'booking_id', v_booking, 'amount', v_amount, 'at', v_at, 'method', v_method));
end $$;
revoke execute on function public.remind_payment(uuid) from public, anon;
grant execute on function public.remind_payment(uuid) to authenticated;
