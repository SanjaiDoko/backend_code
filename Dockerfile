FROM node:18
WORKDIR /app
ENV NODE_ENV production
# COPY /config/config.js ./config/config.js
# COPY /config/config.json ./config/config.json
# COPY /config/settings.json ./config/settings.json
# ENV OPENSSL_CONF=/config/openssl.cnf
COPY package.json .
COPY package-lock.json .
RUN npm install 
RUN npm install pm2 -g
COPY . /app
EXPOSE 3000

CMD ["pm2-runtime", "app.js"]