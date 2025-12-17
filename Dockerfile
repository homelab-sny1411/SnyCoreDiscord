# ==============================================
# Stage 1: Builder - Compilation TypeScript
# ==============================================
FROM node:20-alpine AS builder

# Informations de build
LABEL stage=builder

# Définir le répertoire de travail
WORKDIR /app

# Copier UNIQUEMENT les fichiers de dépendances (pour cache Docker)
COPY package.json package-lock.json ./

# Installer TOUTES les dépendances (dev + prod) pour la compilation
RUN npm ci --verbose

# Copier TOUT le code source
COPY . .

# Compiler TypeScript → dist/
RUN npm run build

# Vérifier que la compilation a produit des fichiers
RUN ls -la dist/

# ==============================================
# Stage 2: Production - Runtime léger
# ==============================================
FROM node:20-alpine AS production

# Métadonnées de l'image
LABEL maintainer="Mattéo Humez"
LABEL description="Bot Discord pour homelab"
LABEL version="1.0.0"

# Installer dumb-init pour gestion correcte des signaux
RUN apk add --no-cache dumb-init

# Créer un utilisateur non-root (sécurité)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package pour installer les dépendances prod
COPY --from=builder /app/package.json /app/package-lock.json ./

# Installer UNIQUEMENT les dépendances de production
RUN npm ci --omit=dev --verbose && \
    npm cache clean --force

# Copier le code compilé depuis le stage builder
COPY --from=builder /app/dist ./dist

# Copier le script d'entrée
COPY docker-entrypoint.sh ./

# Rendre le script exécutable
RUN chmod +x docker-entrypoint.sh

# Changer ownership pour l'utilisateur non-root
RUN chown -R nodejs:nodejs /app

# Passer à l'utilisateur non-root
USER nodejs

# Le bot Discord ne nécessite aucun port exposé
# (Pas de EXPOSE - c'est intentionnel)

# Variables d'environnement par défaut (surchargées par Nomad)
ENV NODE_ENV=production

# Health check (optionnel - vérifie que Node.js répond)
# Note: Ceci vérifie seulement que le processus tourne, pas que le bot est connecté
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Point d'entrée avec dumb-init pour gestion signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande par défaut
CMD ["./docker-entrypoint.sh"]
