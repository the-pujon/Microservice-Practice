# Practicale Microservice

This repository implements a microservices-based architecture for a practical application, featuring an API gateway, a client, and two main services: Inventory and Product. Each service is independently deployable and manages its own database schema using Prisma.

## Project Structure

```
.
├── api-gatwaye/         # API Gateway (handles routing, authentication, etc.)
├── client/              # Frontend client (details not shown)
└── services/
    ├── inventory/       # Inventory microservice
    └── product/         # Product microservice
```

### Details

- **api-gatwaye/**: Node.js/TypeScript project acting as the API gateway. Handles incoming requests and routes them to the appropriate microservice.
- **client/**: Placeholder for the frontend application (not detailed here).
- **services/inventory/**: Inventory management microservice, with its own database and Prisma setup.
- **services/product/**: Product management microservice, also with its own database and Prisma setup.

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- Docker (for running databases via `docker-compose`)
- [Prisma CLI](https://www.prisma.io/docs/reference/api-reference/command-reference) (optional, for database management)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd Practicale\ Microservice
   ```

2. **Install dependencies for each service:**
   ```sh
   cd api-gatwaye && npm install
   cd ../services/inventory && npm install
   cd ../services/product && npm install
   ```

3. **Set up the databases:**
   - Use the provided `docker-compose.yml` to spin up the required databases.
   ```sh
   docker-compose up -d
   ```

4. **Run database migrations:**
   - For each service, apply Prisma migrations:
   ```sh
   cd services/inventory
   npx prisma migrate deploy
   cd ../product
   npx prisma migrate deploy
   ```

### Running the Services

- **API Gateway:**
  ```sh
  cd api-gatwaye
  npm run start
  ```
- **Inventory Service:**
  ```sh
  cd services/inventory
  npm run start
  ```
- **Product Service:**
  ```sh
  cd services/product
  npm run start
  ```

> You can run each service in a separate terminal window.

## Development

- Each microservice is a standalone Node.js/TypeScript project.
- Database schemas are managed with Prisma (`prisma/schema.prisma` in each service).
- Controllers for business logic are in `src/controllers/`.
- Shared/generated Prisma client code is in `generated/prisma/`.

## Database Management

- Migrations are stored in `prisma/migrations/` for each service.
- To view or edit the schema, modify `prisma/schema.prisma` and run:
  ```sh
  npx prisma migrate dev
  ```
- To open Prisma Studio for database inspection:
  ```sh
  npx prisma studio
  ```

## API Endpoints

- **API Gateway**: Handles routing to microservices.
- **Inventory Service**: CRUD operations for inventory items.
- **Product Service**: CRUD operations for products.

Refer to the controllers in each service (`src/controllers/`) for specific endpoint implementations.

## How the API Gateway Works

The **API Gateway** acts as the single entry point for all client requests. It receives HTTP requests from the client, handles authentication and authorization (if implemented), and routes the requests to the appropriate microservice (Inventory or Product) based on the endpoint. This centralizes cross-cutting concerns such as logging, error handling, and request validation, making the system easier to manage and scale. The gateway abstracts the internal structure of the microservices, so clients do not need to know the details of each service.

## How to Run the Full Application

Follow these steps to run the entire application locally:

1. **Start PostgreSQL Databases with Docker**
   - Make sure Docker is running on your machine.
   - In the project root, start the databases using Docker Compose:
     ```sh
     docker-compose up -d
     ```

2. **Start the Inventory Service**
   - Open a terminal and navigate to the inventory service:
     ```sh
     cd services/inventory
     npm install
     npm run start
     ```

3. **Start the Product Service**
   - Open another terminal and navigate to the product service:
     ```sh
     cd services/product
     npm install
     npm run start
     ```

4. **Start the API Gateway**
   - Open a third terminal and navigate to the API gateway:
     ```sh
     cd api-gatwaye
     npm install
     npm run start
     ```

5. **Access the Application via the API Gateway**
   - All client requests should be sent to the API Gateway's address (e.g., `http://localhost:PORT`). The gateway will route requests to the correct microservice.

> **Note:** Always start the services in this order: Docker (for databases) → Inventory Service → Product Service → API Gateway. This ensures all dependencies are available when needed.


