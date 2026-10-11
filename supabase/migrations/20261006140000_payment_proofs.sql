-- 對帳截圖: when reporting a payment the student may attach a screenshot of the transfer (instead of, or with, the last
-- five digits). Private bucket; path <payer uid>/<payment id>/<file>. Only the payer and that lesson's coach can see it.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

create policy "payment proofs: upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.payments p where p.id::text = (storage.foldername(name))[2] and p.payer_id = (select auth.uid())));
create policy "payment proofs: payer or coach reads" on storage.objects for select to authenticated
  using (bucket_id = 'payment-proofs' and ((storage.foldername(name))[1] = (select auth.uid())::text
    or exists (select 1 from public.payments p join public.lesson_bookings b on b.id = p.booking_id
               where p.id::text = (storage.foldername(name))[2] and b.coach_id = public.my_coach_id())));

alter table public.payments add column proof_path text;

-- the old two-argument form is replaced; callers passing two arguments get the default
drop function public.report_payment(uuid, text);
create function public.report_payment(p_payment uuid, p_last5 text, p_proof text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare v_booking uuid; v_coach uuid;
begin
  if p_proof is not null and p_proof not like auth.uid()::text || '/' || p_payment::text || '/%' then
    raise exception 'proof path not allowed';
  end if;
  update public.payments set status = 'reported', reported_at = now(), ref_last5 = nullif(p_last5, ''), proof_path = p_proof
  where id = p_payment and payer_id = auth.uid() and status = 'waiting'
  returning booking_id into v_booking;
  if not found then raise exception 'payment not found'; end if;
  select c.profile_id into v_coach from public.lesson_bookings b join public.coaches c on c.id = b.coach_id where b.id = v_booking;
  perform public.notify(v_coach, 'payment_reported', jsonb_build_object('payment_id', p_payment, 'booking_id', v_booking));
end $$;
revoke execute on function public.report_payment(uuid, text, text) from public, anon;
grant execute on function public.report_payment(uuid, text, text) to authenticated;

/** 還沒收到 also clears the screenshot, so the next report starts clean. */
create or replace function public.reject_payment_report(p_payment uuid) returns void language plpgsql security definer set search_path = '' as $$
declare v_payer uuid; v_booking uuid;
begin
  update public.payments p set status = 'waiting', reported_at = null, ref_last5 = null, proof_path = null
  from public.lesson_bookings b
  where p.id = p_payment and b.id = p.booking_id and b.coach_id = public.my_coach_id() and p.status = 'reported'
  returning p.payer_id, p.booking_id into v_payer, v_booking;
  if not found then raise exception 'payment not found'; end if;
  perform public.notify(v_payer, 'payment_not_received', jsonb_build_object('payment_id', p_payment, 'booking_id', v_booking));
end $$;
