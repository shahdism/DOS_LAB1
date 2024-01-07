# node image
FROM node:latest

#  working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY package-lock.json ./

# Copy the database file from the local machine to the container
COPY DataBase/database.db /app

# Install dependencies
RUN npm install

# Copy the catalog service code
COPY . .

EXPOSE 7001

#  the command to start the catalog service
CMD [ "node", "catalog/catalog.js" ]
