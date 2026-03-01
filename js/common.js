/**
 * common.js - Gestionnaire de préférences globales, sécurité et interface
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Appliquer IMMEDIATEMENT le cache local (Évite le flash blanc en dark mode)
    applyLocalCache();

    // 2. Vérifier la connexion et synchroniser avec Supabase
    await checkAuthAndSync();
});

/**
 * Applique les réglages stockés en local pour une interface instantanée
 */
function applyLocalCache() {
    try {
        const config = JSON.parse(localStorage.getItem('moniteo_config')) || {};
        const sidebarStatus = localStorage.getItem('sidebarStatus');
        
        // A. Appliquer le Mode Sombre
        if (config.darkMode !== undefined) {
            document.body.classList.toggle('dark-mode', config.darkMode === true);
        }

        // B. Appliquer l'état de la Sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebarStatus === 'collapsed') {
            sidebar.classList.add('collapsed');
        }
        
        // C. Appliquer les symboles monétaires
        if (config.currency) {
            window.currentCurrency = config.currency; // Définit la variable globale
            updateCurrencyUI(config.currency);
        }
    } catch (e) {
        console.error("Erreur lecture localStorage", e);
    }
}

/**
 * Met à jour tous les labels de devise dans la page
 */
function updateCurrencyUI(currency) {
    document.querySelectorAll('.currency-label').forEach(el => {
        el.textContent = currency;
    });
}

/**
 * Vérifie l'authentification avec un système de retry pour _db
 */
async function checkAuthAndSync() {
    let attempts = 0;
    const maxAttempts = 20; 

    while (typeof _db === 'undefined' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (typeof _db === 'undefined') {
        console.error("❌ Supabase n'est pas initialisé.");
        return;
    }

    try {
        const { data: { session }, error: sessionError } = await _db.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
            console.log("✅ Connecté :", session.user.email);
            await syncGlobalPreferences(session.user.id);
        } else {
            // Protection des pages privées
            const path = window.location.pathname;
            const isLoginPage = path.includes('index.html') || path === '/' || path.endsWith('index.html');
            
            if (!isLoginPage) {
                window.location.replace('index.html');
            }
        }
    } catch (err) {
        console.error("❌ Erreur session:", err.message);
    }
}

/**
 * Synchronise les réglages Cloud vers le LocalStorage
 */
async function syncGlobalPreferences(userId) {
    try {
        const { data: settings, error } = await _db
            .from('settings')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;

        if (settings) {
            const configToSave = {
                name: settings.company_name || "Mon Entreprise",
                currency: settings.currency || "FC",
                rate: parseFloat(settings.exchange_rate) || 2800,
                darkMode: settings.dark_mode === true,
                logo: settings.logo_url || "",
                matricule: settings.custom_id || ""
            };

            localStorage.setItem('moniteo_config', JSON.stringify(configToSave));
            window.currentCurrency = configToSave.currency;

            // Appliquer les changements à l'UI
            document.body.classList.toggle('dark-mode', configToSave.darkMode);
            updateCurrencyUI(configToSave.currency);

            // Appel de la fonction de rendu global si elle existe
            if (typeof applyGlobalSettings === 'function') {
                applyGlobalSettings();
            }
        }
    } catch (err) {
        console.warn("⚠️ Mode hors-ligne : utilisation du cache local.");
    }
}

/**
 * Gère l'affichage des menus déroulants de manière exclusive
 * Correction : Ajout de l'événement en paramètre pour plus de stabilité
 */
function toggleDropdown(id) {
    // Empêcher la propagation si l'événement existe
    if (window.event) window.event.stopPropagation();

    const targetMenu = document.getElementById(id);
    if (!targetMenu) return;

    // 1. Fermer tous les autres menus
    document.querySelectorAll('.dropdown-menu, .dropdown-content').forEach(menu => {
        if (menu.id !== id) {
            menu.classList.remove('show');
        }
    });

    // 2. Basculer le menu actuel
    targetMenu.classList.toggle('show');
}

// Fermer les menus si on clique ailleurs
window.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu, .dropdown-content').forEach(menu => {
        menu.classList.remove('show');
    });
});
