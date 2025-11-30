// ファイル変更を監視して自動的にスキーマ生成とgenql生成を実行するスクリプト
// src/schema.tsが変更されたら自動的に再生成

import { generateSchemaSDL } from "./generate/generate-schema.ts";
import { generateGenQL } from "./generate/generate-genql.ts";

let isGenerating = false;
let debounceTimer: number | null = null;

async function generateAll() {
  if (isGenerating) {
    console.log("⏳ 既に生成中です。スキップします。");
    return;
  }

  isGenerating = true;
  try {
    console.log("🔄 スキーマ変更を検知しました。再生成を開始...");

    // スキーマを生成
    await generateSchemaSDL();

    // genqlで型定義を生成
    await generateGenQL();

    console.log("✅ 再生成が完了しました");
  } catch (error) {
    console.error("❌ 再生成エラー:", error);
  } finally {
    isGenerating = false;
  }
}

async function watchAndGenerate() {
  const schemaPath = "./src/schema/schema.ts";

  try {
    // 初回生成
    console.log("🚀 初回生成を実行します...");
    await generateAll();

    console.log(`📁 ファイル監視を開始: ${schemaPath}`);
    console.log("   ファイルを保存すると自動的に再生成されます");

    // ファイル変更を監視
    const watcher = Deno.watchFs(schemaPath);

    for await (const event of watcher) {
      if (event.kind === "modify") {
        // デバウンス処理（500ms待ってから実行）
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
          await generateAll();
          debounceTimer = null;
        }, 500);
      }
    }
  } catch (error) {
    console.error("❌ ファイル監視エラー:", error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await watchAndGenerate();
}

export { watchAndGenerate };
