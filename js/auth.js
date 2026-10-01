// =========================================
// CUENTAS DE USUARIO (Supabase Auth)
// Este archivo SOLO se encarga de conectar con Supabase y de las cuentas:
// registrarse, iniciar sesión, cerrar sesión y saber quién ha entrado.
// =========================================

// Dirección de tu proyecto de Supabase
const SUPABASE_URL = "https://cdfirnkvakzxhvbyerfo.supabase.co";

// Clave PÚBLICA (publishable). Puede estar en el código y en GitHub:
// la seguridad la ponen las reglas RLS de la base de datos.
// ⚠️ La clave secreta (sb_secret_... / service_role) NUNCA debe ir aquí.
const SUPABASE_CLAVE_PUBLICA = "sb_publishable_yZvvv7K4hsSlW5txp7JOrw_U8jtXbwx";

// Creamos el "cliente": el objeto con el que hablaremos con Supabase.
// "supabase" (en minúscula) lo crea la librería que cargamos en el HTML.
const clienteSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_CLAVE_PUBLICA);

// Crea una cuenta nueva. Como desactivamos "Confirm email", la sesión queda iniciada directamente.
async function registrarse(email, contrasena) {
    // Supabase siempre responde con un objeto { data, error }.
    // Así sacamos esas dos partes en dos variables a la vez.
    const { data, error } = await clienteSupabase.auth.signUp({
        email: email,
        password: contrasena
    });

    // Si Supabase dice que algo ha ido mal, lanzamos el error para que lo recoja ui.js
    if (error) {
        throw error;
    }
    return data.user;
}

// Inicia sesión con una cuenta que ya existe
async function iniciarSesion(email, contrasena) {
    const { data, error } = await clienteSupabase.auth.signInWithPassword({
        email: email,
        password: contrasena
    });

    if (error) {
        throw error;
    }
    return data.user;
}

// Cierra la sesión
async function cerrarSesion() {
    const { error } = await clienteSupabase.auth.signOut();

    if (error) {
        throw error;
    }
}

// Devuelve el usuario que ha iniciado sesión, o null si no hay nadie.
// Supabase guarda la sesión en el navegador, así que sigue iniciada aunque recargues.
async function obtenerUsuario() {
    const { data } = await clienteSupabase.auth.getSession();

    if (data.session === null) {
        return null;
    }
    return data.session.user;
}