# Frais KM

Appli web (un seul fichier `index.html`) de suivi des frais kilométriques.

- Trajets avec départ / arrivée (autocomplétion IGN / BAN, repli Nominatim)
- Calcul d'itinéraire OSRM avec alternatives, le plus long présélectionné
- Aller simple ou aller-retour, distance modifiable
- Adresses par défaut Domicile → Bureau, modifiables dans Réglages
- Véhicules avec CV fiscaux et option 100 % électrique
- Barème kilométrique 2026 intégré (modifiable via JSON), calcul par tranche annuelle
- Historique, synthèse annuelle, export CSV, sauvegarde / restauration JSON

## Déploiement

Site statique : connecter ce dépôt à Netlify (aucune commande de build, dossier de publication `/`).

Les données sont stockées dans le navigateur (localStorage). Faire une sauvegarde JSON régulièrement.
