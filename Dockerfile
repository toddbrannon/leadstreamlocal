# Use the official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /leadstreamlocal

# Copy the current directory contents into the container at /app
COPY . /leadstreamlocal

# Install any needed packages specified in package.json
RUN npm install

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable
ENV NAME World

# Run app.js when the container launches
CMD ["node", "app.js"]
