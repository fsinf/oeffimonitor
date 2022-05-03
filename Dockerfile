FROM node:16-alpine
EXPOSE 8080

ENV NODE_ENV=production

WORKDIR /app
COPY . .

RUN npm install && npm install -g npm@8.8.0 && npm audit fix --force

CMD ["node", "server/httpd.js"]
