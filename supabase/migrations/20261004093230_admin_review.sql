-- B4 審核: PIKYOO admins approve coach pages and check certificates, and the coach is told either way.
-- Admins could already update these rows (RLS + guards trust is_admin()); the functions keep the transitions,
-- the reviewer and the notification together, for the web console now and the app later.

/** 核准 publishes a page under review; 退回 sends it back to draft with a note for the coach. */
create function public.review_coach(p_coach uuid, p_approve boolean, p_note text default '') returns void
language plpgsql security definer set search_path = '' as $$
declare c public.coaches;
begin
  if not public.is_admin() then raise exception 'admins only' using errcode = '42501'; end if;
  select * into c from public.coaches where id = p_coach for update;
  if not found then raise exception 'coach not found'; end if;
  if c.status <> 'pending' then raise exception 'not waiting for review'; end if;
  update public.coaches
  set status = case when p_approve then 'approved'::public.coach_status else 'draft'::public.coach_status end,
      approved_at = case when p_approve then now() end
  where id = p_coach;
  perform public.notify(c.profile_id, case when p_approve then 'coach_approved' else 'coach_returned' end,
    jsonb_build_object('coach_id', p_coach, 'note', left(coalesce(p_note, ''), 300)));
end $$;

/** 已查驗 or 未通過 for a certificate waiting for review. */
create function public.review_credential(p_credential uuid, p_verified boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare cr public.credentials;
begin
  if not public.is_admin() then raise exception 'admins only' using errcode = '42501'; end if;
  select * into cr from public.credentials where id = p_credential for update;
  if not found then raise exception 'credential not found'; end if;
  if cr.status <> 'pending' then raise exception 'not waiting for review'; end if;
  update public.credentials
  set status = case when p_verified then 'verified'::public.verify_status else 'rejected'::public.verify_status end,
      reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_credential;
  perform public.notify((select c.profile_id from public.coaches c where c.id = cr.coach_id), 'credential_reviewed',
    jsonb_build_object('credential_id', p_credential, 'verified', p_verified));
end $$;

revoke execute on function public.review_coach(uuid, boolean, text), public.review_credential(uuid, boolean) from public, anon;
grant execute on function public.review_coach(uuid, boolean, text), public.review_credential(uuid, boolean) to authenticated;
