/**
 * RECHERCHE.JS - Système de reconnaissance universel Umbrella
 */

// Fonction de feedback sonore (Optionnel mais Pro)
const AudioFeedback = {
    playSuccess: () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/766/766-preview.mp3');
        audio.play().catch(() => {});
    },
    playError: () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1157/1157-preview.mp3');
        audio.volume = 0.2;
        audio.play().catch(() => {});
    }
};

/**
 * Traite le code scanné et agit selon la page actuelle
 */
async function handleScannedCode(code) {
    console.log("Recherche du code :", code);
    
    try {
        // 1. Recherche dans l'inventaire Supabase
        const { data: product, error } = await window._db
            .from('inventory')
            .select('*')
            .eq('barcode', code)
            .maybeSingle();

        if (error) throw error;

        if (product) {
            AudioFeedback.playSuccess();
            
            // 2. Détection de la page actuelle
            const isSalesPage = window.location.pathname.includes('sales.html');
            const isInventoryPage = window.location.pathname.includes('inventory.html');

            if (isSalesPage) {
                // Si on est sur la page de vente, on ajoute au panier
                if (typeof addSaleRow === 'function') {
                    addSaleRow(product);
                }
            } else if (isInventoryPage) {
                // Si on est sur l'inventaire, on filtre le tableau
                const searchInput = document.querySelector('.search-bar input') || document.getElementById('searchBar');
                if (searchInput) {
                    searchInput.value = code;
                    // Déclenche l'événement de recherche
                    searchInput.dispatchEvent(new Event('input'));
                }
            }
            
            if (typeof showToast === 'function') {
                showToast(`Produit trouvé : ${product.product}`, "success");
            } else {
                console.log(`Produit trouvé : ${product.product}`);
            }

        } else {
            AudioFeedback.playError();
            if (typeof showToast === 'function') {
                showToast("Produit inconnu dans l'inventaire", "error");
            } else {
                alert("Code inconnu : " + code);
            }
        }
    } catch (err) {
        console.error("Erreur recherche :", err);
        if (typeof showToast === 'function') {
            showToast("Erreur de connexion à la base de données", "error");
        }
    }
}