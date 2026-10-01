// =========================================
// DATOS DE EJEMPLO (inventados)
// Más adelante vendrán de AniList y de lo que guarde el usuario.
// =========================================

// Array de objetos: cada objeto es una serie de la biblioteca
const seriesDeEjemplo = [
    {
        id: 1,
        titulo: "Solo Leveling",
        tipo: "Manhwa",
        portada: "https://placehold.co/60x90?text=Portada",
        capitulo: 87,
        total: null,          // null = no se sabe cuántos capítulos tiene
        estado: "leyendo"
    },
    {
        id: 2,
        titulo: "Chainsaw Man",
        tipo: "Manga",
        portada: "https://placehold.co/60x90?text=Portada",
        capitulo: 7,
        total: 24,
        estado: "leyendo"
    },
    {
        id: 3,
        titulo: "Blue Period",
        tipo: "Manga",
        portada: "https://placehold.co/60x90?text=Portada",
        capitulo: 0,
        total: 60,
        estado: "pendiente"
    },
    {
        id: 4,
        titulo: "Tales of Demons and Gods",
        tipo: "Manhua",
        portada: "https://placehold.co/60x90?text=Portada",
        capitulo: 120,
        total: null,
        estado: "abandonada"
    }
];

// =========================================
// PINTAR LA BIBLIOTECA
// =========================================

// Buscamos en la página la lista <ul> donde irán las tarjetas
const listaBiblioteca = document.querySelector(".biblioteca");

// Crea la tarjeta (<li>) de UNA serie y la devuelve.
// Construye lo mismo que tenías escrito a mano en el HTML.
function crearTarjeta(serie) {
    // <li class="tarjeta">
    const tarjeta = document.createElement("li");
    tarjeta.className = "tarjeta";

    // --- Parte de arriba: enlace a la ficha con portada, título y tipo ---
    const enlace = document.createElement("a");
    enlace.className = "tarjeta__enlace";
    enlace.href = "serie.html?id=" + serie.id;

    const portada = document.createElement("img");
    portada.className = "tarjeta__portada";
    portada.src = serie.portada;
    portada.alt = "";   // decorativa: el título ya dice qué serie es

    const textos = document.createElement("div");

    const nombre = document.createElement("h2");
    nombre.className = "tarjeta__nombre";
    nombre.textContent = serie.titulo;   // textContent: seguro, nunca ejecuta código

    const meta = document.createElement("p");
    meta.className = "tarjeta__meta";
    meta.textContent = serie.tipo;

    // Montamos las piezas: textos dentro del div, y portada + div dentro del enlace
    textos.append(nombre, meta);
    enlace.append(portada, textos);

    // --- Parte de abajo: progreso, barra y botón +1 ---
    const progreso = document.createElement("div");
    progreso.className = "progreso tarjeta__progreso";

    // Si no sabemos el total (null), mostramos "?"
    const total = serie.total === null ? "?" : serie.total;

    const texto = document.createElement("p");
    texto.className = "progreso__texto";
    texto.textContent = "Cap. " + serie.capitulo + " / " + total;
    progreso.append(texto);

    // La barra solo tiene sentido si conocemos el total
    if (serie.total !== null) {
        const barra = document.createElement("progress");
        barra.className = "barra";
        barra.max = serie.total;          // primero el máximo...
        barra.value = serie.capitulo;     // ...y luego el valor
        barra.textContent = serie.capitulo + " de " + serie.total;
        progreso.append(barra);
    }

    const botonMas = document.createElement("button");
    botonMas.type = "button";
    botonMas.className = "boton boton--mas";
    botonMas.textContent = "+1";
    botonMas.setAttribute("aria-label", "Sumar un capítulo a " + serie.titulo);
    progreso.append(botonMas);

    // Metemos las dos partes en la tarjeta y la devolvemos
    tarjeta.append(enlace, progreso);
    return tarjeta;
}

// Recibe un array de series y pinta una tarjeta por cada una
function pintarBiblioteca(series) {
    // Vaciamos la lista por si ya tenía tarjetas (servirá cuando filtremos)
    listaBiblioteca.replaceChildren();

    // Recorremos el array: "para cada serie de la lista..."
    for (const serie of series) {
        listaBiblioteca.append(crearTarjeta(serie));
    }
}

// Arrancamos: pintamos las series de ejemplo
pintarBiblioteca(seriesDeEjemplo);