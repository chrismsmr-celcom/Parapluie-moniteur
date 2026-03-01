// Remplace 'let currentUser' par ceci pour éviter les doublons
if (typeof window.currentUser === 'undefined') {
    window.currentUser = null;
}
// Idem pour currentCurrency
if (typeof window.currentCurrency === 'undefined') {
    window.currentCurrency = localStorage.getItem('moniteo_currency') || "FC";
}
async function protectPage(callback) {
    // On récupère le client db depuis window si possible
    const db = window._db;
    
    if (!db) {
        console.error("❌ Erreur : _db n'est pas initialisé. Vérifiez l'ordre de chargement des scripts.");
        return;
    }

    try {
        const { data: { session }, error } = await db.auth.getSession();
        
        if (error || !session) {
            console.warn("🔒 Session absente ou expirée, redirection...");
            window.location.replace('index.html');
            return;
        }

        // Si on arrive ici, l'utilisateur est authentifié
        currentUser = session.user;
        
        // On synchronise l'UI (Titre, Date, Logo)
        syncUI();
        
        // On lance la suite (chargement des données spécifiques à la page)
        if (callback) callback(currentUser);
        
    } catch (err) {
        console.error("❌ Erreur lors de la vérification de l'auth:", err);
        window.location.replace('index.html');
    }
}

/**
 * SYNC UI : Met à jour les éléments visuels communs
 */
function syncUI() {
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

    const savedLogo = localStorage.getItem('moniteo_logo_url');
    const logoCont = document.getElementById('dynamicLogoContainer');
    if (logoCont && savedLogo) {
        logoCont.innerHTML = `<img src="${savedLogo}" style="height: 40px; width: auto; border-radius: 4px; object-fit: contain;">`;
    }

    const dateEl = document.getElementById('dateDisplay');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('fr-FR', {
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
            if (window._db) {
                await window._db.auth.signOut();
            }
            localStorage.clear();
            window.location.replace("index.html");
        } catch (err) {
            console.error("Erreur déconnexion:", err);
            window.location.replace("index.html");
        }
    }
}
