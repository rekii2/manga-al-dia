// =========================================
// API DE ANILIST
// Este archivo SOLO habla con AniList: pide datos y los devuelve.
// No toca la pantalla (eso es cosa de ui.js).
// =========================================

// Dirección de la API. Todas las peticiones van aquí.
const URL_ANILIST = "https://graphql.anilist.co";

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

// Busca series en AniList y devuelve un array con los resultados.
// async: la función tarda, porque tiene que esperar a internet.
async function buscarSeries(texto) {
    // 1. Enviamos la petición y ESPERAMOS (await) la respuesta
    const respuesta = await fetch(URL_ANILIST, {
        method: "POST",                         // enviamos datos (la pregunta)
        headers: {
            "Content-Type": "application/json", // lo que mandamos es JSON
            "Accept": "application/json"        // y queremos JSON de vuelta
        },
        // JSON.stringify convierte nuestro objeto en texto JSON para enviarlo
        body: JSON.stringify({
            query: CONSULTA_BUSQUEDA,
            variables: { busqueda: texto }
        })
    });

    // 2. Si AniList responde con un error (por ejemplo, 429 = demasiadas peticiones),
    //    lanzamos un error para que quien llame a esta función se entere
    if (!respuesta.ok) {
        throw new Error("AniList ha respondido con el error " + respuesta.status);
    }

    // 3. Convertimos la respuesta (texto JSON) en un objeto de JavaScript
    const datos = await respuesta.json();

    // 4. Devolvemos solo la lista de series, que está dentro de data → Page → media
    return datos.data.Page.media;
}