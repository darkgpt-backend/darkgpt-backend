-- DarkGPT pre-created account import template
--
-- Purpose:
-- - insert invite-only users
-- - keep public signup disabled
-- - define daily/monthly usage limits per user
-- - prepare up to 500 allowed accounts
--
-- The input column names below are beginner-friendly:
-- - username
-- - password_hash
-- - daily_ai_limit
-- - monthly_ai_limit
-- - is_active
-- - limit_enabled
--
-- They are mapped into the real database columns during the final insert.

with prepared_users (
  account_number,
  username,
  password_hash,
  daily_ai_limit,
  monthly_ai_limit,
  is_active,
  limit_enabled
) as (
  values
    (
      1,
      'shadowvector1842',
      'replace_with_bcrypt_hash',
      13000,
      400000,
      true,
      true
    ),
    (
      2,
      'embermatrix7421',
      'replace_with_bcrypt_hash',
      13000,
      400000,
      true,
      true
    )
)
insert into users (
  account_number,
  username,
  password_hash,
  daily_ai_limit,
  monthly_ai_limit,
  is_active,
  limit_enabled,
  is_precreated
)
select
  account_number,
  username,
  password_hash,
  daily_ai_limit,
  monthly_ai_limit,
  is_active,
  limit_enabled,
  true
from prepared_users
on conflict (account_number) do nothing;
