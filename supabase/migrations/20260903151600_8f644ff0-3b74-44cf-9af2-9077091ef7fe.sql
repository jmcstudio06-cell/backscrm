create or replace function public.get_cloud_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  result jsonb;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Forbidden';
  end if;

  select jsonb_build_object(
    'db_size_bytes', pg_database_size(current_database()),
    'connections_total', (select count(*) from pg_stat_activity),
    'connections_active', (select count(*) from pg_stat_activity where state = 'active'),
    'max_connections', (select setting::int from pg_settings where name = 'max_connections'),
    'top_tables', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select c.relname as table_name,
               pg_total_relation_size(c.oid) as total_bytes,
               coalesce(s.n_live_tup, 0) as row_estimate
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        left join pg_stat_user_tables s on s.relid = c.oid
        where n.nspname = 'public' and c.relkind = 'r'
        order by pg_total_relation_size(c.oid) desc
        limit 12
      ) t
    ),
    'cron_jobs', (
      select coalesce(jsonb_agg(j), '[]'::jsonb) from (
        select jobname, schedule, active from cron.job order by jobname
      ) j
    ),
    'cron_runs_24h', (
      select count(*) from cron.job_run_details where start_time > now() - interval '24 hours'
    ),
    'cron_failures_24h', (
      select count(*) from cron.job_run_details where start_time > now() - interval '24 hours' and status <> 'succeeded'
    ),
    'storage_bytes', (
      select coalesce(sum((metadata->>'size')::bigint), 0) from storage.objects
    ),
    'storage_files', (select count(*) from storage.objects),
    'emails_24h', (
      select count(*) from public.email_send_log where created_at > now() - interval '24 hours'
    ),
    'users_total', (select count(*) from public.profiles),
    'users_active_24h', (select count(*) from public.profiles where last_seen > now() - interval '24 hours'),
    'shows_total', (select count(*) from public.shows),
    'generated_at', now()
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_cloud_metrics() from public;
grant execute on function public.get_cloud_metrics() to authenticated;