// Remplace les valeurs ci-dessous par celles de ton projet Supabase
// (Trouvables dans Settings > API sur ton dashboard Supabase)
const SUPABASE_URL = "https://oysdycuouodarfkmdtop.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95c2R5Y3VvdW9kYXJma21kdG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjQ2ODYsImV4cCI6MjA4NzQwMDY4Nn0.9HQo_G4w7onI3ygJq0GprZxn-vgpXj2WdPnAgmqzv9k";

// On l'attache à 'window' pour qu'il soit global et visible par TOUS les fichiers JS
window._db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Connexion Supabase initialisée via _db");