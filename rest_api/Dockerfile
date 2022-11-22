FROM node:18.12.1-alpine
LABEL description="Rest Api of Microservice Benutzerverwaltung with Node"

# Set working directory
WORKDIR ./rest-api/

COPY src/auth.js ./
COPY src/server.js ./
COPY src/package.json ./
COPY src/compiled_wasm_modules ./compiled_wasm_modules

RUN npm install

CMD [ "node", "server.js" ]


