# Moniteo by Umbrella

**Moniteo** est un tableau de bord premium pour suivre votre business en temps réel de manière sécurisée.  
Il permet de gérer les ventes, l’inventaire, les dépenses et le staff tout en offrant une expérience visuelle moderne et responsive.

---

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Configuration Email OTP](#configuration-email-otp)
- [Structure des fichiers](#structure-des-fichiers)
- [Aperçu](#aperçu)
- [Mentions légales](#mentions-légales)

---

## Fonctionnalités

- **Connexion sécurisée par OTP** : L’utilisateur reçoit un code unique par email.  
- **Vérification Admin** : Certaines sections sensibles nécessitent un ID admin.  
- **Dashboard interactif** :
  - KPI : CA total, bénéfice net, quantité vendue, produits en stock, dépenses totales.  
  - Graphiques dynamiques : ventes par produit, ventes par jour, dépenses par catégorie.  
- **Alertes automatiques** : Stock faible, rupture, dépenses élevées, top ventes du jour.  
- **Gestion Staff** : Affiche le nombre d’employés.  
- **Export PDF** : Génération du dashboard en PDF depuis le navigateur.  
- **Espace compte utilisateur** : Nom, date de naissance et photo de profil (modifiable lors de la première saisie).  
- **Responsive design** : Compatible desktop et mobile.  
- **Branding** : Logo Moniteo et favicon intégrés.

---

## Technologies utilisées

- HTML5 / CSS3  
- JavaScript (Vanilla JS)  
- [EmailJS](https://www.emailjs.com/) pour l’envoi OTP  
- [Chart.js](https://www.chartjs.org/) pour les graphiques  
- [jsPDF](https://github.com/parallax/jsPDF) et [html2canvas](https://html2canvas.hertzen.com/) pour l’export PDF  
- LocalStorage pour les données mock (ventes, inventaire, dépenses, staff)

---

## Installation

1. Cloner le dépôt :  
```bash
git clone https://github.com/toncompte/moniteo.git
