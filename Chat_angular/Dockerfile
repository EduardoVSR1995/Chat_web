FROM node:20.9.0 AS builder
WORKDIR /work
COPY ./*.json /work
RUN npm install -q
COPY . /work
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /work/dist/chat_app/browser .  
COPY ./nginx.conf /etc/nginx/nginx.conf   
EXPOSE 80