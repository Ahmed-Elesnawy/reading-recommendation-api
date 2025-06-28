# Reading Recommendation API

A NestJS-based REST API for tracking reading progress and providing book recommendations. Users can log their reading intervals for books and get insights on their reading habits.

## Features

- 📚 **Book Management**: Create and manage books with page tracking
- 📖 **Reading Intervals**: Track reading progress with start/end pages
- 👥 **User Authentication**: JWT-based authentication with role-based access
- 📊 **Top Books**: Get recommendations based on most-read books
- 🚀 **Queue Processing**: Background processing for calculating read pages
- 🔒 **Security**: Rate limiting, CORS, and input validation

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis with BullMQ
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI - localhost:3000/api-docs
- **Package Manager**: pnpm

## Prerequisites

Make sure you have the following installed on your system:

- [Docker](https://docs.docker.com/get-docker/) (version 20.0 or later)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or later)
- [Git](https://git-scm.com/downloads)

## Quick Start with Docker Compose

### 1. Clone the Repository

```bash
git clone git@github.com:Ahmed-Elesnawy/reading-recommendation-api.git
cd reading-recommendation-api
```

### 2. Environment Setup

Create a copy of the environment example file:

```bash
cp .env.example .env
```

The application uses environment variables that are already configured in the `docker-compose.yml` file. For Docker Compose setup, no additional configuration is needed.

### 3. Run the Application

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

## Possible Improvements

### Architecture and Design
- **Repository Pattern**: Currently not implemented as it would be an overhead for this task's scope. Could be added if the application grows more complex.
- **Job Processing**: Consider separating the job processing into a dedicated service for better scalability and maintainability.
- **Read Pages Calculation**: 
  - Two methods are implemented for calculating read pages
  - The optimized version works fine but could benefit from additional test coverage
  - Current implementation is stable and efficient

### Monitoring and Observability
- **Metrics and Logging**:
  - Implement Grafana for visualization
  - Add Prometheus for metrics collection
  - Set up proper monitoring dashboards
  - Enhanced logging with structured formats

### Scaling and High Availability
- **Infrastructure Options**:
  - Consider Kubernetes for container orchestration
  - Evaluate managed services:
    - Amazon RDS or Azure Database for PostgreSQL
    - Amazon ElastiCache or Azure Cache for Redis
  - Implement proper load balancing
  - Set up auto-scaling policies