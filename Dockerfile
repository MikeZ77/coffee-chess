FROM node:14.20-alpine
ARG ENV
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN apk add --no-cache tzdata
# Change this to your timezone
ENV TZ=America/Edmonton
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
COPY . .
EXPOSE 3000
CMD if ["$ENV" = "dev"]; then \
        npm run dev \
    elif \
        ["$ENV" = "lab"]; then \
        rm .env && npm run lab \
    fi
