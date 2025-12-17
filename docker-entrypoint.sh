#!/bin/sh
set -e  # Exit immédiatement si une commande échoue

echo "========================================"
echo "Discord Bot - Démarrage"
echo "========================================"

# Vérifier que les variables critiques sont présentes
if [ -z "$DISCORD_TOKEN" ] || [ -z "$CLIENT_ID" ]; then
    echo "ERREUR: Variables d'environnement manquantes (DISCORD_TOKEN ou CLIENT_ID)"
    exit 1
fi

echo ""
echo "=== Étape 1: Déploiement des commandes Discord slash ==="
echo ""

# Exécuter le script de déploiement
node dist/deploy-commands.js

# Vérifier le code de sortie
if [ $? -eq 0 ]; then
    echo ""
    echo "=== Commandes slash déployées avec succès ==="
    echo ""
else
    echo ""
    echo "=== ERREUR: Échec du déploiement des commandes slash ==="
    echo "=== Le bot ne démarrera pas ==="
    echo ""
    exit 1
fi

echo "=== Étape 2: Démarrage du bot Discord ==="
echo ""

# Démarrer le bot principal (exec pour remplacer le processus)
exec node dist/index.js
