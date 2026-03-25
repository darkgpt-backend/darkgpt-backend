-- DarkGPT pre-created account import template
--
-- Purpose:
-- - insert invite-only users
-- - keep public signup disabled
-- - define daily/monthly usage limits per user
-- - prepare up to 500 allowed accounts
--
-- The input column names below are beginner-friendly:
-- - email
-- - password_hash
-- - monthly_limit
-- - daily_limit
-- - account_status
--
-- They are mapped into the real database columns during the final insert.

with prepared_users (
  account_number,
  username,
  email,
  password_hash,
  monthly_limit,
  daily_limit,
  account_status
) as (
  values
    (
      1,
      'darkgpt_user_001',
      'user001@example.com',
      'replace_with_bcrypt_hash',
      250,
      25,
      'active'
    ),
    (
      2,
      'darkgpt_user_002',
      'user002@example.com',
      'replace_with_bcrypt_hash',
      250,
      25,
      'active'
    )
)
insert into users (
  account_number,
  username,
  email,
  password_hash,
  monthly_ai_limit,
  daily_ai_limit,
  status,
  is_precreated
)
select
  account_number,
  username,
  email,
  password_hash,
  monthly_limit,
  daily_limit,
  account_status,
  true
from prepared_users
on conflict (account_number) do nothing;

