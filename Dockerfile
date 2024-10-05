#Sample Dockerfile for NodeJS Apps

FROM node:22.9

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

EXPOSE 8000

CMD [ "node", "index.js" ]