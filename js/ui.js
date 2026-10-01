// =========================================
// INTERFAZ (ui.js)
// Este archivo pinta la pantalla y reacciona a los clics.
// Los datos de AniList los pide a api.js, la biblioteca la guarda/lee con storage.js (Supabase)
// y las cuentas las gestiona auth.js.
// =========================================

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

    // Cuando pulsen el +1... (async porque guardar en Supabase tarda un poco)
    botonMas.addEventListener("click", async function () {
        botonMas.disabled = true;   // evita dobles clics mientras se guarda

        try {
            // 1. Guardamos en Supabase PRIMERO. Si falla, saltamos al catch y no cambiamos nada.
            await actualizarCapitulo(serie.id, serie.capitulo + 1);

            // 2. Ha ido bien: actualizamos los datos y lo que se ve (texto y barra)
            serie.capitulo = serie.capitulo + 1;
            texto.textContent = textoProgreso(serie);
            if (barra !== null) {
                barra.value = serie.capitulo;
                barra.textContent = serie.capitulo + " de " + serie.total;
            }
        } catch (error) {
            console.error(error);
            mostrarMensajeBiblioteca("No se ha podido guardar el capítulo. Revisa tu conexión.");
        }

        // 3. Volvemos a activar el botón (salvo que hayamos llegado al final)
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

// Copia de la biblioteca del usuario. La pedimos a Supabase UNA vez al abrir la página
// y la reutilizamos al cambiar de pestaña, para no pedirla cada vez.
let bibliotecaActual = [];

// Enseña un mensaje debajo de la lista ("Cargando…", errores, avisos)
function mostrarMensajeBiblioteca(texto) {
    mensajeVacio.textContent = texto;
    mensajeVacio.hidden = false;
}

// Devuelve solo las series que tienen el estado indicado
function seriesConEstado(estado) {
    return bibliotecaActual.filter(function (serie) {
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
    if (bibliotecaActual.length === 0) {
        // La biblioteca entera está vacía (por ejemplo, la primera vez)
        mostrarMensajeBiblioteca("Aún no tienes series. ¡Busca una en el inicio!");
    } else if (seriesFiltradas.length === 0) {
        // Hay series, pero ninguna con este estado
        mostrarMensajeBiblioteca("No tienes series en «" + nombresEstado[estado] + "».");
    } else {
        mensajeVacio.hidden = true;
    }
}

// Comprueba la sesión, pide la biblioteca a Supabase y la pinta
async function cargarBiblioteca() {
    mostrarMensajeBiblioteca("Cargando tu biblioteca…");

    try {
        // Sin sesión no hay biblioteca: avisamos y no seguimos
        const usuario = await obtenerUsuario();
        if (usuario === null) {
            mostrarMensajeBiblioteca("Inicia sesión en «Mi cuenta» para ver tu biblioteca.");
            return;
        }

        // Pedimos las series y las pintamos
        bibliotecaActual = await obtenerBiblioteca();
        actualizarContadores();
        mostrarEstado("leyendo");
    } catch (error) {
        console.error(error);
        mostrarMensajeBiblioteca("No se ha podido cargar tu biblioteca. Revisa tu conexión y recarga.");
    }
}

// Solo arrancamos la biblioteca si estamos en biblioteca.html
// (en otras páginas no existe la lista y daría error)
if (listaBiblioteca) {
    // Cada pestaña, al pulsarla, muestra su estado (con los datos que ya tenemos)
    for (const pestana of pestanas) {
        pestana.addEventListener("click", function () {
            mostrarEstado(pestana.dataset.estado);
        });
    }

    // Arrancamos
    cargarBiblioteca();
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

// =========================================
// FICHA DE SERIE (serie.html)
// =========================================

const fichaSerie = document.querySelector("#ficha");
const mensajeFicha = document.querySelector("#mensaje-ficha");

// AniList da el estado de publicación en inglés y mayúsculas; lo traducimos
const textosPublicacion = {
    RELEASING: "Publicándose",
    FINISHED: "Finalizada",
    HIATUS: "En pausa",
    CANCELLED: "Cancelada",
    NOT_YET_RELEASED: "Próximamente"
};

// Devuelve los años: "2018–2021", "2018–" (si sigue publicándose) o "2018"
function textoAnios(serie) {
    const inicio = serie.startDate.year;
    const fin = serie.endDate.year;

    if (!inicio) {
        return "?";
    }
    if (fin && fin !== inicio) {
        return inicio + "–" + fin;
    }
    if (serie.status === "RELEASING") {
        return inicio + "–";
    }
    return String(inicio);
}

// AniList da la nota de 0 a 100 (ej. 88). La mostramos sobre 10: "★ 8,8"
function textoNota(serie) {
    if (!serie.averageScore) {
        return "—";
    }
    // toFixed(1): un decimal. replace: cambia el punto por coma, como en español
    const nota = (serie.averageScore / 10).toFixed(1).replace(".", ",");
    return "★ " + nota;
}

// La descripción de AniList trae etiquetas como <br> o <i>. Las quitamos:
// los <br> se convierten en saltos de línea y el resto de etiquetas se borran.
function limpiarDescripcion(texto) {
    if (!texto) {
        return "Sin descripción.";
    }
    return texto
        .replace(/<br\s*\/?>\n?/gi, "\n") // <br> (y el salto que suele llevar detrás) → un salto de línea
        .replace(/<[^>]*>/g, "")         // cualquier otra etiqueta <...> → nada
        .trim();
}

// Rellena la ficha con los datos de la serie
function pintarFicha(serie) {
    const titulo = tituloDeSerie(serie);

    // Título de la pestaña del navegador
    document.title = titulo + " · Manga al Día";

    // Banner: si la serie no tiene, usamos la portada difuminada
    const banner = document.querySelector("#ficha-banner");
    if (serie.bannerImage) {
        banner.src = serie.bannerImage;
    } else {
        banner.src = serie.coverImage.large;
        banner.classList.add("ficha__banner-img--difuminada");
    }

    const portada = document.querySelector("#ficha-portada");
    portada.src = serie.coverImage.large;
    portada.alt = "Portada de " + titulo;

    document.querySelector("#ficha-titulo").textContent = titulo;

    // Los 4 datos. Si AniList no sabe algo (null), ponemos "?"
    document.querySelector("#dato-capitulos").textContent = serie.chapters || "?";
    document.querySelector("#dato-publicacion").textContent = textosPublicacion[serie.status] || "?";
    document.querySelector("#dato-anios").textContent = textoAnios(serie);
    document.querySelector("#dato-nota").textContent = textoNota(serie);

    // Géneros: una píldora por cada uno
    const listaGeneros = document.querySelector("#ficha-generos");
    listaGeneros.replaceChildren();
    for (const genero of serie.genres) {
        const item = document.createElement("li");
        item.className = "genero";
        item.textContent = genero;
        listaGeneros.append(item);
    }

    // Descripción: limpia y con textContent (nunca innerHTML con datos externos)
    document.querySelector("#ficha-descripcion").textContent = limpiarDescripcion(serie.description);
}

// =========================================
// FICHA: BLOQUE DEL USUARIO (añadir, estado, progreso)
// =========================================

const botonAnadir = document.querySelector("#boton-anadir");
const selectEstado = document.querySelector("#estado");
const progresoFicha = document.querySelector("#progreso-ficha");
const textoProgresoFicha = document.querySelector("#progreso-ficha-texto");
const botonMasFicha = document.querySelector("#boton-mas-ficha");
const botonQuitar = document.querySelector("#boton-quitar");
const errorUsuario = document.querySelector("#error-usuario");

// La serie de AniList que se está viendo. Se rellena al cargar la ficha.
let serieActual = null;

// ¿Hay alguien con sesión iniciada? Lo guardamos al pintar el bloque.
let hayUsuario = false;

// ¿Has llegado al último capítulo? Si es así, el +1 debe quedarse desactivado.
let finAlcanzado = false;

// Enseña un error pequeño en el bloque del usuario
function mostrarErrorUsuario(texto) {
    errorUsuario.textContent = texto;
    errorUsuario.hidden = false;
}

// Desactiva o activa todos los controles del bloque (mientras se guarda en Supabase)
function bloquearControles(bloquear) {
    botonAnadir.disabled = bloquear;
    selectEstado.disabled = bloquear;
    botonMasFicha.disabled = bloquear || finAlcanzado;   // || = "o"
    botonQuitar.disabled = bloquear;
}

// Enseña unas partes u otras según si hay sesión y si la serie está en tu biblioteca
async function pintarBloqueUsuario() {
    errorUsuario.hidden = true;
    finAlcanzado = false;

    // 1. ¿Hay sesión? Si no, el botón invita a iniciarla
    const usuario = await obtenerUsuario();
    hayUsuario = usuario !== null;

    if (!hayUsuario) {
        botonAnadir.textContent = "Inicia sesión para añadir";
        botonAnadir.hidden = false;
        selectEstado.hidden = true;
        progresoFicha.hidden = true;
        botonQuitar.hidden = true;
        return;
    }

    // 2. Hay sesión: ¿está esta serie en su biblioteca?
    botonAnadir.textContent = "Añadir a la lista";
    const guardada = await obtenerSerieGuardada(serieActual.id);

    // No está en tu biblioteca: solo el botón "Añadir a la lista"
    if (guardada === null) {
        botonAnadir.hidden = false;
        selectEstado.hidden = true;
        progresoFicha.hidden = true;
        botonQuitar.hidden = true;
        return;
    }

    // Sí está: ocultamos "Añadir" y enseñamos estado, progreso y "Quitar"
    botonAnadir.hidden = true;
    selectEstado.hidden = false;
    progresoFicha.hidden = false;
    botonQuitar.hidden = false;

    // Rellenamos con lo guardado
    selectEstado.value = guardada.estado;   // el desplegable muestra tu estado
    textoProgresoFicha.textContent = textoProgreso(guardada);
    finAlcanzado = haLlegadoAlFinal(guardada);
    botonMasFicha.disabled = finAlcanzado;
}

// Hace una acción con Supabase (añadir, +1, quitar...) y después repinta el bloque.
// "accion" es una función async. Así no repetimos el mismo try/catch en cada botón.
async function ejecutarAccionUsuario(accion) {
    bloquearControles(true);
    try {
        await accion();
        await pintarBloqueUsuario();
    } catch (error) {
        console.error(error);
        mostrarErrorUsuario("No se ha podido guardar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
        bloquearControles(false);
    }
}

// Solo en serie.html: conectamos los botones del bloque del usuario
if (fichaSerie) {
    // Añadir a la lista (o ir a "Mi cuenta" si no hay sesión)
    botonAnadir.addEventListener("click", function () {
        if (!hayUsuario) {
            window.location.href = "cuenta.html";   // nos vamos a la página de la cuenta
            return;
        }

        ejecutarAccionUsuario(async function () {
            await anadirSerie({
                id: serieActual.id,
                titulo: tituloDeSerie(serieActual),
                tipo: tipoDeSerie(serieActual.countryOfOrigin),
                portada: serieActual.coverImage.medium,
                total: serieActual.chapters      // null si AniList no lo sabe
            }, "pendiente");
        });
    });

    // Cambiar el estado en el desplegable ("change" salta al elegir otra opción)
    selectEstado.addEventListener("change", function () {
        ejecutarAccionUsuario(async function () {
            await cambiarEstado(serieActual.id, selectEstado.value);
        });
    });

    // +1: leemos el capítulo guardado, sumamos uno y guardamos
    botonMasFicha.addEventListener("click", function () {
        ejecutarAccionUsuario(async function () {
            const guardada = await obtenerSerieGuardada(serieActual.id);
            await actualizarCapitulo(serieActual.id, guardada.capitulo + 1);
        });
    });

    // Quitar de la lista
    botonQuitar.addEventListener("click", function () {
        ejecutarAccionUsuario(async function () {
            await eliminarSerie(serieActual.id);
        });
    });
}

// Lee el id de la dirección (serie.html?id=151807), pide la serie y la pinta
async function cargarFicha() {
    // URLSearchParams lee lo que va detrás del "?" en la dirección
    const parametros = new URLSearchParams(window.location.search);
    const id = Number(parametros.get("id"));

    // Si no hay id o no es un número entero positivo, no seguimos
    if (!Number.isInteger(id) || id <= 0) {
        mensajeFicha.textContent = "No se ha indicado ninguna serie. Vuelve al inicio y busca una.";
        return;
    }

    try {
        const serie = await obtenerSerie(id);
        pintarFicha(serie);

        // Todo listo: ocultamos el mensaje y enseñamos la ficha
        mensajeFicha.hidden = true;
        fichaSerie.hidden = false;

        // Guardamos la serie que se está viendo y pintamos tu bloque (añadir/estado/progreso).
        // Va aparte: si Supabase fallara, la ficha de AniList se sigue viendo igual.
        serieActual = serie;
        bloquearControles(true);
        pintarBloqueUsuario()
            .catch(function (error) {
                console.error(error);
                mostrarErrorUsuario("No se ha podido cargar tu biblioteca. Revisa tu conexión.");
            })
            .finally(function () {
                bloquearControles(false);
            });
    } catch (error) {
        console.error(error);

        if (!navigator.onLine) {
            mensajeFicha.textContent = "Sin conexión. Revisa tu internet y recarga la página.";
        } else {
            mensajeFicha.textContent = "No se ha podido cargar esta serie. Puede que no exista o que AniList no responda.";
        }
    }
}

// Solo cargamos la ficha si estamos en serie.html
if (fichaSerie) {
    cargarFicha();
}

// =========================================
// CUENTA (cuenta.html): registro, inicio y cierre de sesión
// =========================================

const formCuenta = document.querySelector("#form-cuenta");
const inputEmail = document.querySelector("#email");
const inputContrasena = document.querySelector("#contrasena");
const mensajeCuenta = document.querySelector("#mensaje-cuenta");
const sesionCuenta = document.querySelector("#sesion-cuenta");
const emailUsuario = document.querySelector("#email-usuario");
const botonSalir = document.querySelector("#boton-salir");

// Supabase da los errores en inglés y con un código. Traducimos los más habituales.
const erroresCuenta = {
    invalid_credentials: "Correo o contraseña incorrectos.",
    user_already_exists: "Ya existe una cuenta con ese correo. Prueba a iniciar sesión.",
    email_exists: "Ya existe una cuenta con ese correo. Prueba a iniciar sesión.",
    weak_password: "La contraseña es demasiado débil. Usa al menos 8 caracteres.",
    email_address_invalid: "Ese correo no es válido.",
    over_request_rate_limit: "Demasiados intentos seguidos. Espera un momento y vuelve a probar."
};

// Enseña un mensaje en la página de la cuenta. Si esError es true, sale en rojo.
function mostrarMensajeCuenta(texto, esError) {
    mensajeCuenta.textContent = texto;
    mensajeCuenta.hidden = false;
    // classList.toggle(clase, condición): pone la clase si la condición es true, la quita si es false
    mensajeCuenta.classList.toggle("cuenta__mensaje--error", esError);
}

// Pregunta a Supabase si hay sesión y enseña el formulario o "Has iniciado sesión como…"
async function pintarCuenta() {
    const usuario = await obtenerUsuario();

    if (usuario === null) {
        // Nadie ha entrado: formulario visible, bloque de sesión oculto
        formCuenta.hidden = false;
        sesionCuenta.hidden = true;
    } else {
        // Hay sesión: ocultamos el formulario y enseñamos el correo
        formCuenta.hidden = true;
        sesionCuenta.hidden = false;
        emailUsuario.textContent = usuario.email;
    }
}

// Solo en cuenta.html
if (formCuenta) {
    // Al enviar el formulario (con cualquiera de los dos botones)...
    formCuenta.addEventListener("submit", async function (evento) {
        evento.preventDefault();   // que no recargue la página

        // evento.submitter es el botón que se ha pulsado; su value dice cuál ("entrar" o "registrar")
        const accion = evento.submitter.value;
        const email = inputEmail.value.trim();
        const contrasena = inputContrasena.value;

        // Desactivamos los botones mientras esperamos a Supabase
        const botones = formCuenta.querySelectorAll("button");
        for (const boton of botones) {
            boton.disabled = true;
        }
        mostrarMensajeCuenta("Un momento…", false);

        try {
            if (accion === "registrar") {
                await registrarse(email, contrasena);
                mostrarMensajeCuenta("¡Cuenta creada! Ya has iniciado sesión.", false);
            } else {
                await iniciarSesion(email, contrasena);
                mostrarMensajeCuenta("¡Hola de nuevo! Has iniciado sesión.", false);
            }
            formCuenta.reset();   // vacía los campos
            await pintarCuenta();
        } catch (error) {
            console.error(error);
            // Si conocemos el código del error, lo traducimos; si no, un mensaje general
            const texto = erroresCuenta[error.code] || "No se ha podido completar. Revisa los datos e inténtalo de nuevo.";
            mostrarMensajeCuenta(texto, true);
        } finally {
            for (const boton of botones) {
                boton.disabled = false;
            }
        }
    });

    // Cerrar sesión
    botonSalir.addEventListener("click", async function () {
        try {
            await cerrarSesion();
            mostrarMensajeCuenta("Has cerrado sesión.", false);
            await pintarCuenta();
        } catch (error) {
            console.error(error);
            mostrarMensajeCuenta("No se ha podido cerrar la sesión. Inténtalo de nuevo.", true);
        }
    });

    // Al abrir la página: miramos si ya hay sesión
    pintarCuenta()
        .then(function () {
            mensajeCuenta.hidden = true;   // quitamos el "Cargando…"
        })
        .catch(function (error) {
            console.error(error);
            mostrarMensajeCuenta("No se ha podido conectar con el servidor. Revisa tu conexión y recarga.", true);
        });
}