# syntax=docker/dockerfile:1.0-experimental

# ARGs are used to pass in values at build time.
ARG PYTHON_VERSION=3.6
ARG NODE_VERSION=16
ARG NODE_ENV=production
ARG PORT=3000


################################################################################
# Use node image for node_base image for all node-related stages.
FROM node:${NODE_VERSION}-alpine as node_base

# Set working directory for all build stages.
WORKDIR /usr/src/app


################################################################################
# Use python image for python_base image for all python-related stages.
FROM python:${PYTHON_VERSION}-slim as python_base

# Set working directory for all python build stages.
WORKDIR /usr/src/app

# Install pipenv
RUN pip install pipenv


################################################################################
# Create a stage for installing production node dependecies.
FROM node_base as npm_deps
ARG NODE_ENV

# Download npm dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev


################################################################################
# Create a stage for installing production build python dependecies.
FROM python_base as pip_deps

# Download pip dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.pip to speed up subsequent builds.
# Leverage bind mounts to Pipfile and Pipfile.lock to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=Pipfile,target=Pipfile \
    --mount=type=bind,source=Pipfile.lock,target=Pipfile.lock \
    --mount=type=cache,target=/root/.pip \
    PIPENV_YES=1 pipenv install


################################################################################
# Create a stage for building the application (currently just copies the files
# needed by the dynamic server as no static compilation is implemented).
FROM npm_deps as build_app

# Copy the source files needed for express serving into the image.
COPY ./public ./public
COPY ./views ./views
COPY ./data ./data
COPY ./server.js .


################################################################################
# Create a stage for building the ML model.
FROM pip_deps as build_model

# Copy the pip deps from the deps stage
COPY --from=pip_deps /root/.local/share/virtualenvs/ /root/.local/share/virtualenvs/

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN pipenv run python3 utils/training.py 5 public/saved


################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM node_base as final
ARG PORT
ARG NODE_ENV

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json .

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=build_app /usr/src/app .
COPY --from=npm_deps /usr/src/app/node_modules ./node_modules
COPY --from=build_model /usr/src/app/public/saved ./public/saved

# Allow writing to the saved-states dir
USER root
RUN chown node:node /usr/src/app/data/saved-states
USER node

# Expose the port that the application listens on.
EXPOSE ${PORT}

# Set runtime environment variables
ENV PORT ${PORT}
ENV NODE_ENV ${NODE_ENV}

# Run the application.
CMD npm start
