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

// Cada pestaña, al pulsarla, muestra su estado
for (const pestana of pestanas) {
    pestana.addEventListener("click", function () {
        mostrarEstado(pestana.dataset.estado);
    });
}

// Arrancamos: calculamos los números y mostramos "Leyendo"
actualizarContadores();
mostrarEstado("leyendo");