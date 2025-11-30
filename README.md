# Deno BFF GraphQL React

A type-safe GraphQL BFF (Backend for Frontend) application using Deno + Pothos +
GraphQL Yoga + React + urql + GenQL. Provides data storage with Deno KV and
type-safe GraphQL client with GenQL.

## Overview

This project uses Deno as the backend, defines GraphQL schemas with Pothos,
builds an API server with GraphQL Yoga, and implements the frontend with React +
urql. By using GenQL, you can execute GraphQL queries and mutations in a
type-safe manner.

## Getting Started

### Prerequisites

- Deno 2.5 or higher
- Node.js (required for GenQL generation)

### 1. Clone the Repository

```bash
git clone https://github.com/webshoten/deno_bff_graphql_react.git
cd deno_bff_graphql_react
```

### 2. Install Dependencies

Deno manages dependencies using `import_map.json`, so no additional installation
is required. Dependencies will be automatically downloaded on first run.

### 3. Start the Development Server

```bash
deno task dev
```

This will start:

- GraphQL API server (port 4000)
- File watching and automatic build
- Schema file change monitoring and automatic regeneration

Open `http://localhost:4000` in your browser.

### 4. Other Tasks

```bash
# Generate GraphQL SDL from schema
deno task generate-schema

# Generate GenQL type definitions
deno task generate-genql

# Build for production
deno task build
```

## Project Structure

```text
.
├── src/
│   ├── schema/          # GraphQL schema definitions (Pothos)
│   ├── kv/              # Deno KV data access layer
│   ├── generate/        # Schema generation scripts
│   ├── server.ts        # GraphQL API server
│   └── build.ts         # React app build
├── public/              # Frontend (React)
│   ├── App.tsx
│   ├── main.tsx
│   └── generated/       # GenQL generated files
├── schema/              # GraphQL SDL files
└── dist/                # Build output
```

## Deploy to Deno Deploy

1. Create a project in Deno Deploy dashboard
2. Configure the following:
   - **Entrypoint**: `src/server.ts`
   - **Import Map**: `import_map.json`
   - **Environment Variables**: `DENO_ENV=production`

## Tech Stack

- **Backend**: Deno, Pothos, GraphQL Yoga, Hono
- **Frontend**: React, urql
- **Database**: Deno KV
- **Type Safety**: GenQL
- **Build**: Deno Bundle
