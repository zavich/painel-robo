# Usa Node 22
FROM node:22-alpine

# Diretório da aplicação
WORKDIR /app

# Copia package.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do projeto
COPY . .

# Define variáveis de ambiente para a aplicação
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_MAINTENANCE_MODE
ENV NEXT_PUBLIC_MAINTENANCE_MODE=${NEXT_PUBLIC_MAINTENANCE_MODE}

# Builda a aplicação
RUN npm run build

# Expõe a porta padrão do Next
EXPOSE 3000

# Define ambiente de produção
ENV NODE_ENV=production

# Inicia o Next
CMD ["npm", "start"]