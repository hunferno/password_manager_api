# Utiliser une image Node.js officielle en tant que base
FROM node:latest

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port sur lequel l'application s'exécute
EXPOSE 6002

# Commande pour démarrer l'application
CMD "npm" "run" "start"