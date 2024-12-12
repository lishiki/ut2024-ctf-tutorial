FROM node:23.4.0-slim

RUN useradd -m app
USER app

WORKDIR /app

RUN npm install express
RUN npm install playwright
RUN npx playwright install chromium

USER root
RUN npx playwright install-deps
USER app

COPY . .

CMD ["node", "app.js"]