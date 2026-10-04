-- B6 part 2: LINE push (docs/BACKEND.md §6). Every minute pg_cron asks the site's /api/notify to send the queue;
-- the route decides LINE or in-app only. The URL and shared secret are Vault secrets (notify_url, notify_secret),
-- set once on the project, not in git. Plain Postgres (supabase/dev/check.sh) has no pg_cron: nothing is scheduled there.

-- Rows queued before there was a sender are history: don't push them now.
update public.notifications set status = 'skipped', error = 'queued before LINE push' where status = 'queued';

/** Called by pg_cron. Does nothing while the queue is empty or the Vault secrets are missing. */
create function public.kick_notify() returns void language plpgsql security definer set search_path = '' as $$
declare v_url text; v_secret text;
begin
  if not exists (select 1 from public.notifications where status = 'queued') then return; end if;
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'notify_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'notify_secret';
  if v_url is null or v_secret is null then return; end if;
  perform net.http_post(v_url, '{}'::jsonb,
    headers => jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
    timeout_milliseconds => 60000);
end $$;
revoke execute on function public.kick_notify() from public, anon, authenticated;

do $$ begin
  if exists (select from pg_available_extensions where name = 'pg_cron') and exists (select from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_net;
    create extension if not exists pg_cron;
    perform cron.schedule('notify', '* * * * *', 'select public.kick_notify()');
    -- expire_stale (init) was written for pg_cron but never scheduled: pending bookings past 48 h now expire and notify.
    perform cron.schedule('expire-stale', '*/5 * * * *', 'select public.expire_stale()');
  end if;
end $$;
