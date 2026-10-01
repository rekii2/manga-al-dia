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

// Prueba: muestra el array en la consola para comprobar que el archivo se carga
console.log(seriesDeEjemplo);