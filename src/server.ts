import { createYoga } from "graphql-yoga";
import { schema } from "./schema.ts";

// Deno 2.5 の標準 Web サーバ
const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
});

console.log("🚀 Deno 2.5 GraphQL listening: http://localhost:4000/graphql");

// Deno のネイティブ Web サーバ API
Deno.serve(
  {
    port: 4000,
  },
  yoga.fetch
);