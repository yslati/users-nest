FROM alpine:3.14

WORKDIR /usr/src/app

RUN apk add --no-cache nodejs npm

RUN apk add --update npm

COPY package*.json ./

RUN npm audit fix --force

RUN npm i

COPY . ./

# RUN npm run start:dev
RUN npm run build

EXPOSE 9000

CMD ["node", "dist/main.js"]