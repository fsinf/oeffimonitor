FROM node:alpine
MAINTAINER David Kaufmann <astra@ionic.at>

ENV DEBIAN_FRONTEND noninteractive

COPY . /home/node/oeffimonitor

WORKDIR /home/node/oeffimonitor

RUN npm install
RUN npm audit fix --force

CMD ["/usr/local/bin/node", "server/httpd.js"]
