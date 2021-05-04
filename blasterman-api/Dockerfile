# syntax=docker/dockerfile:1

FROM node:15.11.0 as BUILDER

COPY package.json package-lock.json  ./

RUN npm install

COPY tsconfig.json webpack.config.js jasmine.json .eslintrc.json  ./

COPY src src
COPY specs specs

RUN npm run build


FROM node:15.11.0

ENV NODE_ENV=production

COPY --from=BUILDER dist . 

CMD ["node", "."]
