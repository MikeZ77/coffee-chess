FROM node:14.20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN apk add --no-cache tzdata
# Change this to your timezone
ENV TZ=America/Edmonton
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
COPY . .
RUN chmod +x run-server.sh
EXPOSE 3000
CMD sh run-server.sh