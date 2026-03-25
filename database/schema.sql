create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function enforce_darkgpt_user_cap()
returns trigger as $$
begin
  if (select count(*) from users) >= 500 then
    raise exception 'DarkGPT supports only 500 pre-created accounts.';
  end if;

  return new;
end;
$$ language plpgsql;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  account_number smallint not null unique check (account_number between 1 and 500),
  username varchar(50) not null unique,
  email varchar(255) unique,
  password_hash text not null,
  is_precreated boolean not null default true,
  is_active boolean not null default true,
  device_id varchar(255) unique,
  device_name varchar(255),
  device_bound_at timestamptz,
  daily_ai_limit bigint not null default 13000 check (daily_ai_limit >= 0),
  monthly_ai_limit bigint not null default 400000 check (monthly_ai_limit >= 0),
  daily_ai_used bigint not null default 0 check (daily_ai_used >= 0),
  monthly_ai_used bigint not null default 0 check (monthly_ai_used >= 0),
  limit_enabled boolean not null default true,
  daily_usage_reset_at date not null default current_date,
  monthly_usage_reset_at date not null default date_trunc('month', now())::date,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
before update on users
for each row
execute function set_updated_at();

drop trigger if exists trg_enforce_darkgpt_user_cap on users;
create trigger trg_enforce_darkgpt_user_cap
before insert on users
for each row
execute function enforce_darkgpt_user_cap();

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  device_id varchar(255) not null unique,
  device_name varchar(255) not null,
  platform varchar(50) not null default 'android',
  app_version varchar(50),
  verified_at timestamptz not null default now(),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_devices_updated_at on devices;
create trigger trg_devices_updated_at
before update on devices
for each row
execute function set_updated_at();

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  device_id varchar(255) not null references devices(device_id),
  access_token text not null,
  refresh_token text not null,
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  ip_address inet,
  user_agent text,
  is_revoked boolean not null default false,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  category varchar(50) not null,
  title varchar(255) not null,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats(id) on delete cascade,
  role varchar(20) not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_username on users(username);
create index if not exists idx_users_is_active on users(is_active);
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_device_id on sessions(device_id);
create index if not exists idx_chats_user_id on chats(user_id);
create index if not exists idx_messages_chat_id on messages(chat_id);
