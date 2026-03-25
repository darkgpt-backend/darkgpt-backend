create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username varchar(50) not null unique,
  email varchar(255) not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  device_id varchar(255) not null,
  device_name varchar(255) not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  is_active boolean not null default true
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  device_id varchar(255) not null,
  device_name varchar(255) not null,
  is_revoked boolean not null default false,
  created_at timestamptz not null default now()
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

create table if not exists usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  usage_type varchar(50) not null,
  usage_period varchar(20) not null,
  period_key varchar(20) not null,
  count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, usage_type, usage_period, period_key)
);

create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_chats_user_id on chats(user_id);
create index if not exists idx_messages_chat_id on messages(chat_id);
create index if not exists idx_usage_counters_user_id on usage_counters(user_id);
