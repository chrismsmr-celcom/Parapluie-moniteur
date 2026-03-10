const OfflineManager = {
    KEYS: {
        SALES: 'offline_sales',
        INVENTORY: 'offline_inventory',
        STAFF: 'offline_staff'
    },

    saveLocally(key, data) {
        const queue = this.getQueue(key);
        const pendingItem = {
            ...data,
            // On garde l'ID original si présent, sinon un ID temporaire pour le filter()
            id: data.id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            isOffline: true,
            timestamp: new Date().toISOString()
        };
        queue.push(pendingItem);
        localStorage.setItem(key, JSON.stringify(queue));
        return pendingItem;
    },

    getQueue(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            return [];
        }
    },

    async syncAll() {
        if (!navigator.onLine) return;
        console.log("🌐 Réseau détecté, synchronisation en cours...");

        // Utilisation de .bind(this) pour garantir que syncFunc accède bien à Supabase via le bon contexte
        await this._syncModule(this.KEYS.SALES, 'sales', this._syncSale.bind(this));
        await this._syncModule(this.KEYS.INVENTORY, 'inventory', this._syncInventory.bind(this));
        await this._syncModule(this.KEYS.STAFF, 'staff', this._syncStaff.bind(this));
    },

    async _syncModule(key, tableName, syncFunc) {
        let queue = this.getQueue(key);
        if (queue.length === 0) return;

        for (const item of queue) {
            try {
                // CORRECTION 1: On retire TOUT ce qui ne doit pas aller dans Supabase
                // On retire l'ID s'il contient "offline" car Supabase doit générer son propre ID
                const { isOffline, timestamp, ...cleanData } = item;
                if (String(cleanData.id).includes('offline')) {
                    delete cleanData.id;
                }

                // CORRECTION 2: Vérifier la réponse de Supabase
                const { error } = await syncFunc(cleanData);
                
                if (error) {
                    console.error(`❌ Erreur Supabase sur ${tableName}:`, error.message);
                    continue; // On passe au suivant sans supprimer celui-ci de la file
                }
                
                // Si réussi, on met à jour la file en mémoire
                queue = queue.filter(q => q.id !== item.id);
                localStorage.setItem(key, JSON.stringify(queue));
                console.log(`✅ Synchro réussie pour ${tableName}`);

            } catch (err) {
                console.error(`🔥 Erreur critique sync ${tableName}:`, err);
            }
        }

        // Rafraîchir l'interface (fetchData est souvent utilisé à la place de initPage)
        if (typeof window.fetchData === 'function') await window.fetchData();
        else if (typeof window.initPage === 'function') window.initPage();
    },

    async _syncSale(data) {
        return await window._db.from('sales').insert([data]);
    },

    async _syncInventory(data) {
    // .select() permet de récupérer l'objet avec son nouvel ID UUID
    return await window._db.from('inventory').insert([data]).select();
},
    async _syncStaff(data) {
        return await window._db.from('staff').insert([data]);
    }
};

window.addEventListener('online', () => OfflineManager.syncAll());
