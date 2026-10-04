-- 收款雙向確認 (PLAN D9: no payment gateway in v1; coaches collect, PIKYOO keeps both sides' records straight).
-- Each step now tells the other side, and the coach can send a report back (還沒收到).

create or replace function public.report_payment(p_payment uuid, p_last5 text) returns void language plpgsql security definer set search_path = '' as $$
declare v_booking uuid; v_coach uuid;
begin
  update public.payments set status = 'reported', reported_at = now(), ref_last5 = nullif(p_last5, '')
  where id = p_payment and payer_id = auth.uid() and status = 'waiting'
  returning booking_id into v_booking;
  if not found then raise exception 'payment not found'; end if;
  select c.profile_id into v_coach from public.lesson_bookings b join public.coaches c on c.id = b.coach_id where b.id = v_booking;
  perform public.notify(v_coach, 'payment_reported', jsonb_build_object('payment_id', p_payment, 'booking_id', v_booking));
end $$;

create or replace function public.mark_payment_paid(p_payment uuid) returns void language plpgsql security definer set search_path = '' as $$
declare v_payer uuid; v_booking uuid;
begin
  update public.payments p set status = 'paid', paid_at = now()
  from public.lesson_bookings b
  where p.id = p_payment and b.id = p.booking_id and b.coach_id = public.my_coach_id() and p.status in ('waiting', 'reported')
  returning p.payer_id, p.booking_id into v_payer, v_booking;
  if not found then raise exception 'payment not found'; end if;
  perform public.notify(v_payer, 'payment_received', jsonb_build_object('payment_id', p_payment, 'booking_id', v_booking));
end $$;

/** 還沒收到: the coach sends a report back to 待付款 (the student checks and reports again). */
create function public.reject_payment_report(p_payment uuid) returns void language plpgsql security definer set search_path = '' as $$
declare v_payer uuid; v_booking uuid;
begin
  update public.payments p set status = 'waiting', reported_at = null, ref_last5 = null
  from public.lesson_bookings b
  where p.id = p_payment and b.id = p.booking_id and b.coach_id = public.my_coach_id() and p.status = 'reported'
  returning p.payer_id, p.booking_id into v_payer, v_booking;
  if not found then raise exception 'payment not found'; end if;
  perform public.notify(v_payer, 'payment_not_received', jsonb_build_object('payment_id', p_payment, 'booking_id', v_booking));
end $$;
revoke execute on function public.reject_payment_report(uuid) from public, anon;
grant execute on function public.reject_payment_report(uuid) to authenticated;
