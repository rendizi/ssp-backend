FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4000

ENV NODE_OPTIONS="--max-old-space-size=8192" 

CMD ["npm", "run", "start:dev"]
