FROM node:lts-alpine

RUN mkdir -p /home/node/simple-chat/node_modules && chown -R node:node /home/node/simple-chat

RUN mkdir -p /data/db && chown -R node:node /data/db

WORKDIR /home/node/simple-chat

COPY package.json yarn.* ./

USER node

RUN yarn install --production

COPY --chown=node:node . .

EXPOSE 3000

CMD ["node", "server.js"]
