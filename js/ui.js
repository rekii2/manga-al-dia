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
// FUNCIONES DE AYUDA
// Pequeñas funciones que usamos en varios sitios, para no repetir código.
// =========================================

// Devuelve el texto del progreso: "Cap. 7 / 24" o "Cap. 87 / ?" si no hay total
function textoProgreso(serie) {
    const total = serie.total === null ? "?" : serie.total;
    return "Cap. " + serie.capitulo + " / " + total;
}

// Devuelve true si ya vas por el último capítulo (solo si conocemos el total)
function haLlegadoAlFinal(serie) {
    return serie.total !== null && serie.capitulo >= serie.total;
}

// =========================================
// PINTAR LA BIBLIOTECA
// =========================================

// Buscamos en la página la lista <ul> donde irán las tarjetas
const listaBiblioteca = document.querySelector(".biblioteca");

// Crea la tarjeta (<li>) de UNA serie y la devuelve.
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

    textos.append(nombre, meta);
    enlace.append(portada, textos);

    // --- Parte de abajo: progreso, barra y botón +1 ---
    const progreso = document.createElement("div");
    progreso.className = "progreso tarjeta__progreso";

    const texto = document.createElement("p");
    texto.className = "progreso__texto";
    texto.textContent = textoProgreso(serie);
    progreso.append(texto);

    // La barra solo existe si conocemos el total.
    // La declaramos FUERA del if (con let y vacía) para poder usarla luego en el +1.
    let barra = null;
    if (serie.total !== null) {
        barra = document.createElement("progress");
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

    // Si ya vas por el último capítulo, el +1 empieza desactivado
    botonMas.disabled = haLlegadoAlFinal(serie);

    // Cuando pulsen el +1...
    botonMas.addEventListener("click", function () {
        // 1. Sumamos un capítulo EN LOS DATOS
        serie.capitulo = serie.capitulo + 1;

        // 2. Actualizamos lo que se ve: el texto...
        texto.textContent = textoProgreso(serie);

        // ...y la barra, si esta serie tiene
        if (barra !== null) {
            barra.value = serie.capitulo;
            barra.textContent = serie.capitulo + " de " + serie.total;
        }

        // 3. Si hemos llegado al final, desactivamos el botón
        botonMas.disabled = haLlegadoAlFinal(serie);
    });

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

// =========================================
// FILTRO POR ESTADO (pestañas)
// =========================================

// Todas las pestañas y el mensaje de "lista vacía"
const pestanas = document.querySelectorAll(".pestana");
const mensajeVacio = document.querySelector(".biblioteca__vacia");

// Nombres para mostrar en los mensajes (en los datos van en minúscula)
const nombresEstado = {
    leyendo: "Leyendo",
    pendiente: "Pendiente",
    terminada: "Terminada",
    abandonada: "Abandonada"
};

// Devuelve solo las series que tienen el estado indicado
function seriesConEstado(estado) {
    return seriesDeEjemplo.filter(function (serie) {
        return serie.estado === estado;
    });
}

// Pone en cada pestaña cuántas series tiene ese estado
function actualizarContadores() {
    for (const pestana of pestanas) {
        const cantidad = seriesConEstado(pestana.dataset.estado).length;
        pestana.querySelector(".pestana__numero").textContent = cantidad;
    }
}

// Muestra las series de un estado y marca su pestaña como activa
function mostrarEstado(estado) {
    // 1. Marcamos la pestaña pulsada y desmarcamos las demás
    for (const pestana of pestanas) {
        const esLaActiva = pestana.dataset.estado === estado;
        pestana.setAttribute("aria-pressed", esLaActiva ? "true" : "false");
    }

    // 2. Pintamos solo las series de ese estado
    const seriesFiltradas = seriesConEstado(estado);
    pintarBiblioteca(seriesFiltradas);

    // 3. Si no hay ninguna, enseñamos el mensaje; si hay, lo ocultamos
    if (seriesFiltradas.length === 0) {
        mensajeVacio.textContent = "No tienes series en «" + nombresEstado[estado] + "».";
        mensajeVacio.hidden = false;
    } else {
        mensajeVacio.hidden = true;
    }
}

// Solo arrancamos la biblioteca si estamos en biblioteca.html
// (en otras páginas no existe la lista y daría error)
if (listaBiblioteca) {
    // Cada pestaña, al pulsarla, muestra su estado
    for (const pestana of pestanas) {
        pestana.addEventListener("click", function () {
            mostrarEstado(pestana.dataset.estado);
        });
    }

    // Arrancamos: calculamos los números y mostramos "Leyendo"
    actualizarContadores();
    mostrarEstado("leyendo");
}

// =========================================
// BUSCADOR (index.html)
// =========================================

const formBuscador = document.querySelector(".buscador");
const inputBusqueda = document.querySelector("#busqueda");
const botonBuscar = document.querySelector(".buscador__boton");
const seccionResultados = document.querySelector(".resultados");
const listaResultados = document.querySelector(".resultados__lista");
const mensajeResultados = document.querySelector(".resultados__mensaje");

// AniList nos da el país de origen; con él sabemos el tipo de serie
const tiposPorPais = {
    JP: "Manga",
    KR: "Manhwa",
    CN: "Manhua",
    TW: "Manhua"
};

// Devuelve el tipo a partir del país. Si el país no está en la lista, "Manga".
function tipoDeSerie(pais) {
    return tiposPorPais[pais] || "Manga";
}

// Devuelve el título en inglés; si no tiene, el título en japonés/coreano con letras latinas
function tituloDeSerie(serie) {
    return serie.title.english || serie.title.romaji;
}

// Crea un resultado (<li>) a partir de una serie de AniList.
// Construye lo mismo que tenías escrito a mano en index.html.
function crearResultado(serie) {
    const item = document.createElement("li");

    const enlace = document.createElement("a");
    enlace.className = "resultado";
    enlace.href = "serie.html?id=" + serie.id;

    const portada = document.createElement("img");
    portada.className = "resultado__portada";
    portada.src = serie.coverImage.medium;
    portada.alt = "";

    const info = document.createElement("div");
    info.className = "resultado__info";

    const nombre = document.createElement("h3");
    nombre.className = "resultado__nombre";
    nombre.textContent = tituloDeSerie(serie);

    // "Manhwa · 2018". Si AniList no sabe el año, solo el tipo.
    const meta = document.createElement("p");
    meta.className = "resultado__meta";
    let textoMeta = tipoDeSerie(serie.countryOfOrigin);
    if (serie.startDate.year) {
        textoMeta = textoMeta + " · " + serie.startDate.year;
    }
    meta.textContent = textoMeta;

    info.append(nombre, meta);
    enlace.append(portada, info);
    item.append(enlace);
    return item;
}

// Enseña un mensaje en la zona de resultados ("Cargando…", errores...)
function mostrarMensaje(texto) {
    mensajeResultados.textContent = texto;
    mensajeResultados.hidden = false;
}

// Busca en AniList y pinta los resultados (o un mensaje si algo va mal)
async function hacerBusqueda(texto) {
    // Preparamos la pantalla: mostramos la sección, vaciamos la lista y avisamos
    seccionResultados.hidden = false;
    listaResultados.replaceChildren();
    mostrarMensaje("Cargando…");
    botonBuscar.disabled = true;   // evita que se pulse varias veces seguidas

    try {
        // Intentamos buscar...
        const series = await buscarSeries(texto);

        if (series.length === 0) {
            mostrarMensaje("No hay resultados para «" + texto + "».");
            return;   // salimos de la función: no hay nada que pintar
        }

        mensajeResultados.hidden = true;
        for (const serie of series) {
            listaResultados.append(crearResultado(serie));
        }
    } catch (error) {
        // ...y si algo falla, llegamos aquí
        console.error(error);   // el detalle técnico, para ti, en la consola (F12)

        if (!navigator.onLine) {
            mostrarMensaje("Sin conexión. Revisa tu internet e inténtalo de nuevo.");
        } else {
            mostrarMensaje("No se ha podido buscar. Inténtalo de nuevo en un momento.");
        }
    } finally {
        // Esto se ejecuta SIEMPRE, haya ido bien o mal
        botonBuscar.disabled = false;
    }
}

// Solo activamos el buscador si estamos en una página que lo tiene
if (formBuscador) {
    // "submit" salta al pulsar Buscar o al pulsar Enter dentro del input
    formBuscador.addEventListener("submit", function (evento) {
        // Por defecto, enviar un formulario recarga la página. Lo impedimos.
        evento.preventDefault();

        // trim() quita los espacios del principio y del final
        const texto = inputBusqueda.value.trim();
        if (texto === "") {
            return;   // no buscamos si solo hay espacios
        }

        hacerBusqueda(texto);
    });
}