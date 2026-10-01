# Manga al Día
🔗 **Web publicada:** https://manga-al-dia.vercel.app

Web para llevar al día tus lecturas de manga, manhwa y manhua: busca cualquier serie,
añádela a tu biblioteca y apunta por qué capítulo vas con un solo toque.

Sin anuncios, sin registros y sin capítulos pirata: solo tu progreso y enlaces a sitios oficiales.

## Funciones de la primera versión (MVP)

1. Como lector, quiero buscar una serie y ver su ficha (portada, resumen, géneros
   y estado de publicación) para decidir si me interesa leerla.
2. Como lector, quiero añadir una serie a mi biblioteca con un estado
   (leyendo, pendiente, terminada, abandonada) para tener organizado lo que leo.
3. Como lector, quiero guardar por qué capítulo voy, verlo como progreso (ej. 7 / 24)
   y subirlo con un botón +1 para no perder la cuenta.

## Ahora no (para versiones futuras)

- Lista de capítulos con casillas: al marcar uno, se marcan todos los anteriores.
- Botón "Seguir leyendo" con enlaces a sitios oficiales.
- Página de inicio con carruseles: Novedades, Manga, Manhwa y Manhua.
- Página "Explorar" para ver todas las series de cada tipo.
- Autocompletado en el buscador mientras escribes.
- Avisos de nuevos capítulos.
- Favoritos y anime.
- Login y cuentas de usuario.

## Tecnologías

- HTML, CSS y JavaScript (sin frameworks)
- API GraphQL de [AniList](https://anilist.co) para los datos de las series
- localStorage para guardar la biblioteca (más adelante, Supabase)
