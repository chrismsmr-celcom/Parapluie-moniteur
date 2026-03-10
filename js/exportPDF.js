/**
 * exportPDF.js - Module Moniteo PRO
 * Version : 2.6 - Fusion Complète (Design Pro + Formatage 10.000 + QR Code)
 */

window.MoniteoPDF = {
    // 1. UTILITAIRE DE FORMATAGE (FORCÉ 10.000)
    _formatNumber(val) {
        if (val === null || val === undefined || val === "") return "0";
        // Nettoie la chaîne (enlève $, FC, espaces) pour ne garder que le nombre
        let num = parseFloat(val.toString().replace(/[^0-9.-]/g, ""));
        if (isNaN(num)) return val;
        // Format Allemand (de-DE) pour avoir le POINT comme séparateur de milliers
        return new Intl.NumberFormat('de-DE', { 
            minimumFractionDigits: 0,
            maximumFractionDigits: 2 
        }).format(num);
    },

    // 2. RÉCUPÉRATION CONFIGURATION (Supabase)
    async _getConfig() {
        try {
            const { data: { user } } = await _db.auth.getUser();
            if (!user) throw new Error("Utilisateur non connecté");
            const { data: s, error } = await _db.from('settings').select('*').eq('user_id', user.id).maybeSingle();
            if (error) throw error;

            return {
                companyName: s?.company_name || "MONITEO PRO",
                address: s?.address || "Adresse non définie",
                phone: s?.phone || "-",
                rccm: s?.rccm || "-",
                id_nat: s?.id_nat || "-",
                nif: s?.nif || "-",
                tva: s?.tva || "16",
                currency: s?.currency || "$",
                logo: s?.logo_url || null
            };
        } catch (err) {
            console.error("Erreur config:", err);
            return { companyName: "MONITEO PRO", currency: "$", tva: "16" };
        }
    },

    // 3. GÉNÉRATEUR D'IMAGE QR CODE
    async _generateQRCodeImage(text) {
        return new Promise((resolve) => {
            const container = document.createElement("div");
            new QRCode(container, {
                text: text,
                width: 128, height: 128,
                correctLevel: QRCode.CorrectLevel.H
            });
            setTimeout(() => {
                const canvas = container.querySelector("canvas");
                resolve(canvas ? canvas.toDataURL("image/png") : null);
            }, 100);
        });
    },

    // 4. GÉNÉRATION RAPPORT A4 (CORRIGÉ & DESIGN PRO)
    async generate(options) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const config = await this._getConfig();
        const FONT = "courier"; 

        // Header Logic
        let headerX = 14; 
        if (config.logo) {
            try { doc.addImage(config.logo, 'PNG', 14, 10, 22, 22); headerX = 42; } catch (e) {}
        }

        // Infos Entreprise
        doc.setFont(FONT, "bold").setFontSize(14).setTextColor(31, 60, 99);
        doc.text(config.companyName.toUpperCase(), headerX, 18);

        // Formatage du Total CA dans le sous-titre
        let sub = options.subtitle || "";
        if (sub.includes(":")) {
            const parts = sub.split(":");
            sub = `${parts[0]}: ${this._formatNumber(parts[1])} ${config.currency}`;
        }
        doc.setFont(FONT, "normal").setFontSize(8).setTextColor(100);
        doc.text(sub, headerX, 23);
        doc.text(`DATE: ${new Date().toLocaleString('fr-FR')}`, headerX, 27);

        // Infos Légales Header
        const legalParts = [];
        if (config.rccm && config.rccm !== "-") legalParts.push(`RCCM: ${config.rccm}`);
        if (config.id_nat && config.id_nat !== "-") legalParts.push(`ID NAT: ${config.id_nat}`);
        if (config.nif && config.nif !== "-") legalParts.push(`NIF: ${config.nif}`);
        if (legalParts.length > 0) {
            doc.setFontSize(7).setTextColor(120);
            doc.text(legalParts.join("  |  "), headerX, 32);
        }

        doc.setDrawColor(31, 60, 99).setLineWidth(0.3).line(14, 38, pageWidth - 14, 38);

        // Tableaux avec auto-formatage 10.000
        let currentY = 48;
        if (options.tables) {
            options.tables.forEach((table) => {
                const formattedRows = table.rows.map(row => 
                    row.map(cell => (typeof cell === 'number' || !isNaN(parseFloat(cell))) ? this._formatNumber(cell) : cell)
                );

                doc.autoTable({
                    startY: currentY,
                    head: [table.headers],
                    body: formattedRows,
                    theme: 'grid',
                    styles: { font: FONT, fontSize: 7.5, cellPadding: 2 },
                    headStyles: { fillColor: [240, 240, 240], textColor: [31, 60, 99] },
                    margin: { left: 14, right: 14 }
                });
                currentY = doc.lastAutoTable.finalY + 12;
            });
        }

        // Footer avec numérotation et infos légales
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setDrawColor(200).line(14, pageHeight - 25, pageWidth - 14, pageHeight - 25);
            doc.setFontSize(7).setTextColor(120);
            const legalFooter = `RCCM: ${config.rccm} | ID NAT: ${config.id_nat} | NIF: ${config.nif}`;
            doc.text(legalFooter, pageWidth / 2, pageHeight - 20, { align: 'center' });
            doc.text(`Page ${i} / ${pageCount}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
        }

        doc.save(`Rapport_${Date.now()}.pdf`);
    },
    
    // 5. GÉNÉRATION TICKET THERMIQUE (80mm)
    async generateThermalReceipt(data) {
        const { jsPDF } = window.jspdf;
        const itemHeight = data.items.length * 8;
        const receiptHeight = 175 + itemHeight; 
        const doc = new jsPDF({ unit: 'mm', format: [80, receiptHeight] });

        const pageWidth = 80;
        const margin = 5;
        const config = await this._getConfig();
        let currentY = 10;

        // --- 1. LOGO ---
        if (config.logo) {
            try {
                doc.addImage(config.logo, 'PNG', (pageWidth / 2) - 10, currentY, 20, 20);
                currentY += 25;
            } catch (e) { currentY = 10; }
        }

        // --- 2. EN-TÊTE ---
        doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(0);
        doc.text(config.companyName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
        currentY += 6;
        doc.setFontSize(8).setFont("helvetica", "normal").setTextColor(60);
        const details = [config.address, `Tél: ${config.phone}`, `RCCM: ${config.rccm} | NIF: ${config.nif}`, `ID NAT: ${config.id_nat}`];
        details.forEach(line => { doc.text(line, pageWidth / 2, currentY, { align: 'center' }); currentY += 4; });

        doc.setLineDash([1, 1], 0);
        doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
        currentY += 8;

        // --- 3. INFOS TRANSACTION ---
        doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(0);
        doc.text(`TICKET N°: ${data.invoiceNumber}`, margin, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${new Date().toLocaleString('fr-FR')}`, margin, currentY + 4);
        doc.text(`Client: ${data.customer?.name || "Client Comptant"}`, margin, currentY + 8);
        currentY += 14;

        // --- 4. CORPS ---
        doc.setFont("helvetica", "bold");
        doc.text("ARTICLE", margin, currentY);
        doc.text("QTÉ", 45, currentY);
        doc.text("TOTAL", pageWidth - margin, currentY, { align: 'right' });
        doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
        currentY += 7;

        doc.setFont("helvetica", "normal").setFontSize(8);
        data.items.forEach(item => {
            const desc = item.description.length > 22 ? item.description.substring(0, 20) + ".." : item.description;
            doc.text(desc, margin, currentY);
            doc.text(item.qty.toString(), 45, currentY);
            // Utilisation du formateur global _formatNumber
            doc.text(`${this._formatNumber(item.total)} ${config.currency}`, pageWidth - margin, currentY, { align: 'right' });
            currentY += 6;
        });

        // --- 5. TOTALISATION & PAIEMENT ---
        currentY += 4;
        doc.setLineDash([]); 
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 6;

        const subTotal = data.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
        const tvaRate = parseFloat(config.tva) || 0;
        const tvaAmount = subTotal * (tvaRate / 100);
        const grandTotal = subTotal + tvaAmount;

        doc.text("Sous-total HT:", margin, currentY);
        doc.text(`${this._formatNumber(subTotal)} ${config.currency}`, pageWidth - margin, currentY, { align: 'right' });
        doc.text(`TVA (${tvaRate}%):`, margin, currentY + 4);
        doc.text(`${this._formatNumber(tvaAmount)} ${config.currency}`, pageWidth - margin, currentY + 4, { align: 'right' });

        currentY += 12;
        doc.setFillColor(0, 0, 0); 
        doc.rect(margin, currentY - 5, pageWidth - (margin * 2), 8, 'F');
        doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(255);
        doc.text("TOTAL TTC:", margin + 2, currentY);
        doc.text(`${this._formatNumber(grandTotal)} ${config.currency}`, pageWidth - margin - 2, currentY, { align: 'right' });

        currentY += 8;
        doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(0);
        const paymentMode = data.paymentMethod || "ESPÈCES";
        doc.text(`MODE DE PAIEMENT : ${paymentMode.toUpperCase()}`, margin, currentY);

        // --- 6. QR CODE ---
        currentY += 10;
        const qrData = `Facture:${data.invoiceNumber}|Total:${grandTotal}|Mode:${paymentMode}`;
        const qrImage = await this._generateQRCodeImage(qrData);
        if (qrImage) {
            doc.addImage(qrImage, 'PNG', (pageWidth / 2) - 12.5, currentY, 25, 25);
            currentY += 30;
        }

        // --- 7. FOOTER & POLITIQUES ---
        doc.setLineDash([0.5, 0.5], 0);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 5;
        doc.setFontSize(7).setTextColor(80).setFont("helvetica", "bold");
        doc.text("POLITIQUE DE RETOUR & ÉCHANGE", pageWidth / 2, currentY, { align: 'center' });
        currentY += 4;
        doc.setFont("helvetica", "normal").setFontSize(6);
        const policies = [
            "- Présentation obligatoire de ce ticket.",
            "- Échange possible sous 48h (articles non ouverts).",
            "- Aucun remboursement en espèces.",
            "- Les produits frais ne sont ni repris ni échangés."
        ];
        policies.forEach(line => { doc.text(line, margin, currentY); currentY += 3; });

        currentY += 5;
        doc.setFont("helvetica", "italic").setFontSize(8).setTextColor(0);
        doc.text("Merci de votre visite !", pageWidth / 2, currentY, { align: 'center' });

        doc.save(`Ticket_${data.invoiceNumber}.pdf`);
    }
};
