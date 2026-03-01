/**
 * STATS-MANAGER.JS
 * Centralise le calcul et l'affichage des bannières de résumé
 */

// --- 1. UTILITAIRES DE FORMATAGE ---

/**
 * Formate un nombre en devise ($, FC, etc.) selon la config locale
 * @param {number} amount 
 * @returns {string}
 */
function formatMoney(amount) {
    const config = JSON.parse(localStorage.getItem('moniteo_config')) || { currency: 'FC', rate: 2800 };
    let finalAmount = amount;
    
    // Si la devise est en FC, on multiplie par le taux de change
    if (config.currency === 'FC') {
        finalAmount = amount * config.rate;
    }

    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(finalAmount) + " " + config.currency;
}

/**
 * Formate les nombres simples (quantités, effectifs)
 */
function formatNumber(num) {
    return new Intl.NumberFormat('fr-FR').format(num);
}

// --- 2. FONCTIONS DE MISE À JOUR PAR PAGE ---

/**
 * Met à jour la bannière de la page Ventes / Dashboard
 * Attend un tableau d'objets ventes
 */
function updateSalesSummary(salesArray) {
    let totalRev = 0;
    let totalProf = 0;
    let totalItems = 0;

    salesArray.forEach(sale => {
        totalRev += parseFloat(sale.total_price || 0);
        totalProf += parseFloat(sale.margin || 0);
        totalItems += parseInt(sale.quantity || 0);
    });

    // Injection dans le DOM avec IDs standardisés
    if(document.getElementById('caTotal')) document.getElementById('caTotal').innerText = formatMoney(totalRev);
    if(document.getElementById('statRev')) document.getElementById('statRev').innerText = formatMoney(totalRev);
    
    if(document.getElementById('profitTotal')) document.getElementById('profitTotal').innerText = formatMoney(totalProf);
    if(document.getElementById('statProf')) document.getElementById('statProf').innerText = formatMoney(totalProf);
    
    if(document.getElementById('qtyTotal')) document.getElementById('qtyTotal').innerText = formatNumber(totalItems);
    if(document.getElementById('transCount')) document.getElementById('transCount').innerText = formatNumber(salesArray.length);
}

/**
 * Met à jour la bannière de la page Stock / Inventaire
 * Attend un tableau de produits
 */
function updateStockSummary(productsArray) {
    let count = 0;
    let vAchat = 0;
    let vVente = 0;

    productsArray.forEach(p => {
        const q = parseInt(p.stock_quantity || 0);
        count += q;
        vAchat += q * parseFloat(p.purchase_price || 0);
        vVente += q * parseFloat(p.sale_price || 0);
    });

    const profitEst = vVente - vAchat;

    if(document.getElementById('countStock')) document.getElementById('countStock').innerText = formatNumber(count);
    if(document.getElementById('stockValue')) document.getElementById('stockValue').innerText = formatMoney(vAchat);
    if(document.getElementById('saleValue')) document.getElementById('saleValue').innerText = formatMoney(vVente);
    if(document.getElementById('profitValue')) document.getElementById('profitValue').innerText = formatMoney(profitEst);
}

/**
 * Met à jour la bannière de la page RH / Personnel
 * Attend un tableau d'employés
 */
function updateHRSummary(staffArray) {
    let totalMasse = 0;
    let alerts = 0;
    const today = new Date();

    staffArray.forEach(emp => {
        totalMasse += parseFloat(emp.salary || 0);
        
        // Alerte si le contrat finit dans moins de 30 jours
        if (emp.contract_end) {
            const end = new Date(emp.contract_end);
            const diff = (end - today) / (1000 * 60 * 60 * 24);
            if (diff >= 0 && diff < 30) alerts++;
        }
    });

    const moyenne = staffArray.length > 0 ? totalMasse / staffArray.length : 0;

    if(document.getElementById('statTotal')) document.getElementById('statTotal').innerText = formatNumber(staffArray.length);
    if(document.getElementById('statMasse')) document.getElementById('statMasse').innerText = formatMoney(totalMasse);
    if(document.getElementById('statAlerts')) document.getElementById('statAlerts').innerText = formatNumber(alerts);
    if(document.getElementById('statMoyenne')) document.getElementById('statMoyenne').innerText = formatMoney(moyenne);
}

// --- 3. INITIALISATION AUTOMATIQUE DES SYMBOLES ---

/**
 * Met à jour les labels de devises ($ ou FC) statiques dans les bannières
 */
function refreshCurrencyLabels() {
    const config = JSON.parse(localStorage.getItem('moniteo_config')) || { currency: 'FC' };
    document.querySelectorAll('.currency-label').forEach(el => {
        el.innerText = config.currency;
    });
}

document.addEventListener('DOMContentLoaded', refreshCurrencyLabels);