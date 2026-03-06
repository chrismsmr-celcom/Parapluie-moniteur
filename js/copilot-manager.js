/**
 * MONITEO COPILOT v3.2 - Édition Standard Intégrale
 * Suppression icônes + Correction bug positionnement Sidebar/Modal
 */
const MoniteoCopilot = {
    config: {
        allowClose: true,
        overlayColor: '#050a15f2', 
        stagePadding: 10,
        showProgress: true,
        nextBtnText: 'Suivant',
        prevBtnText: 'Retour',
        doneBtnText: 'Démarrer l\'aventure',
    },

    getSteps: function(pageName) {
        const stepsMap = {
            'dashboard.html': [
                { 
                    element: '#dynamicLogoContainer', 
                    popover: { 
                        title: 'Votre Business à 360°', 
                        description: 'C\'est ici que Moniteo centralise tout. Votre logo et le nom de votre entreprise s\'affichent ici en temps réel.', 
                        side: "bottom" 
                    }
                },
                { 
                    element: '.dashboard-grid .kpi-card:nth-child(2)', 
                    popover: { 
                        title: 'Santé Financière', 
                        description: 'Le CA est brut, mais surveillez surtout le **Bénéfice Net**. Il est calculé automatiquement après déduction de vos charges et salaires.', 
                        side: "bottom" 
                    }
                },
                { 
                    element: '#mainChart', 
                    popover: { 
                        title: 'Courbe de Croissance', 
                        description: 'Ce graphique analyse vos cycles de vente. Identifiez vos meilleurs jours pour optimiser votre stock.', 
                        side: "top" 
                    }
                },
                { 
                    element: '#stockStatusList', 
                    popover: { 
                        title: 'Zone de Danger', 
                        description: 'Les articles en rouge sont prioritaires. Cliquez pour voir quel fournisseur contacter avant la rupture.', 
                        side: "left" 
                    }
                }
            ],

            'sales.html': [
                { 
                    element: '.btn-main', 
                    popover: { 
                        title: 'Enregistrer une vente', 
                        description: 'Cliquez ici pour chaque client. Le système calcule la marge instantanément selon le prix d\'achat en stock.', 
                        side: "right" 
                    }
                },
                { 
                    element: '#salesTable', 
                    popover: { 
                        title: 'Édition Dynamique', 
                        description: 'Une erreur ? Cliquez directement sur une cellule pour corriger. Les indicateurs orange indiquent une synchronisation en cours.', 
                        side: "top" 
                    }
                },
                { 
                    element: '#totalQuantity', 
                    popover: { 
                        title: 'Volume de sortie', 
                        description: 'Le nombre total de pièces vendues aujourd\'hui. Idéal pour un inventaire physique rapide le soir.', 
                        side: "bottom" 
                    } 
                },
                { 
                    element: '.dropdown', 
                    popover: { 
                        title: 'Exports & Clôture', 
                        description: 'C\'est ici que vous générez vos rapports PDF/Excel et que vous clôturez votre journée de vente.', 
                        side: "left" 
                    } 
                }
            ],

            'inventory.html': [
                { 
                    element: '.inventory-banner', 
                    popover: { 
                        title: 'Valorisation du Stock', 
                        description: 'Voici l\'argent immobilisé dans vos rayons. Surveillez le "Profit Potentiel" pour anticiper vos gains.', 
                        side: "bottom" 
                    } 
                },
                { 
                    element: '#alertList', 
                    popover: { 
                        title: 'Alertes Stock', 
                        description: 'Les produits en rupture ou en stock faible s\'affichent ici automatiquement pour vos commandes.', 
                        side: "right" 
                    } 
                },
                { 
                    element: '#inventoryTable', 
                    popover: { 
                        title: 'Gestion en Direct', 
                        description: 'Modifiez les prix ou quantités directement dans les cellules. La sauvegarde est automatique après 1.5 seconde.', 
                        side: "top" 
                    } 
                },
                { 
                    element: '#saveStatus', 
                    popover: { 
                        title: 'Témoin de Synchronisation', 
                        description: 'Ce badge vous confirme que vos modifications sont bien enregistrées sur le serveur sécurisé.', 
                        side: "bottom" 
                    } 
                }
            ],

            'expenses.html': [
                { 
                    element: '.expense-form-card', 
                    popover: { 
                        title: 'Contrôle des Coûts', 
                        description: 'Loyer, transport, casse... Notez tout. Une dépense oubliée fausse votre bénéfice réel.', 
                        side: "right" 
                    } 
                },
                { 
                    element: '#fileLabel', 
                    popover: { 
                        title: 'Preuve Numérique', 
                        description: 'Prenez le reçu en photo. L\'image est stockée sur le cloud et accessible via l\'icône de visualisation dans le tableau.', 
                        side: "bottom" 
                    } 
                },
                { 
                    element: '#expenseCurrency', 
                    popover: { 
                        title: 'Conversion en Direct', 
                        description: 'Changez la devise ici pour voir vos dépenses totales converties selon votre taux actuel.', 
                        side: "left" 
                    } 
                },
                { 
                    element: '#searchInput', 
                    popover: { 
                        title: 'Recherche Rapide', 
                        description: 'Retrouvez une dépense par son libellé ou sa catégorie en un instant.', 
                        side: "bottom" 
                    } 
                }
            ],

            'reporting.html': [
                { 
                    element: '.report-grid', 
                    popover: { 
                        title: 'Santé du Business', 
                        description: 'Surveillez votre Profit Net en temps réel. Le score de "Santé du Stock" vous indique si vos rayons sont optimisés.', 
                        side: "bottom" 
                    } 
                },
                { 
                    element: '#forecastBody', 
                    popover: { 
                        title: 'Prévisions de Rupture', 
                        description: 'Moniteo analyse vos ventes passées pour prédire dans combien de jours vous serez en rupture.', 
                        side: "top" 
                    } 
                },
                { 
                    element: '#chartHours', 
                    popover: { 
                        title: 'Heures de Pointe', 
                        description: 'Découvrez quand vos clients achètent le plus pour ajuster vos effectifs.', 
                        side: "top" 
                    } 
                },
                { 
                    element: '.pdf-action', 
                    popover: { 
                        title: 'Rapport Stratégique', 
                        description: 'Exportez toutes ces analyses dans un PDF pro pour vos archives ou vos associés.', 
                        side: "left" 
                    } 
                }
            ],

            'setting.html': [
                { 
                    element: '.settings-card', 
                    popover: { 
                        title: 'Identité de Marque', 
                        description: 'Configurez votre nom et logo. Ces informations apparaîtront sur vos rapports PDF.', 
                        side: "bottom" 
                    } 
                },
                { 
                    element: '#exchangeRate', 
                    popover: { 
                        title: 'Taux de Change', 
                        description: 'Indiquez le taux actuel. Toutes vos conversions de dépenses et rapports l\'utiliseront.', 
                        side: "top" 
                    } 
                },
                { 
                    element: '#bizRCCM', 
                    popover: { 
                        title: 'Infos Légales', 
                        description: 'Saisissez vos numéros RCCM, ID NAT et NIF pour des documents conformes.', 
                        side: "top" 
                    } 
                },
                { 
                    element: '#darkToggle', 
                    popover: { 
                        title: 'Personnalisation', 
                        description: 'Basculez entre le mode clair et sombre selon votre environnement.', 
                        side: "right" 
                    } 
                }
            ],

            'staff.html': [
                { 
                    element: '.staff-header', 
                    popover: { 
                        title: 'Gestion du Capital Humain', 
                        description: 'Centralisez tous vos dossiers employés. Ajoutez un nouveau collaborateur en un clic.', 
                        side: "bottom" 
                    } 
                },
                { 
                    element: '#statAlerts', 
                    popover: { 
                        title: 'Alertes Contrats', 
                        description: 'Moniteo vous prévient 30 jours avant la fin d\'un contrat.', 
                        side: "top" 
                    } 
                },
                { 
                    element: '#staffTable', 
                    popover: { 
                        title: 'Registre Digital', 
                        description: 'Modifiez les postes en direct ou générez une fiche de paie professionnelle.', 
                        side: "top" 
                    } 
                },
                { 
                    element: '#salaryChart', 
                    popover: { 
                        title: 'Analyse Salariale', 
                        description: 'Visualisez la répartition de votre masse salariale pour mieux gérer vos coûts.', 
                        side: "left" 
                    } 
                }
            ],

            'history.html': [
                { 
                    element: '.search-bar', 
                    popover: { 
                        title: 'Recherche Intelligente', 
                        description: 'Retrouvez une vente par nom de produit, ou filtrez par marché.', 
                        side: "bottom" 
                    } 
                },
                { 
                    element: '.date-filters', 
                    popover: { 
                        title: 'Période Personnalisée', 
                        description: 'Sélectionnez une plage de dates pour obtenir vos stats sur une période précise.', 
                        side: "bottom" 
                    } 
                },
                { 
                    element: '#caTotal', 
                    popover: { 
                        title: 'Performance Financière', 
                        description: 'Ces indicateurs se mettent à jour en temps réel selon vos filtres.', 
                        side: "top" 
                    } 
                },
                { 
                    element: '.pdf-action', 
                    popover: { 
                        title: 'Archivage & Audit', 
                        description: 'Générez un rapport PDF professionnel incluant vos en-têtes d\'entreprise.', 
                        side: "left" 
                    } 
                }
            ]
        };

        return stepsMap[pageName] || [];
    },

    start: function() {
        if (typeof window.driver === 'undefined') return;

        const driverObj = window.driver.js.driver;
        const page = window.location.pathname.split("/").pop().split('?')[0] || 'dashboard.html';
        const steps = this.getSteps(page);
        
        const validSteps = steps.filter(s => document.querySelector(s.element));

        if (validSteps.length === 0) return;

        const tour = driverObj({
            ...this.config,
            steps: validSteps,
            // Correction pour le bug History/Setting : force le recalcul du scroll
            onHighlightStarted: (element) => {
                element?.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
        });

        tour.drive();
    }
};

window.startMoniteoCopilot = () => MoniteoCopilot.start();

document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split("/").pop().split('?')[0] || 'dashboard.html';
    const storageKey = `seen_v3_${page}`;
    
    if (!localStorage.getItem(storageKey) && window.innerWidth > 992) {
        setTimeout(() => {
            MoniteoCopilot.start();
            localStorage.setItem(storageKey, 'true');
        }, 2000);
    }
});