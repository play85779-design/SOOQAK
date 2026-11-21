-- Post-migration read-only verification: expected protected privileges (false) and pending default.
SELECT 'cannot_self_verify_business' AS check_name,
       NOT has_column_privilege('authenticated','public.sooqak_accounts','verified_business','INSERT') AS pass
UNION ALL SELECT 'cannot_truncate_private_profiles', NOT has_table_privilege('authenticated','public.sooqak_private_profiles','TRUNCATE')
UNION ALL SELECT 'cannot_truncate_services', NOT has_table_privilege('authenticated','public.sooqak_service_directory','TRUNCATE')
UNION ALL SELECT 'cannot_truncate_reports', NOT has_table_privilege('authenticated','public.sooqak_service_reports','TRUNCATE')
UNION ALL SELECT 'cannot_create_admin_approved_service', NOT has_column_privilege('authenticated','public.sooqak_service_directory','moderation_state','INSERT')
ORDER BY check_name;
SELECT column_default FROM information_schema.columns
 WHERE table_schema='public' AND table_name='sooqak_service_directory' AND column_name='moderation_state';
SELECT policyname,cmd,with_check FROM pg_policies
 WHERE schemaname='public' AND tablename='sooqak_service_directory' AND policyname IN ('ssd_owner_insert','ssd_owner_update');
