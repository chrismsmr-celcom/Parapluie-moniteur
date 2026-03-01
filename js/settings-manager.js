/**
 * SETTINGS-MANAGER.JS
 * Gère la synchronisation des préférences et l'affichage du header universel
 */

async function syncApp() {
    // 1. Appliquer le cache immédiatement pour éviter le "blanc" au chargement
    applyGlobalSettings();

    try {
        // Vérifier la session avec getSession (plus rapide que getUser)
        const { data: { session } } = await _db.auth.getSession();
        if (!session) return;

        const { data: settings, error } = await _db
            .from('settings')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

        if (error) throw error;

        if (settings) {
            const configToSave = {
                name: settings.company_name || "Mon Entreprise",
                currency: settings.currency || "FC",
                rate: parseFloat(settings.exchange_rate) || 2800,
                darkMode: settings.dark_mode || false,
                logo: settings.logo_url || "",
                matricule: settings.custom_id || ""
            };
            
            // Mettre à jour le cache local
            localStorage.setItem('moniteo_config', JSON.stringify(configToSave));
            
            // 2. Mettre à jour l'interface avec les données fraîches du serveur
            applyGlobalSettings(); 
        }
    } catch (err) {
        console.error("Erreur de synchronisation des réglages:", err);
    } finally {
        // 3. LANCEMENT DES FONCTIONS SPÉCIFIQUES À CHAQUE PAGE
        // On déclenche les inits si les fonctions existent dans les scripts locaux
        if (typeof initDashboard === "function") initDashboard();
        if (typeof fetchExpenses === "function") fetchExpenses(); 
        if (typeof loadInventory === "function") loadInventory();
        if (typeof fetchStaff === "function") fetchStaff();
    }
}

function applyGlobalSettings() {
    const config = JSON.parse(localStorage.getItem('moniteo_config')) || {};
    
    // Variables globales accessibles partout pour les calculs
    window.globalRate = config.rate || 2800;
    window.currentCurrency = config.currency || "FC";

    // --- APPLICATION AU DESIGN ---
    
    // Mode sombre
    document.body.classList.toggle('dark-mode', config.darkMode === true);

    // Nom de l'entreprise (Subtitle ou Title selon la page)
    const subTitle = document.getElementById('companySubtitle');
    if (subTitle && config.name) subTitle.innerText = config.name;

    const mainTitle = document.getElementById('companyTitle');
    if (mainTitle && config.name) mainTitle.innerText = config.name;

    // Logo Dynamique
    const logoCont = document.getElementById('dynamicLogoContainer');
    if (logoCont) {
        if (config.logo) {
            logoCont.innerHTML = `<img src="${config.logo}" style="max-height: 45px; width: auto; object-fit: contain; border-radius: 5px;">`;
        } else {
            // Placeholder si pas de logo : cercle avec initiale
            const initial = config.name ? config.name.charAt(0) : "M";
            logoCont.innerHTML = `<div style="width:40px; height:40px; background:var(--secondary-soft); color:var(--secondary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; border: 1px solid var(--border-soft);">${initial}</div>`;
        }
    }

    // Mise à jour de la Date (Format: Vendredi 28 Février 2026)
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) {
        const today = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        let dateStr = today.toLocaleDateString('fr-FR', options);
        // Capitaliser la première lettre (ex: vendredi -> Vendredi)
        dateDisplay.innerText = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }

    // Mise à jour des labels de devise statiques (ex: $)
    document.querySelectorAll('.currency-label').forEach(el => {
        el.innerText = config.currency || "FC";
    });
}

// Lancer le processus dès que le DOM est prêt
document.addEventListener('DOMContentLoaded', syncApp);