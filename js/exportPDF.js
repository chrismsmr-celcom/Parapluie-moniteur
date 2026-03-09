/**
 * exportPDF.js - Module Moniteo PRO
 * Version : 2.1 - Correctif Header Légal & Alignement
 */

window.MoniteoPDF = {
    // 1. Nouvelle méthode asynchrone pour interroger Supabase
    async _getConfig() {
        try {
            // Récupérer l'utilisateur actuel
            const { data: { user } } = await _db.auth.getUser();
            if (!user) throw new Error("Utilisateur non connecté");

            // Interroger la table settings
            const { data: s, error } = await _db
                .from('settings')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;

            // Retourner les données formatées (avec fallback si vide)
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
            console.error("Erreur récupération config Supabase:", err);
            // Backup minimal au cas où Supabase est injoignable
            return { companyName: "MONITEO PRO", tva: "16", currency: "$" };
        }
    },
    async _loadExternalImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = url;
        });
    },

    async generate(options) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const config = await this._getConfig();
        const FONT = "courier"; 

        // --- 1. HEADER LOGIC ---
        let headerX = 14; 
        if (config.logo) {
            try { 
                doc.addImage(config.logo, 'PNG', 14, 10, 22, 22); 
                headerX = 42; // Décale le texte seulement si le logo est là
            } catch (e) { console.warn("Erreur Logo:", e); }
        }

        // Nom Entreprise
        doc.setFont(FONT, "bold").setFontSize(14).setTextColor(31, 60, 99);
        doc.text(config.companyName.toUpperCase(), headerX, 18);

        // Sous-titre (Période)
        doc.setFont(FONT, "normal").setFontSize(8).setTextColor(100);
        doc.text(options.subtitle || "", headerX, 23);
        
        // Date d'émission
        doc.text(`DATE: ${new Date().toLocaleString('fr-FR')}`, headerX, 27);

        // --- 2. INFOS LÉGALES (DANS LE HEADER) ---
        const legalParts = [];
        if (config.rccm && config.rccm !== "-") legalParts.push(`RCCM: ${config.rccm}`);
        if (config.id_nat && config.id_nat !== "-") legalParts.push(`ID NAT: ${config.id_nat}`);
        if (config.nif && config.nif !== "-") legalParts.push(`NIF: ${config.nif}`);
        
        if (legalParts.length > 0) {
            doc.setFontSize(7).setTextColor(120);
            doc.text(legalParts.join("  |  "), headerX, 32);
        }

        // Ligne de séparation
        doc.setDrawColor(31, 60, 99).setLineWidth(0.3).line(14, 38, pageWidth - 14, 38);

        // --- 3. TITRE DU DOCUMENT ---
        let currentY = 48;
        doc.setFont(FONT, "bold").setFontSize(11).setTextColor(31, 60, 99);
        doc.text(options.title || "DOCUMENT OFFICIEL", 14, currentY);
        currentY += 8;

        // --- 4. TABLEAUX ---
        if (options.tables) {
            options.tables.forEach((table) => {
                doc.autoTable({
                    startY: currentY,
                    head: [table.headers],
                    body: table.rows,
                    foot: table.foot ? [table.foot] : null,
                    theme: 'grid',
                    styles: { 
                        font: FONT, 
                        fontSize: 7.5, 
                        cellPadding: 2,
                        lineColor: [220, 220, 220],
                        lineWidth: 0.1
                    },
                    headStyles: { 
                        fillColor: [240, 240, 240], 
                        textColor: [31, 60, 99], 
                        fontStyle: 'bold', 
                        halign: 'center' 
                    },
                    footStyles: table.footStyles || { 
                        fillColor: [31, 60, 99], 
                        textColor: [255, 255, 255], 
                        fontStyle: 'bold' 
                    },
                    margin: { left: 14, right: 14 }
                });
                currentY = doc.lastAutoTable.finalY + 12;
            });
        }

        // Hook pour les signatures (onAfterGenerate)
        if (typeof options.onAfterGenerate === 'function') {
            options.onAfterGenerate(doc, currentY, FONT);
        }

        // --- 5. FOOTER (NUMÉROTATION) ---
                const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setDrawColor(200).line(14, pageHeight - 25, pageWidth - 14, pageHeight - 25);
            doc.setFontSize(7).setTextColor(120);
            const legalText = `RCCM: ${config.rccm} | ID NAT: ${config.id_nat} | NIF: ${config.nif} | Contact: ${config.phone}`;
            doc.text(legalText, pageWidth / 2, pageHeight - 20, { align: 'center' });
            doc.text(`Page ${i} / ${pageCount}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
        }

        doc.save(`Moniteo_Rapport_${Date.now()}.pdf`);
    },  

    // 3. GÉNÉRATION DE FACTURE (Modern Design)
    async generateModernInvoice(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const config = await this._getConfig();

        // Design Entête
        doc.setFillColor(31, 60, 99); 
        doc.rect(0, 0, pageWidth, 15, 'F'); 

        if (config.logo) {
            try { doc.addImage(config.logo, 'PNG', 14, 22, 25, 25); } catch(e){}
        }

        doc.setFontSize(22).setTextColor(31, 60, 99).setFont("helvetica", "bold");
        doc.text(config.companyName.toUpperCase(), config.logo ? 45 : 14, 32);
        
        doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(100);
        doc.text(config.address || "Adresse non définie", config.logo ? 45 : 14, 38);
        doc.text(`Tél: ${config.phone || "N/A"}`, config.logo ? 45 : 14, 43);

        doc.setFontSize(26).setTextColor(230, 230, 230).setFont("helvetica", "bold");
        doc.text("FACTURE", pageWidth - 14, 35, { align: "right" });

        doc.setFontSize(10).setTextColor(50).setFont("helvetica", "bold");
        doc.text(`N° ${data.invoiceNumber}`, pageWidth - 14, 42, { align: "right" });

        // Table Articles
        const tableBody = data.items.map(item => [
            item.description, 
            item.qty, 
            `${Number(item.price).toLocaleString()} ${config.currency}`, 
            `${Number(item.total).toLocaleString()} ${config.currency}`
        ]);

        doc.autoTable({
            startY: 70,
            head: [['DESCRIPTION', 'QTE', 'PRIX UNITAIRE', 'MONTANT HT']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [31, 60, 99], halign: 'center', fontSize: 9 },
            styles: { fontSize: 8.5, cellPadding: 3 }
        });

        // Totaux
        let finalY = doc.lastAutoTable.finalY + 10;
        const subTotal = data.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
        const tvaRate = parseFloat(config.tva) || 16;
        const tvaAmount = subTotal * (tvaRate / 100);
        const grandTotal = subTotal + tvaAmount;

        doc.setFontSize(10).setTextColor(100).setFont("helvetica", "normal");
        doc.text(`Total HT: ${subTotal.toLocaleString()} ${config.currency}`, pageWidth - 14, finalY, { align: "right" });
        doc.text(`TVA (${tvaRate}%): ${tvaAmount.toLocaleString()} ${config.currency}`, pageWidth - 14, finalY + 7, { align: "right" });

        doc.setFillColor(31, 60, 99);
        doc.roundedRect(pageWidth - 90, finalY + 12, 76, 12, 1, 1, 'F');
        doc.setFontSize(11).setTextColor(255).setFont("helvetica", "bold");
        doc.text(`TOTAL À PAYER: ${grandTotal.toLocaleString()} ${config.currency}`, pageWidth - 18, finalY + 20, { align: "right" });

        doc.save(`Facture_${data.invoiceNumber}.pdf`);
    }
};
