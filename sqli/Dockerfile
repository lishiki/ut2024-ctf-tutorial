FROM node:23.4.0-slim

RUN useradd -m app
USER app

WORKDIR /app

RUN npm install express mysql

COPY . .

CMD ["node", "app.js"]