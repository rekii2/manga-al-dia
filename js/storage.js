// =========================================
// ALMACENAMIENTO (Supabase)
// Este archivo SOLO guarda y lee la biblioteca del usuario.
// El resto de la web nunca habla con la base de datos directamente: siempre llama a estas funciones.
// Antes guardaba en localStorage; ahora guarda en la tabla "biblioteca" de Supabase.
//
// No hace falta decir de qué usuario son las filas:
// - Al LEER, las reglas RLS solo devuelven las filas del usuario que ha iniciado sesión.
// - Al AÑADIR, la columna user_id se rellena sola con auth.uid() (el valor por defecto de la tabla).
//
// Todas las funciones son async (hablan con internet) y lanzan un error si algo falla,
// para que ui.js lo recoja con try/catch y enseñe un mensaje.
// =========================================

// Nombre de la tabla en Supabase
const TABLA_BIBLIOTECA = "biblioteca";

// ---------- Función interna (solo la usa este archivo) ----------

// Convierte una fila de la tabla en el objeto que usa ui.js.
// En la tabla la columna se llama "anilist_id", pero ui.js usa "id" para el id de AniList.
// Así ui.js no tiene que saber cómo son las columnas de la base de datos.
function filaASerie(fila) {
    return {
        id: fila.anilist_id,
        titulo: fila.titulo,
        tipo: fila.tipo,
        portada: fila.portada,
        total: fila.total,
        capitulo: fila.capitulo,
        estado: fila.estado
    };
}

// ---------- Funciones públicas (las usa ui.js) ----------

// Devuelve todas las series del usuario, de la modificada más recientemente a la más antigua
async function obtenerBiblioteca() {
    const { data, error } = await clienteSupabase
        .from(TABLA_BIBLIOTECA)                      // de la tabla biblioteca...
        .select("*")                                 // ...todas las columnas...
        .order("actualizado", { ascending: false }); // ...ordenadas por fecha, las últimas primero

    if (error) {
        throw error;
    }

    // map crea un array nuevo transformando cada fila con filaASerie
    return data.map(filaASerie);
}

// Devuelve una serie guardada a partir de su id de AniList, o null si no está en la biblioteca
async function obtenerSerieGuardada(id) {
    const { data, error } = await clienteSupabase
        .from(TABLA_BIBLIOTECA)
        .select("*")
        .eq("anilist_id", id)   // eq = "equal": donde anilist_id sea igual a id
        .maybeSingle();         // esperamos una fila o ninguna (si no hay, data es null)

    if (error) {
        throw error;
    }

    if (data === null) {
        return null;
    }
    return filaASerie(data);
}

// Añade una serie a la biblioteca con un estado. Empieza en el capítulo 0.
// "serie" debe tener: id, titulo, tipo, portada y total.
async function anadirSerie(serie, estado) {
    const { error } = await clienteSupabase
        .from(TABLA_BIBLIOTECA)
        .insert({
            anilist_id: serie.id,
            titulo: serie.titulo,
            tipo: serie.tipo,
            portada: serie.portada,
            total: serie.total,
            capitulo: 0,
            estado: estado
            // user_id no hace falta: la base de datos pone el del usuario con sesión
        });

    if (error) {
        throw error;
    }
}

// Cambia el capítulo por el que vas de una serie
async function actualizarCapitulo(id, capitulo) {
    const { error } = await clienteSupabase
        .from(TABLA_BIBLIOTECA)
        .update({
            capitulo: capitulo,
            actualizado: new Date().toISOString()   // fecha y hora de ahora
        })
        .eq("anilist_id", id);

    if (error) {
        throw error;
    }
}

// Cambia el estado de una serie (leyendo, pendiente, terminada, abandonada)
async function cambiarEstado(id, estado) {
    const { error } = await clienteSupabase
        .from(TABLA_BIBLIOTECA)
        .update({
            estado: estado,
            actualizado: new Date().toISOString()
        })
        .eq("anilist_id", id);

    if (error) {
        throw error;
    }
}

// Quita una serie de la biblioteca
async function eliminarSerie(id) {
    const { error } = await clienteSupabase
        .from(TABLA_BIBLIOTECA)
        .delete()
        .eq("anilist_id", id);

    if (error) {
        throw error;
    }
}