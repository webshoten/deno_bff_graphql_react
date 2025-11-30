export function Header() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        GraphQL API Test
      </h1>
      <p className="text-sm text-gray-600">
        GraphQL endpoint:{" "}
        <a
          href="/graphql"
          className="text-blue-600 hover:text-blue-800 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          /graphql
        </a>
      </p>
    </div>
  );
}
