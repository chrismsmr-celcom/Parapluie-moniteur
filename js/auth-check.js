/**
 * MONITEO PRO - auth-check.js
 */
const SUPABASE_URL = 'https://oysdycuouodarfkmdtop.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95c2R5Y3VvdW9kYXJma21kdG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjQ2ODYsImV4cCI6MjA4NzQwMDY4Nn0.9HQo_G4w7onI3ygJq0GprZxn-vgpXj2WdPnAgmqzv9k';

// On utilise "var" ou on vérifie avant de déclarer pour éviter le "Already declared"
if (typeof _db === 'undefined') {
    var _db;
}

function initSupabase() {
    if (typeof supabase !== 'undefined') {
        _db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
}

// Initialise immédiatement
initSupabase();

let currentUser = null;
let currentCurrency = localStorage.getItem('moniteo_currency') || "FC";

async function protectPage(callback) {
    // Si _db n'est pas encore prêt, on réessaye une fois
    if (!_db) initSupabase();
    
    if (!_db) {
        console.error("❌ Supabase est introuvable. Vérifiez l'ordre des scripts.");
        return;
    }

    const { data: { session }, error } = await _db.auth.getSession();
    if (error || !session) {
        window.location.replace('index.html');
        return;
    }

    currentUser = session.user;
    syncUI();
    if (callback) callback(currentUser);
}
/**
 * SYNC UI : Met à jour les éléments visuels communs
 */
function syncUI() {
    // 1. Nom de l'entreprise
    const savedName = localStorage.getItem('moniteo_comp_name') || "Mon Entreprise";
    const nameElements = ['company-display', 'companyTitle', 'sidebar-company-name'];
    
    nameElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'companyTitle') {
                el.innerHTML = `Tableau de Bord <small style="font-size:0.6em; opacity: 0.8;">| ${savedName}</small>`;
            } else {
                el.innerText = savedName;
            }
        }
    });

    // 2. Logo
    const savedLogo = localStorage.getItem('moniteo_logo_url');
    const logoCont = document.getElementById('dynamicLogoContainer');
    if (logoCont && savedLogo) {
        logoCont.innerHTML = `<img src="${savedLogo}" style="height: 40px; width: auto; border-radius: 4px; object-fit: contain;">`;
    }

    // 3. Date
    const dateEl = document.getElementById('dateDisplay');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    }
}

/**
 * LOGOUT : Déconnexion et nettoyage
 */
async function logout() {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        try {
            await _db.auth.signOut();
            localStorage.clear();
            window.location.replace("index.html");
        } catch (err) {
            console.error("Erreur déconnexion:", err);
            window.location.replace("index.html");
        }
    }
}