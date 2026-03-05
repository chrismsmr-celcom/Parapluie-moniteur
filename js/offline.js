// --- offline.js ---
const OFFLINE_STORAGE_KEY = 'moniteo_pending_expenses';

const OfflineManager = {
    saveLocally(expense) {
        const queue = this.getQueue();
        expense.isOffline = true;
        expense.tempId = Date.now(); 
        queue.push(expense);
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue));
        console.log("📍 Dépense stockée localement.");
        
        // On force le rendu du tableau pour voir le "Nuage orange" immédiatement
        if (typeof renderExpenses === 'function') renderExpenses();
    },

    getQueue() {
        return JSON.parse(localStorage.getItem(OFFLINE_STORAGE_KEY)) || [];
    },

    clearQueue() {
        localStorage.removeItem(OFFLINE_STORAGE_KEY);
    },

    async syncWithSupabase() {
        const queue = this.getQueue();
        if (queue.length === 0) return;

        console.log(`Sync en cours... ${queue.length} dépense(s).`);

        try {
            // SECURITÉ : On s'assure d'avoir un ID utilisateur avant d'envoyer
            const { data: { user } } = await _db.auth.getUser();
            const fallbackId = localStorage.getItem('moniteo_user_id');
            const finalUserId = user ? user.id : fallbackId;

            if (!finalUserId) {
                console.error("Impossible de synchroniser : ID utilisateur introuvable.");
                return;
            }

            // Nettoyage des données pour Supabase
            const dataToSync = queue.map(({ isOffline, tempId, ...rest }) => {
                return { ...rest, user_id: finalUserId }; // On s'assure que l'ID est là
            });

            const { error } = await _db.from('expenses').insert(dataToSync);
            if (error) throw error;

            console.log("✅ Synchronisation réussie !");
            this.clearQueue();
            alert(`${queue.length} dépense(s) synchronisée(s) !`);
            
            if (typeof fetchExpenses === 'function') fetchExpenses();

        } catch (err) {
            console.error("❌ Échec de la synchronisation:", err.message);
        }
    }
};

// --- ÉCOUTEURS ---
window.addEventListener('online', () => {
    console.log("🌐 Internet est de retour !");
    // Petit délai de 2s pour laisser à Supabase le temps de se reconnecter proprement
    setTimeout(() => OfflineManager.syncWithSupabase(), 2000);
});

window.addEventListener('offline', () => {
    console.warn("⚠️ Mode local activé.");
});