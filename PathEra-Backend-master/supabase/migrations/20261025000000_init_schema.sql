-- PathEra initial schema for Supabase (Postgres).
-- Mirrors the Sequelize models in /model. Column names stay camelCase for
-- "createdAt"/"updatedAt" because Sequelize's timestamps expect them.
--
-- Row Level Security is enabled on every table with no policies: the Express
-- backend connects as the table owner (bypasses RLS), while Supabase's public
-- Data API (anon/authenticated keys) gets no access to users, sessions, etc.

create table if not exists companies (
  id            integer primary key,
  company_name  varchar(255),
  company_image varchar(255),
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now()
);

create table if not exists users (
  id                  serial primary key,
  name                varchar(255),
  email               varchar(255) unique,
  password            varchar(255),
  degree              varchar(255),
  years_of_experience integer,
  token               text,
  "createdAt"         timestamptz not null default now(),
  "updatedAt"         timestamptz not null default now()
);
create index if not exists users_token_idx on users (token);

create table if not exists skills (
  id          serial primary key,
  skill_name  varchar(255),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists jobs (
  id              bigint primary key,
  job_title       varchar(255),
  job_type        varchar(255),
  job_level       varchar(255),
  job_model       varchar(255),
  location        varchar(255),
  job_industry    varchar(255),
  min_experience  integer,
  degree          varchar(255),
  job_description text,
  job_link        varchar(255),
  date_posted     timestamptz,
  company_id      integer references companies (id) on update cascade,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);
create index if not exists jobs_company_id_idx on jobs (company_id);

create table if not exists job_skills (
  job_id      bigint  references jobs (id) on delete cascade on update cascade,
  skill_id    integer references skills (id) on delete cascade on update cascade,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  primary key (job_id, skill_id)
);
create index if not exists job_skills_skill_id_idx on job_skills (skill_id);

create table if not exists job_matches (
  match_id         integer primary key,
  job_id           bigint  references jobs (id) on delete cascade on update cascade,
  user_id          integer references users (id) on delete cascade on update cascade,
  title_score      double precision,
  experience_score double precision,
  degree_score     double precision,
  similarity       double precision,
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now()
);

create table if not exists matched_skills (
  id            serial primary key,
  match_id      integer references job_matches (match_id) on update cascade,
  matches       text not null,
  user_skill    integer references skills (id) on delete set null on update cascade,
  matched_skill integer references skills (id) on delete set null on update cascade,
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now()
);

create table if not exists user_skills (
  id          serial primary key,
  user_id     integer references users (id) on delete cascade on update cascade,
  skill_id    integer references skills (id) on update cascade,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists user_titles (
  id          serial primary key,
  user_id     integer references users (id) on delete cascade on update cascade,
  job_title   varchar(255),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists saved_jobs (
  id          serial primary key,
  job_id      bigint  references jobs (id) on delete cascade on update cascade,
  user_id     integer references users (id) on delete cascade on update cascade,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique (user_id, job_id)
);

create table if not exists questions (
  id          serial primary key,
  question    varchar(255) not null,
  job_title   varchar(255) not null,
  topic       varchar(255) not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists questions_job_title_idx on questions (job_title);

create table if not exists answer_key (
  id          serial primary key,
  question_id integer not null references questions (id) on update cascade,
  answer      text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists answer_key_question_id_idx on answer_key (question_id);

create table if not exists practice_sessions (
  id          serial primary key,
  user_id     integer not null references users (id) on delete cascade on update cascade,
  job_title   varchar(255),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists practice_sessions_user_id_idx on practice_sessions (user_id);

create table if not exists answer_details (
  id                  serial primary key,
  practice_session_id integer not null references practice_sessions (id) on delete cascade on update cascade,
  question_id         integer not null references questions (id) on update cascade,
  answer              text not null,
  feedback            text not null,
  score               decimal(5, 2) not null,
  sample_answer       text not null,
  "createdAt"         timestamptz not null default now(),
  "updatedAt"         timestamptz not null default now()
);
create index if not exists answer_details_practice_session_id_idx on answer_details (practice_session_id);

alter table companies         enable row level security;
alter table users             enable row level security;
alter table skills            enable row level security;
alter table jobs              enable row level security;
alter table job_skills        enable row level security;
alter table job_matches       enable row level security;
alter table matched_skills    enable row level security;
alter table user_skills       enable row level security;
alter table user_titles       enable row level security;
alter table saved_jobs        enable row level security;
alter table questions         enable row level security;
alter table answer_key        enable row level security;
alter table practice_sessions enable row level security;
alter table answer_details    enable row level security;
