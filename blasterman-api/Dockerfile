# syntax=docker/dockerfile:1

FROM node:15.11.0-buster-slim as BUILDER

COPY package.json package-lock.json  ./

RUN npm install

COPY tsconfig.json webpack.config.js webpack.prod.js jasmine.json .eslintrc.json  ./

COPY src src
COPY specs specs
COPY assets assets 

RUN npm run build:prod


FROM node:15.11.0-buster-slim

ENV NODE_ENV=production

COPY --from=BUILDER dist /blasterman-api 

CMD ["node", "/blasterman-api/game.min.js"]
