Dockerizing your app can be a great way to ensure it runs the same way across different environments. Here’s a step-by-step guide on how to Dockerize your Express.js app based on the information you've provided:

1. **Create a `Dockerfile`**: 
   Create a file named `Dockerfile` in the root directory of your project. This file defines the environment in which your app will run.

```Dockerfile
# Use the official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in package.json
RUN npm install

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable
ENV NAME World

# Run app.js when the container launches
CMD ["node", "app.js"]
```

2. **Create a `.dockerignore` file**:
   This will prevent your local modules and debug logs from being copied onto your Docker image and possibly overwriting modules installed within your image.

```dockerignore
node_modules
npm-debug.log
```

3. **Build your Docker Image**:
   Navigate to your project directory and run the following command to build your Docker image. Replace `my-app` with whatever name you want to give your Docker image.

```bash
docker build -t my-app .
```

4. **Run your Docker Container**:
   Now, run the following command to run your Docker container. Replace `my-app` with the name you gave your Docker image.

```bash
docker run -p 49160:3000 -d my-app
```

Now, your app should be running on port 49160 on your Docker host. You can access it by navigating to `http://localhost:49160` in your web browser (if you're running Docker on your local machine).

5. **Docker Compose (Optional)**:
   If you have multiple services (e.g., a database, backend, frontend), consider using Docker Compose to manage them. Create a file named `docker-compose.yml` in your project root.

```yaml
version: '3'
services:
  web:
    build: .
    ports:
     - "3000:3000"
```

Then, you can start your services with the following command:

```bash
docker-compose up --build
```

This setup assumes a simplistic application structure and might need adjustments to fit your project's structure and requirements better.


**you can run your tests with the mocha command:**

```bash
npx mocha tests/**/*.js
```

This will run all files in the tests directory (and all subdirectories) that match the pattern *.js.