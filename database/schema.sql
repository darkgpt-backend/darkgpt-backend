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
    raise exception 'DarkGPT allows only 500 pre-created accounts.';
  end if;

  return new;
end;
$$ language plpgsql;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  account_number smallint not null unique check (account_number between 1 and 500),
  username varchar(50) not null unique,
  email varchar(255) not null unique,
  password_hash text not null,
  status varchar(20) not null default 'active' check (status in ('active', 'disabled')),
  is_precreated boolean not null default true,
  device_binding_required boolean not null default true,
  bound_device_id varchar(255) unique,
  bound_device_name varchar(255),
  device_bound_at timestamptz,
  daily_ai_limit integer not null default 25 check (daily_ai_limit >= 0),
  monthly_ai_limit integer not null default 250 check (monthly_ai_limit >= 0),
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

create table if not exists daily_ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  usage_date date not null,
  request_count integer not null default 0,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, usage_date)
);

drop trigger if exists trg_daily_ai_usage_updated_at on daily_ai_usage;
create trigger trg_daily_ai_usage_updated_at
before update on daily_ai_usage
for each row
execute function set_updated_at();

create table if not exists monthly_ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  usage_month date not null,
  request_count integer not null default 0,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, usage_month)
);

drop trigger if exists trg_monthly_ai_usage_updated_at on monthly_ai_usage;
create trigger trg_monthly_ai_usage_updated_at
before update on monthly_ai_usage
for each row
execute function set_updated_at();

create index if not exists idx_users_status on users(status);
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_device_id on sessions(device_id);
create index if not exists idx_chats_user_id on chats(user_id);
create index if not exists idx_messages_chat_id on messages(chat_id);
create index if not exists idx_daily_ai_usage_user_id on daily_ai_usage(user_id);
create index if not exists idx_monthly_ai_usage_user_id on monthly_ai_usage(user_id);
