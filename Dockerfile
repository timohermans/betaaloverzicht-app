### Build Step
# pull the Node.js Docker image
FROM node:16.2 as builder

# change working directory
WORKDIR /usr/src/app

# copy the package.json files from local machine to the workdir in container
COPY package*.json ./

# run npm install in our local machine
RUN npm ci

# copy the generated modules and all other files to the container
COPY . .

# build the application
RUN npm run build

### Serve Step
# pull the Node.js Docker image
FROM nginx:1.19-alpine

COPY --from=builder /usr/src/app/build /usr/share/nginx/html