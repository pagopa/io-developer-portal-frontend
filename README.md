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

### Configuration

The table below describes all the Environment variables needed by the application.

| Variable name | Description | type |
|----------------|-------------|------|
|IO\_DEVELOPER\_PORTAL\_PORT| The port the service will listen on |int|
|IO\_DEVELOPER\_PORTAL\_BACKEND| Full url of the backend application |string|
|IO\_DEVELOPER\_PORTAL\_APIM\_BASE_URL| Full url and path for the APIM|string|
|IO\_DEVELOPER\_PORTAL\_BASE\_URL| Base URL for the application|string|
|IO\_DEVELOPER\_PORTAL\_PUBLIC\_PATH| Public base url for the application|string|

### Environment variables run-time injection

The frontend container needs to adapt to different environments, reading at run-time environment variables values. For example, the application needs to know the address of the backend application. This is a non trivial task, since Javascript code runs on the client machine of the user executing the application, which prevents the application from directly reading the environment variables from the container.

To overcome this limitation, an *env.sh* bash script inside the main folder is executed every time the frontend application container starts, then is subsequently deleted. The script reads the environment variables and produces an *env-config.js* file that is then automatically copied together with the rest of the files to be served by the webserver. The *index.html* file (in the *main* folder of this repository) links already to *env-config.js*, which is read every time the user opens the application in a browser.

>**IMPORTANT**: The *env.sh* script reads and automatically injects in `env-config.js` all environment variables prefixed with *IO_DEVELOPER_PORTAL*, for example *IO_DEVELOPER_PORTAL_PORT*.

To read the variable values inside the frontend application, use `window._env_.IO_DEVELOPER_PORTAL_YOUR_VAR`.

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



test
