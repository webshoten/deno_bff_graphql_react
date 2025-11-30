// PothosスキーマからGraphQL SDLを生成するスクリプト
// スキーマをSDL形式に変換してファイルに出力

import { printSchema } from "graphql";
import { schema } from "../schema/schema.ts";

// スキーマをSDL形式に変換
function generateSchemaSDL() {
  try {
    const sdl = printSchema(schema);
    return sdl;
  } catch (error) {
    console.error("❌ SDL生成エラー:", error);
    throw error;
  }
}

// スキーマをSDL形式に変換してファイルに書き込む
export async function generateSchemaSDLFile() {
  try {
    const sdl = generateSchemaSDL();
    await Deno.writeTextFile("./schema/schema.graphql", sdl);
    return sdl;
  } catch (error) {
    console.error("❌ SDL生成エラー:", error);
    throw error;
  }
}

if (import.meta.main) {
  const sdl = generateSchemaSDL();
  await Deno.writeTextFile("./schema/schema.graphql", sdl);
  console.log("✅ GraphQL SDLを生成しました: schema/schema.graphql");
  console.log("   このファイルをgenqlで使用して型定義を生成できます");
}

export { generateSchemaSDL };
