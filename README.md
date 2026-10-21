# Frais KM — AMN CONSEIL

Application web gratuite de suivi des frais kilométriques.

**Utiliser l'application :** https://km.amn-conseil.fr/ — créez votre compte gratuitement.

## Fonctionnalités

- Trajets avec départ / arrivée (autocomplétion IGN / BAN, repli Nominatim)
- Calcul d'itinéraire OSRM avec alternatives, le plus long présélectionné
- Aller simple ou aller-retour, distance modifiable
- Adresses Domicile / Bureau pré-remplies, propres à chaque utilisateur
- Véhicules avec CV fiscaux et option 100 % électrique
- Barème kilométrique fiscal 2026 intégré, calcul par tranche annuelle
- Historique, synthèse annuelle, export CSV
- Import CSV (export de l'appli ou d'outils de notes de frais) et sauvegarde JSON
- Comptes individuels, données privées et synchronisées (Supabase, RLS)
- Installable sur ordinateur et téléphone

## Propriété et licence

© 2026 AMN CONSEIL. Tous droits réservés. L'application est la propriété d'AMN CONSEIL ;
son **utilisation gratuite est autorisée**. Le code source est consultable mais ne peut être
copié, modifié ni redistribué sans accord écrit. Voir [LICENSE](LICENSE).

## Technique

- Fichier unique `index.html` (HTML/CSS/JS, sans build), Leaflet, supabase-js
- Base : Supabase, schéma dans [`supabase/schema.sql`](supabase/schema.sql)
- Hébergement : GitHub Pages (branche `main`, racine)

Contact : aam@amn-conseil.fr
