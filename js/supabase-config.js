/**
 * supabase-config.js - Initialisation globale de la base de données
 */

// 1. Configuration des accès (Vérifie bien que ces valeurs sont exactes)
const SUPABASE_URL = "https://oysdycuouodarfkmdtop.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95c2R5Y3VvdW9kYXJma21kdG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjQ2ODYsImV4cCI6MjA4NzQwMDY4Nn0.9HQo_G4w7onI3ygJq0GprZxn-vgpXj2WdPnAgmqzv9k";

// 2. Initialisation du client
// On utilise 'window._db' pour forcer la portée globale
try {
    window._db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Connexion Supabase initialisée avec succès via window._db");
} catch (error) {
    console.error("❌ Erreur lors de l'initialisation de Supabase :", error.message);
}
