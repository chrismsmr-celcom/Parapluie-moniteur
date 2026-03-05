/**
 * exportPDF.js - Module Moniteo PRO
 * Récupération des données en temps réel depuis Supabase
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

    // 2. GÉNÉRATION DE RAPPORTS (Note l'ajout de "async")
    async generate(options) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // ATTENTION : On attend la réponse de Supabase ici
        const config = await this._getConfig();

        // --- HEADER ---
        if (config.logo) {
            try { doc.addImage(config.logo, 'PNG', 14, 10, 25, 25); } catch (e) {}
        }

        doc.setFontSize(18).setTextColor(31, 60, 99).setFont("helvetica", "bold");
        doc.text(config.companyName.toUpperCase(), config.logo ? 45 : 14, 22);

        doc.setFontSize(10).setTextColor(100).setFont("helvetica", "normal");
        doc.text(options.subtitle || "Rapport d'activité", config.logo ? 45 : 14, 28);
        doc.text(`Émis le : ${new Date().toLocaleString('fr-FR')}`, config.logo ? 45 : 14, 33);

        doc.setDrawColor(31, 60, 99).setLineWidth(0.5).line(14, 40, pageWidth - 14, 40);

        let currentY = 50;
        doc.setFontSize(14).setTextColor(31, 60, 99).setFont("helvetica", "bold");
        doc.text(options.title || "DOCUMENT OFFICIEL", 14, currentY);
        currentY += 10;

       if (options.tables) {
    options.tables.forEach((table) => {
        doc.autoTable({
            startY: currentY,
            head: [table.headers],
            body: table.rows,
            theme: 'striped',
            headStyles: { fillColor: [31, 60, 99], fontSize: 9 },
            styles: { 
                fontSize: 8, // Police plus petite pour les rapports denses
                cellPadding: 2,
                overflow: 'linebreak' 
            },
            // On force les colonnes numériques (souvent les dernières) à être plus larges si besoin
            margin: { left: 14, right: 14 }
        });
        currentY = doc.lastAutoTable.finalY + 15;
    });
}

        // --- FOOTER ---
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

    // 2. GÉNÉRATION DE FACTURE CLIENT DESIGN PREMIUM
async generateModernInvoice(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const config = await this._getConfig();

    // --- 1. ENTÊTE DESIGN ---
    doc.setFillColor(31, 60, 99); 
    doc.rect(0, 0, pageWidth, 15, 'F'); 

    // --- 2. LOGO ET INFOS ÉMETTEUR ---
    if (config.logo) {
        try { doc.addImage(config.logo, 'PNG', 14, 22, 25, 25); } catch(e){}
    }

    doc.setFontSize(22).setTextColor(31, 60, 99).setFont("helvetica", "bold");
    doc.text(config.companyName.toUpperCase(), config.logo ? 45 : 14, 32);
    
    doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(100);
    doc.text(config.address || "Adresse non configurée", config.logo ? 45 : 14, 38);
    doc.text(`Tél: ${config.phone || "N/A"}`, config.logo ? 45 : 14, 43);

    // --- 3. TITRE ET INFOS FACTURE ---
    doc.setFontSize(26).setTextColor(230, 230, 230).setFont("helvetica", "bold");
    doc.text("FACTURE", pageWidth - 14, 35, { align: "right" });

    doc.setFontSize(10).setTextColor(50).setFont("helvetica", "bold");
    doc.text(`N° ${data.invoiceNumber}`, pageWidth - 14, 42, { align: "right" });
    doc.setFont("helvetica", "normal").text(`Date: ${data.date}`, pageWidth - 14, 47, { align: "right" });

    // --- 4. BLOC CLIENT ---
    let currentY = 60;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, currentY, 80, 25, 2, 2, 'F');
    doc.setFontSize(8).setTextColor(100).setFont("helvetica", "bold");
    doc.text("ADRESSÉE À :", 18, currentY + 7);
    doc.setFontSize(11).setTextColor(0).setFont("helvetica", "bold");
    doc.text((data.customer.name || "CLIENT COMPTANT").toUpperCase(), 18, currentY + 14);
    doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(80);
    doc.text(`Tél: ${data.customer.phone || "-"}`, 18, currentY + 20);

    // --- 5. TABLE DES ARTICLES ---
    doc.autoTable({
        startY: currentY + 35,
        head: [['DESCRIPTION', 'QTE', 'PRIX UNITAIRE', 'MONTANT HT']],
        body: [[
            data.item.description, 
            data.item.qty, 
            `${Number(data.item.price).toLocaleString()} ${config.currency}`, 
            `${Number(data.item.total).toLocaleString()} ${config.currency}`
        ]],
        theme: 'striped',
        headStyles: { fillColor: [31, 60, 99], halign: 'center', fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 40, halign: 'right' },
            3: { cellWidth: 45, halign: 'right', fontStyle: 'bold' }
        },
        styles: { fontSize: 8.5, cellPadding: 4 }
    });

    // --- 6. RÉSUMÉ DES TOTAUX ---
    let finalY = doc.lastAutoTable.finalY + 10;
    const rightMargin = 14; 
    const totalBoxWidth = 85;
    const subTotal = data.item.total;
    const tvaRate = 16;
    const tvaAmount = subTotal * (tvaRate / 100);
    const grandTotal = subTotal + tvaAmount;

    // Lignes de calcul
    doc.setFontSize(10).setTextColor(100).setFont("helvetica", "normal");
    doc.text("Total Hors Taxe :", pageWidth - totalBoxWidth, finalY);
    doc.text(`${subTotal.toLocaleString()} ${config.currency}`, pageWidth - rightMargin, finalY, { align: "right" });

    doc.text(`TVA (${tvaRate}%) :`, pageWidth - totalBoxWidth, finalY + 8);
    doc.text(`${tvaAmount.toLocaleString()} ${config.currency}`, pageWidth - rightMargin, finalY + 8, { align: "right" });

    // Bandeau Bleu "TOTAL À PAYER"
    doc.setFillColor(31, 60, 99);
    doc.roundedRect(pageWidth - totalBoxWidth - 5, finalY + 12, totalBoxWidth + 5, 14, 1, 1, 'F');

    doc.setFontSize(12).setTextColor(255).setFont("helvetica", "bold");
    doc.text("TOTAL À PAYER", pageWidth - totalBoxWidth, finalY + 21);
    doc.text(`${grandTotal.toLocaleString()} ${config.currency}`, pageWidth - rightMargin - 2, finalY + 21, { align: "right" });

    // --- 7. QR CODE ---
    const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(data.invoiceNumber + '|' + grandTotal + '|' + config.companyName)}&size=150`;
    try {
        const qrImg = await this._loadExternalImage(qrUrl);
        if (qrImg) {
            doc.addImage(qrImg, 'PNG', 14, finalY + 12, 30, 30);
            doc.setFontSize(7).setTextColor(150).setFont("helvetica", "normal");
            doc.text("Scannez pour vérifier", 14, finalY + 45);
        }
    } catch (e) { console.warn("QR Code non généré"); }

    // --- 8. PIED DE PAGE (LÉGAL) ---
    doc.setDrawColor(230).setLineWidth(0.1).line(14, pageHeight - 30, pageWidth - 14, pageHeight - 30);
    
    doc.setFontSize(8).setTextColor(120).setFont("helvetica", "bold");
    const legalLine1 = `RCCM: ${config.rccm || "-"}  |  ID NAT: ${config.id_nat || "-"}  |  NIF: ${config.nif || "-"}`;
    doc.text(legalLine1, pageWidth / 2, pageHeight - 22, { align: 'center' });
    
    doc.setFontSize(7).setFont("helvetica", "normal").setTextColor(160);
    doc.text("Merci pour votre confiance. Cette facture est générée électroniquement par Moniteo PRO.", pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Sauvegarde
    const fileName = `Facture_${data.invoiceNumber}_${(data.customer.name || "Client").replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}
      };
