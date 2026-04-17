FROM node:20.16-alphine3.19

WORKDIR /build

COPY package*.json .

RUN npm ci --omit=dev && npm cache clean --force

COPY . . 

EXPOSE 3000 