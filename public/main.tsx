import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { cacheExchange, createClient, fetchExchange, Provider } from "urql";
import App from "./App.tsx";

// urqlクライアントを作成
const urqlClient = createClient({
  url: "/graphql",
  exchanges: [cacheExchange, fetchExchange],
});

const rootElement = document.getElementById("app");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <Provider value={urqlClient}>
      <App />
    </Provider>
  </StrictMode>,
);
