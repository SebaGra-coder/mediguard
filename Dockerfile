# Usa un'immagine base leggera di Node.js
FROM node:20-alpine

# Imposta la cartella di lavoro dentro il container
WORKDIR /app

# Copia i file delle dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del codice
COPY . .

# Costruisce l'app per la produzione
RUN npm run build

# Espone la porta 3000 (dove gira Next.js)
EXPOSE 3000

# Comando per avviare l'app
CMD ["npm", "start"]