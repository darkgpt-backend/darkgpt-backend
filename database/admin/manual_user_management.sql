-- Manual admin examples for DarkGPT user control

-- 1. Deactivate an account
-- update users set is_active = false where username = 'darkgpt_user_001';

-- 2. Reactivate an account
-- update users set is_active = true where username = 'darkgpt_user_001';

-- 3. Disable AI limits for one user
-- update users set limit_enabled = false where username = 'darkgpt_user_001';

-- 4. Enable AI limits and change them
-- update users
-- set limit_enabled = true,
--     daily_ai_limit = 13000,
--     monthly_ai_limit = 400000
-- where username = 'darkgpt_user_001';

-- 5. Reset usage counters
-- update users
-- set daily_ai_used = 0,
--     monthly_ai_used = 0,
--     daily_usage_reset_at = current_date,
--     monthly_usage_reset_at = date_trunc('month', now())::date
-- where username = 'darkgpt_user_001';

-- 6. Unbind/reset the device
-- update users
-- set device_id = null,
--     device_name = null,
--     device_bound_at = null
-- where username = 'darkgpt_user_001';

-- delete from devices where user_id = (
--   select id from users where username = 'darkgpt_user_001'
-- );
