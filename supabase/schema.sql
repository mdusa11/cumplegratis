-- Cumplegratis: tablas de solo escritura desde la web (anon). La lectura es solo para ti desde el dashboard.

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 254),
  birth_month smallint not null check (birth_month between 1 and 12),
  birth_day smallint not null check (birth_day between 1 and 31),
  created_at timestamptz not null default now()
);

create table if not exists public.promo_reports (
  id uuid primary key default gen_random_uuid(),
  slug text,
  kind text not null check (kind in ('works', 'broken', 'new')),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

alter table public.reminders enable row level security;
alter table public.promo_reports enable row level security;

create policy "anon puede registrarse" on public.reminders for insert to anon with check (true);
create policy "anon puede reportar" on public.promo_reports for insert to anon with check (true);

-- Vista rápida: qué promos reporta la gente como rotas.
create or replace view public.promo_health as
select slug,
       count(*) filter (where kind = 'works') as funciona,
       count(*) filter (where kind = 'broken') as no_funciona,
       max(created_at) as ultimo_reporte
from public.promo_reports
where slug is not null
group by slug;
