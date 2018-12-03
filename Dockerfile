FROM node:7.7.1
MAINTAINER Daniel Marchena <danielmapar@gmail.com>

ENV DB_HOST graphql-db
ENV DB_USERNAME adaptive_user
ENV DB_PASSWORD adaptive_pw
ENV DB_NAME adaptive_db
ENV DB_PORT 3306

# Create/Set the working directory
RUN mkdir /app
WORKDIR /app

COPY package.json /app/package.json
RUN npm install && npm install -g mysql2 && npm install -g sequelize && npm install -g sequelize-cli

# Copy App
COPY . /app

# Set Entrypoint
ENTRYPOINT chmod 777 ./wait-for-it.sh && ./wait-for-it.sh -t 40 graphql-db:3306 && sequelize db:migrate && npm run start
