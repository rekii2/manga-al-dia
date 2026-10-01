-- =========================================
-- TABLA BIBLIOTECA
-- Cada fila es una serie de la biblioteca de un usuario.
-- =========================================
create table public.biblioteca (
    -- Número único de cada fila. Lo pone la base de datos sola.
    id bigint generated always as identity primary key,

    -- De quién es la fila. Por defecto, el usuario que ha iniciado sesión (auth.uid()).
    -- Si se borra la cuenta, se borran también sus series (on delete cascade).
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

    -- Datos de la serie (copiados de AniList al añadirla)
    anilist_id integer not null,
    titulo text not null,
    tipo text not null,
    portada text,
    total integer,                       -- null = no se sabe cuántos capítulos tiene

    -- Tu progreso
    capitulo integer not null default 0 check (capitulo >= 0),
    estado text not null check (estado in ('leyendo', 'pendiente', 'terminada', 'abandonada')),

    -- Fecha de la última modificación
    actualizado timestamptz not null default now(),

    -- Un mismo usuario no puede tener la misma serie dos veces
    unique (user_id, anilist_id)
);

-- =========================================
-- SEGURIDAD: Row Level Security (RLS)
-- Con RLS activado, NADIE puede leer ni tocar filas salvo lo que permitan las reglas de abajo.
-- =========================================
alter table public.biblioteca enable row level security;

-- Cada usuario solo puede VER sus propias series
create policy "Ver solo mis series"
    on public.biblioteca for select
    to authenticated
    using ((select auth.uid()) = user_id);

-- Cada usuario solo puede AÑADIR series a su propia biblioteca
create policy "Añadir solo a mi biblioteca"
    on public.biblioteca for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

-- Cada usuario solo puede MODIFICAR sus propias series
create policy "Modificar solo mis series"
    on public.biblioteca for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

-- Cada usuario solo puede BORRAR sus propias series
create policy "Borrar solo mis series"
    on public.biblioteca for delete
    to authenticated
    using ((select auth.uid()) = user_id);

-- Permiso para que los usuarios con sesión iniciada usen la tabla (las reglas de arriba limitan QUÉ filas)
grant select, insert, update, delete on public.biblioteca to authenticated;