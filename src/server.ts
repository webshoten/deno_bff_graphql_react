import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema/schema.ts";
import { generateSchemaSDLFile } from "./generate/generate-schema.ts";
import { generateGenQL } from "./generate/generate-genql.ts";
import { initializeData } from "./kv/index.ts";

const app = new Hono();

let yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
});

const reloadSchema = async () => {
  try {
    // モジュールキャッシュを回避するためにタイムスタンプを追加
    const timestamp = Date.now();
    const schemaModule = await import(`./schema/schema.ts?update=${timestamp}`);

    if (!schemaModule.schema) {
      throw new Error("スキーマが見つかりません");
    }

    // 新しいスキーマでYogaインスタンスを再作成
    yoga = createYoga({
      schema: schemaModule.schema,
      graphqlEndpoint: "/graphql",
    });

    console.log("✅ スキーマを再読み込みしました");

    // 型定義を自動生成
    try {
      console.log("🔄 型定義を自動生成中...");
      // .graphqlファイルを生成
      await generateSchemaSDLFile();
      // .graphqlをもとにgenqlを生成
      await generateGenQL();
      console.log("✅ 型定義の自動生成が完了しました");
    } catch (error) {
      console.error(
        "⚠️ 型定義の自動生成に失敗しました（サーバーは動作します）:",
        error,
      );
    }

    return true;
  } catch (error) {
    console.error("❌ スキーマの再読み込みに失敗しました:", error);
    return false;
  }
};

// スキーマファイルの監視（Step 1: ファイル監視の基本実装 + Step 2: 再読み込み）
const watchSchemaFile = async () => {
  const schemaPath = "./src/schema";

  try {
    // Denoファイル監視APIを使用してスキーマファイル変更を監視
    const watcher = Deno.watchFs(schemaPath);
    console.log(`📁 スキーマファイルを監視中: ${schemaPath}`);

    for await (const event of watcher) {
      if (event.kind === "modify") {
        console.log("🔄 スキーマファイルが変更されました:", event.paths);
        // 少し待ってから再読み込み（ファイル書き込み完了を待つ）
        await new Promise((resolve) => setTimeout(resolve, 100));
        await reloadSchema();
      }
    }
  } catch (error) {
    console.error("❌ ファイル監視エラー:", error);
  }
};

// バックグラウンドでファイル監視を開始（開発環境のみ）
if (Deno.env.get("DENO_ENV") !== "production") {
  watchSchemaFile();
} else {
  console.log("📁 本番環境のため、ファイル監視を無効化しました");
}

// GraphQLエンドポイント（最初に定義）
app.all("/graphql", (c) => {
  return yoga.fetch(c.req.raw);
});

// 静的ファイル配信（dist/を優先、次にpublic/）
app.use("/*", async (c, next) => {
  const path = c.req.path;

  // dist/から配信を試みる
  try {
    const distPath = `./dist${path}`;
    const stat = await Deno.stat(distPath);
    if (stat.isFile) {
      return serveStatic({ root: "./dist" })(c, next);
    }
  } catch {
    // dist/にない場合はpublic/から配信
  }

  // public/から配信
  return serveStatic({ root: "./public" })(c, next);
});

// 初期データを投入
await initializeData();

const port = parseInt(Deno.env.get("PORT") || "4000");

console.log(`🚀 Deno 2.5 GraphQL listening: http://localhost:${port}/graphql`);
console.log(`📄 HTML endpoint: http://localhost:${port}/`);

// Deno のネイティブ Web サーバ API
Deno.serve(
  {
    port,
  },
  app.fetch,
);
