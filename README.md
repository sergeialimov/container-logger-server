# Docker Logs Handling Project

This project is designed to handle and process logs from multiple Docker containers. It uses Nest.js and is structured to distribute log processing tasks across multiple microservices.

## Overview

The project aims to efficiently manage logs from up to 100 Docker containers, ensuring that all logs are captured and processed, even if the server restarts. It includes functionality to backfill missed logs and to stream ongoing logs without duplication.

## Features

- **High Priority Container Identification**: Fetches and identifies high-priority containers based on specified criteria.
- **Log Backfilling**: Retrieves missed logs since the last known timestamp from the database.
- **Log Streaming**: Continuously streams new logs from each container.
- **Distributed Processing**: Distributes log handling tasks evenly across multiple executor microservices.

## Repository Structure

This repository is organized into two main applications and four libraries, each serving a specific purpose within the project. Below is an overview of the structure and the role of each component:

### Applications

1. **Server App**:
   - Location: `apps/server`
   - Description: Responsible for managing and streaming Docker container logs. It handles log processing, storage, and serves as the main backend service.

2. **CLI App**:
   - Location: `apps/cli`
   - Description: A command-line interface that allows interaction with the Server app for operations like fetching container logs.

### Libraries

1. **Storage Lib**:
   - Location: `libs/storage`
   - Description: Handles data persistence, including interactions with databases and storage systems.

2. **Shared Lib**:
   - Location: `libs/shared`
   - Description: Contains shared utilities, common interfaces, and helper functions used across the project.

3. **Config Lib**:
   - Location: `libs/config`
   - Description: Manages configuration settings for the applications, including environment-specific settings.

4. **Console Lib**:
   - Location: `libs/console`
   - Description: Provides functionalities related to console operations, mainly used by the CLI app for output formatting and interaction.

## Getting Started


### Installation

1. Clone the repository:
```sh
git clone git@github.com:sergeialimov/container-logger-server.git
```

2. Navigate to 
```sh
cd container-logger-server
```

3. Set up Docker environment

```sh
docker-compose up -d
```

### Running the Application

Logger server doesn't require extra steps.

To execute CLI command run:

```sh
docker-compose run --rm cli yarn commands cli log:get-container-logs --container <containerId>
```


## Technologies Used

This project is built with a range of technologies, frameworks, and tools, each chosen to provide robust functionality and performance. Below is a list of the key technologies used:

- **Nest.js**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **Nest Microservices**: Part of Nest.js, used for building scalable microservice architectures.
- **Yarn**: Fast, reliable, and secure dependency management.
- **Elasticsearch**: A distributed, RESTful search and analytics engine capable of addressing a growing number of use cases.
- **Docker**: A platform for developing, shipping, and running applications inside isolated containers.
- **Nx**: Extensible dev tools for monorepos, which helps with building and testing projects like this one.
