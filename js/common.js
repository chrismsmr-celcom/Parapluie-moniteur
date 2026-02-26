/**
 * common.js - Gestionnaire de préférences globales (Supabase)
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Petit délai pour s'assurer que _db est bien prêt
    setTimeout(async () => {
        if (typeof _db === 'undefined') {
            console.error("Erreur : _db (Supabase) n'est pas accessible.");
            return;
        }

        try {
            // 1. Vérifier si l'utilisateur est connecté
            const { data: { session } } = await _db.auth.getSession();

            if (session) {
                // 2. Si oui, on synchronise ses préférences
                await syncGlobalPreferences(session.user.id);
            } else {
                // Si pas de session et qu'on n'est pas sur l'index, redirection
                if (!window.location.pathname.includes('index.html')) {
                    window.location.href = 'index.html';
                }
            }
        } catch (err) {
            console.error("Erreur de session globale:", err.message);
        }
    }, 50);
});

async function syncGlobalPreferences(userId) {
    try {
        // On récupère les réglages dans la table 'settings'
        const { data: settings, error } = await _db
            .from('settings')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;

        if (settings) {
            // A. Application du Mode Sombre
            if (settings.dark_mode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }

            // B. Mise à jour automatique des symboles monétaires ($ ou FC)
            // Note: utilise la classe .currency-label dans ton HTML pour que ça marche
            const currencyLabels = document.querySelectorAll('.currency-label');
            currencyLabels.forEach(el => {
                el.textContent = settings.currency || '$';
            });

            // C. Rendre les réglages accessibles aux autres scripts de la page
            window.userSettings = settings;
        }
    } catch (err) {
        console.warn("Préférences non trouvées, utilisation des valeurs par défaut.");
    }
}