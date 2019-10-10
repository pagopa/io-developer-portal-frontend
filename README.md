# IO developer portal frontend

The repository contains the code implementing *IO developer portal* frontend.

## Tools

* [Docker](https://www.docker.com/) and [Docker Compose](https://github.com/docker/compose)

## Build the application

The application can potentially run anywhere, either directly on a bare-bone machine, or in a form of a Docker container. Every change to the code, triggers an automated image build on DockerHub.

Images are consumed by production deployments, where they're usually deployed on top of Kubernetes clusters. For more informations about IO production deployments and IO helm-charts, have a look at the [io-infrastructure-post-config repository](https://github.com/teamdigitale/io-infrastructure-post-config).

## Test the application locally

The application can be built and tested locally, either directly on the developer machine (directly using development tools, such as *yarn* or *parcel*), or as a Docker-based image.

### Test directly on the developer machine

The application can be directly tested on the developer machine, using *yarn*:

```shell
# Install dependencies
yarn install

# Export env variables from .env.io-developer-portal.development
export $(grep -v '^#' .env.io-developer-portal.development | xargs) && chmod +x env.sh && source env.sh

# Run the application on a local dev server
yarn parcel:serve
```

Then, point your browser to

* [http://localhost:8080](http://localhost:8080) to reach the frontend

### Test with Docker

To test the application, run in the root folder:

```shell
docker-compose up
```

Then, point your browser to

* [http://localhost:8080](http://localhost:8080) to reach the frontend

To bring down the test environment:

```shell
docker-compose down
```

Sometimes, it may be needed to re-built the frontend image, which is instead cached by Docker, once built the first time. To overcome this behavior, run:

```shell
docker-compose up --build
```

## Production deployments

At this point in time the application is served in two environments: Kubernetes (AKS), in form of Docker image, and on GitHub pages.

### Deploy on AKS

The AKS deployment is driven by a specific helm-chart. More informations are available in the [IO infrastructure post config repository](https://github.com/teamdigitale/io-infrastructure-post-config).

### Deploy on GitHub pages

The deployment on GitHub pages is achieved pushing the artifacts created as consequence of the build to the *gh-pages* branch of this repository.

To publish on GitHub pages, run:

```shell
# Fill the env-config.js file with the variables needed by the application to work
export $(grep -v '^#' .env.io-developer-portal.development | xargs) && chmod +x env.sh && source env.sh

# Build the application
yarn build

# Deploy to GitHub pages
yarn deploy
```
