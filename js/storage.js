// =========================================
// ALMACENAMIENTO (localStorage)
// Este archivo SOLO guarda y lee la biblioteca del usuario.
// El resto de la web nunca toca localStorage directamente: siempre llama a estas funciones.
// Así, en la fase 9 cambiaremos solo lo de dentro para usar Supabase.
// =========================================

// Nombre con el que guardamos la biblioteca en localStorage
const CLAVE_BIBLIOTECA = "mangaAlDia.biblioteca";

// ---------- Funciones internas (solo las usa este archivo) ----------

// Lee la biblioteca de localStorage y la devuelve como array.
// Si no hay nada guardado, o los datos están estropeados, devuelve un array vacío.
function leerBiblioteca() {
    try {
        const texto = localStorage.getItem(CLAVE_BIBLIOTECA);

        // Primera vez: todavía no hay nada guardado
        if (texto === null) {
            return [];
        }

        // JSON.parse convierte el texto guardado otra vez en un array de objetos
        const datos = JSON.parse(texto);

        // Si lo guardado no es un array (datos corruptos), empezamos de cero
        if (!Array.isArray(datos)) {
            return [];
        }

        return datos;
    } catch (error) {
        // Llegamos aquí si el texto no es JSON válido o el navegador bloquea localStorage
        console.error("No se ha podido leer la biblioteca:", error);
        return [];
    }
}

// Guarda la biblioteca entera en localStorage
function guardarBiblioteca(biblioteca) {
    try {
        // localStorage solo guarda texto: JSON.stringify convierte el array en texto
        localStorage.setItem(CLAVE_BIBLIOTECA, JSON.stringify(biblioteca));
    } catch (error) {
        // Por ejemplo: navegación privada que no deja guardar, o almacenamiento lleno
        console.error("No se ha podido guardar la biblioteca:", error);
    }
}

// ---------- Funciones públicas (las usa ui.js) ----------

// Devuelve todas las series guardadas
function obtenerBiblioteca() {
    return leerBiblioteca();
}

// Devuelve una serie guardada a partir de su id, o null si no está en la biblioteca
function obtenerSerieGuardada(id) {
    const biblioteca = leerBiblioteca();
    // find devuelve el primer elemento que cumple la condición (o undefined si ninguno)
    const serie = biblioteca.find(function (s) {
        return s.id === id;
    });
    return serie || null;
}

// Añade una serie a la biblioteca con un estado. Empieza en el capítulo 0.
// "serie" debe tener: id, titulo, tipo, portada y total.
function anadirSerie(serie, estado) {
    const biblioteca = leerBiblioteca();

    // Si ya está en la biblioteca, no la añadimos dos veces
    const yaExiste = biblioteca.some(function (s) {
        return s.id === serie.id;
    });
    if (yaExiste) {
        return;
    }

    biblioteca.push({
        id: serie.id,
        titulo: serie.titulo,
        tipo: serie.tipo,
        portada: serie.portada,
        total: serie.total,
        capitulo: 0,
        estado: estado
    });

    guardarBiblioteca(biblioteca);
}

// Cambia el capítulo por el que vas de una serie
function actualizarCapitulo(id, capitulo) {
    const biblioteca = leerBiblioteca();
    const serie = biblioteca.find(function (s) {
        return s.id === id;
    });

    if (!serie) {
        return;   // no está en la biblioteca: no hay nada que actualizar
    }

    serie.capitulo = capitulo;
    guardarBiblioteca(biblioteca);
}

// Cambia el estado de una serie (leyendo, pendiente, terminada, abandonada)
function cambiarEstado(id, estado) {
    const biblioteca = leerBiblioteca();
    const serie = biblioteca.find(function (s) {
        return s.id === id;
    });

    if (!serie) {
        return;
    }

    serie.estado = estado;
    guardarBiblioteca(biblioteca);
}

// Quita una serie de la biblioteca
function eliminarSerie(id) {
    // filter se queda con todas MENOS la que tiene ese id
    const biblioteca = leerBiblioteca().filter(function (s) {
        return s.id !== id;
    });
    guardarBiblioteca(biblioteca);
}