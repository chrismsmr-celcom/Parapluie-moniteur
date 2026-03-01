/**
 * exportPDF.js - Module universel d'exportation pour Moniteo PRO
 */
window.MoniteoPDF = {
    async generate(options) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Récupération de la config globale
        const config = JSON.parse(localStorage.getItem('moniteo_config')) || {};
        const companyName = config.name || "MONITEO PRO";
        const companyDetails = config.address || "Système de Gestion Intégré";
        const logo = config.logo || null;

        // --- 1. EN-TÊTE UNIFIÉ ---
        if (logo) {
            try {
                doc.addImage(logo, 'PNG', 14, 10, 25, 25); 
            } catch (e) { console.warn("Logo non compatible"); }
        }

        doc.setFontSize(18);
        doc.setTextColor(31, 60, 99);
        doc.setFont("helvetica", "bold");
        doc.text(companyName.toUpperCase(), logo ? 45 : 14, 20);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(companyDetails, logo ? 45 : 14, 26);
        doc.text(`Émis le : ${new Date().toLocaleString('fr-FR')}`, logo ? 45 : 14, 31);

        doc.setDrawColor(31, 60, 99);
        doc.setLineWidth(0.5);
        doc.line(14, 38, pageWidth - 14, 38);

        // --- 2. CORPS DU DOCUMENT ---
        doc.setFontSize(14);
        doc.setTextColor(31, 60, 99);
        doc.text(options.title || "RAPPORT OFFICIEL", 14, 48);
        
        if(options.subtitle) {
            doc.setFontSize(11);
            doc.setTextColor(130);
            doc.text(options.subtitle, 14, 54);
        }

        let currentY = 60;

        // --- 3. TABLES (AUTO-TABLE) ---
        if (options.tables && options.tables.length > 0) {
            options.tables.forEach((table) => {
                doc.autoTable({
                    startY: currentY,
                    head: [table.headers],
                    body: table.rows,
                    foot: table.foot || null, // <--- Ligne de total ajoutée ici
                    theme: 'grid',
                    headStyles: { fillColor: [31, 60, 99], fontStyle: 'bold' },
                    footStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: 'bold' },
                    alternateRowStyles: { fillColor: [245, 247, 250] },
                    styles: { fontSize: 8, cellPadding: 3 },
                    margin: { left: 14, right: 14 }
                });
                currentY = doc.lastAutoTable.finalY + 15;
            });
        }

        // --- 4. GRAPHIQUES ---
        if (options.charts && options.charts.length > 0) {
            for (const chartId of options.charts) {
                const canvas = document.getElementById(chartId);
                if (canvas) {
                    if (currentY > pageHeight - 90) { doc.addPage(); currentY = 20; }
                    try {
                        const imgData = canvas.toDataURL('image/png', 1.0);
                        doc.setFontSize(10);
                        doc.text(`Analyse Visuelle : ${chartId}`, 14, currentY);
                        doc.addImage(imgData, 'PNG', 15, currentY + 5, 180, 80);
                        currentY += 95;
                    } catch (e) { console.warn("Erreur export graphique", e); }
                }
            }
        }

        // --- 5. FOOTER ---
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Moniteo Umbrella System - Page ${i}/${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        const safeTitle = (options.title || "Rapport").replace(/\s+/g, '_');
        doc.save(`Moniteo_${safeTitle}.pdf`);
    }
};