import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema.ts";
import { generateSchemaSDLFile } from "./generate-schema.ts";
import { generateGenQL } from "./generate-genql.ts";

// Honoアプリケーション
const app = new Hono();

// GraphQL Yogaの設定（動的に更新可能にするため変数として保持）
let yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
});

// スキーマを再読み込みする関数（Step 2）
const reloadSchema = async () => {
  try {
    // モジュールキャッシュを回避するためにタイムスタンプを追加
    const timestamp = Date.now();
    const schemaModule = await import(`./schema.ts?update=${timestamp}`);
    
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
      await generateSchemaSDLFile();
      await generateGenQL();
      console.log("✅ 型定義の自動生成が完了しました");
    } catch (error) {
      console.error("⚠️ 型定義の自動生成に失敗しました（サーバーは動作します）:", error);
    }
    
    return true;
  } catch (error) {
    console.error("❌ スキーマの再読み込みに失敗しました:", error);
    return false;
  }
};

// スキーマファイルの監視（Step 1: ファイル監視の基本実装 + Step 2: 再読み込み）
const watchSchemaFile = async () => {
  const schemaPath = "./src/schema.ts";
  
  try {
    const watcher = Deno.watchFs(schemaPath);
    console.log(`📁 スキーマファイルを監視中: ${schemaPath}`);
    
    for await (const event of watcher) {
      if (event.kind === "modify") {
        console.log("🔄 スキーマファイルが変更されました:", event.paths);
        // 少し待ってから再読み込み（ファイル書き込み完了を待つ）
        await new Promise(resolve => setTimeout(resolve, 100));
        await reloadSchema();
      }
    }
  } catch (error) {
    console.error("❌ ファイル監視エラー:", error);
  }
};

// バックグラウンドでファイル監視を開始
watchSchemaFile();

// TypeScriptファイル（.ts, .tsx）をJavaScriptに変換して配信（deno bundle使用）
const bundleTypeScript = async (filePath: string) => {
  try {
    const absolutePath = await Deno.realPath(filePath);
    const command = new Deno.Command(Deno.execPath(), {
      args: ["bundle", "--import-map", "import_map.json", absolutePath],
      stdout: "piped",
      stderr: "piped",
      cwd: Deno.cwd(),
    });

    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      console.error(`Error bundling ${filePath}:`, errorText);
      return new Response(`Error bundling TypeScript: ${errorText}`, { 
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    const bundledCode = new TextDecoder().decode(stdout);
    return new Response(bundledCode, {
      status: 200,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error bundling ${filePath}:`, errorMessage);
    return new Response(`Error: ${errorMessage}`, { status: 500 });
  }
};

// GraphQLエンドポイント（最初に定義）
app.all("/graphql", (c) => {
  return yoga.fetch(c.req.raw);
});

// TypeScriptファイルの処理（静的ファイル配信より前に）
app.use("/*", async (c, next) => {
  const pathname = new URL(c.req.url).pathname;
  
  if (pathname.endsWith(".ts") || pathname.endsWith(".tsx")) {
    const filePath = `./public${pathname}`;
    try {
      await Deno.stat(filePath);
      return await bundleTypeScript(filePath);
    } catch {
      return c.text(`File not found: ${filePath}`, 404);
    }
  }
  
  return await next();
});

// 静的ファイル配信
app.use("/*", serveStatic({ root: "./public" }));

// ルートパス `/` でindex.htmlを返す
app.get("/", async (c) => {
  try {
    const html = await Deno.readTextFile("./public/index.html");
    return c.html(html);
  } catch {
    return c.text("HTML file not found", 404);
  }
});

console.log("🚀 Deno 2.5 GraphQL listening: http://localhost:4000/graphql");
console.log("📄 HTML endpoint: http://localhost:4000/");

// Deno のネイティブ Web サーバ API
Deno.serve(
  {
    port: 4000,
  },
  app.fetch
);