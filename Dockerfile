FROM node:current-alpine
EXPOSE 8080

ENV NODE_ENV=production

WORKDIR /app
COPY . .

RUN npm install && npm audit fix --force

CMD ["node", "server/httpd.js"]
