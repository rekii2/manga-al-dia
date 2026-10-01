// =========================================
// API DE ANILIST
// Este archivo SOLO habla con AniList: pide datos y los devuelve.
// No toca la pantalla (eso es cosa de ui.js).
// =========================================

// Dirección de la API. Todas las peticiones van aquí.
const URL_ANILIST = "https://graphql.anilist.co";

// Envía una consulta GraphQL a AniList y devuelve los datos de la respuesta.
// La usan todas las demás funciones, para no repetir el fetch en cada una.
async function consultarAniList(consulta, variables) {
    // 1. Enviamos la petición y ESPERAMOS (await) la respuesta
    const respuesta = await fetch(URL_ANILIST, {
        method: "POST",                         // enviamos datos (la pregunta)
        headers: {
            "Content-Type": "application/json", // lo que mandamos es JSON
            "Accept": "application/json"        // y queremos JSON de vuelta
        },
        // JSON.stringify convierte nuestro objeto en texto JSON para enviarlo
        body: JSON.stringify({
            query: consulta,
            variables: variables
        })
    });

    // 2. Si AniList responde con un error (404 = no existe, 429 = demasiadas peticiones...),
    //    lanzamos un error para que quien llame a esta función se entere
    if (!respuesta.ok) {
        throw new Error("AniList ha respondido con el error " + respuesta.status);
    }

    // 3. Convertimos la respuesta (texto JSON) en un objeto de JavaScript
    const json = await respuesta.json();
    return json.data;
}

// ---------- BÚSQUEDA (index.html) ----------

// La "pregunta" en GraphQL para buscar series.
// Va entre comillas invertidas (`) porque ocupa varias líneas.
// $busqueda es una variable: el texto que escriba el usuario.
const CONSULTA_BUSQUEDA = `
    query ($busqueda: String) {
        Page(perPage: 10) {
            media(search: $busqueda, type: MANGA, isAdult: false, sort: SEARCH_MATCH) {
                id
                title {
                    romaji
                    english
                }
                coverImage {
                    medium
                }
                countryOfOrigin
                startDate {
                    year
                }
            }
        }
    }
`;

// Busca series y devuelve un array con los resultados
async function buscarSeries(texto) {
    const datos = await consultarAniList(CONSULTA_BUSQUEDA, { busqueda: texto });
    // La lista de series está dentro de data → Page → media
    return datos.Page.media;
}

// ---------- FICHA DE UNA SERIE (serie.html) ----------

// Pedimos todo lo que necesita la ficha de UNA serie, buscándola por su id
const CONSULTA_SERIE = `
    query ($id: Int) {
        Media(id: $id, type: MANGA) {
            id
            title {
                romaji
                english
            }
            coverImage {
                large
            }
            bannerImage
            chapters
            status
            startDate {
                year
            }
            endDate {
                year
            }
            averageScore
            genres
            description(asHtml: false)
        }
    }
`;

// Devuelve los datos de una serie a partir de su id
async function obtenerSerie(id) {
    const datos = await consultarAniList(CONSULTA_SERIE, { id: id });
    return datos.Media;
}