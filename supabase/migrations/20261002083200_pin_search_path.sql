-- Pin search_path on the helpers that didn't set it (Supabase security advisor 0011). Their bodies only use
-- pg_catalog and schema-qualified names, so an empty path changes nothing except closing the hijack route.

alter function public.touch_updated_at() set search_path = '';
alter function public.contact_kind(text) set search_path = '';
alter function public.assert_no_contact(text) set search_path = '';
alter function public.tpe_weekday(timestamptz) set search_path = '';
alter function public.tpe_hhmi(timestamptz) set search_path = '';
