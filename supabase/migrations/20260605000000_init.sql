-- Setlists
create table if not exists setlists (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Eventos
create table if not exists eventos (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documentos
create table if not exists documentos (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Favoritos (por dispositivo, usando un device_id anónimo)
create table if not exists favoritos (
  device_id text not null,
  cancion_id text not null,
  primary key (device_id, cancion_id),
  created_at timestamptz default now()
);

-- Trigger updated_at
create or replace function set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create or replace trigger setlists_updated_at
  before update on setlists
  for each row execute function set_updated_at();

create or replace trigger eventos_updated_at
  before update on eventos
  for each row execute function set_updated_at();

create or replace trigger documentos_updated_at
  before update on documentos
  for each row execute function set_updated_at();

-- Habilitar RLS
alter table setlists   enable row level security;
alter table eventos    enable row level security;
alter table documentos enable row level security;
alter table favoritos  enable row level security;

-- Políticas públicas (sin login — acceso total anónimo)
create policy "public read setlists"   on setlists   for select using (true);
create policy "public write setlists"  on setlists   for all    using (true) with check (true);

create policy "public read eventos"    on eventos    for select using (true);
create policy "public write eventos"   on eventos    for all    using (true) with check (true);

create policy "public read documentos" on documentos for select using (true);
create policy "public write documentos" on documentos for all   using (true) with check (true);

create policy "public read favoritos"  on favoritos  for select using (true);
create policy "public write favoritos" on favoritos  for all    using (true) with check (true);

-- Habilitar Realtime
alter publication supabase_realtime add table setlists;
alter publication supabase_realtime add table eventos;
alter publication supabase_realtime add table documentos;

-- Suscripciones Web Push
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscription jsonb not null unique,
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;
create policy "public push_subscriptions" on push_subscriptions for all using (true) with check (true);
