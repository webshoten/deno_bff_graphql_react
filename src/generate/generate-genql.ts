// genqlを使用して型定義とクライアントコードを生成するスクリプト
// schema/schema.graphqlから型定義を生成
// Deno.Commandでnpxを呼び出してgenqlを実行

import { fixGenQLImports } from "./fix-genql-imports.ts";

async function generateGenQL() {
  try {
    const schemaPath = "./schema/schema.graphql";
    const outputDir = "./public/generated/genql";

    // schema.graphqlが存在するか確認
    try {
      await Deno.stat(schemaPath);
    } catch {
      throw new Error(`スキーマファイルが見つかりません: ${schemaPath}`);
    }

    // 出力ディレクトリが存在しない場合は作成
    try {
      await Deno.stat(outputDir);
    } catch {
      await Deno.mkdir(outputDir, { recursive: true });
    }

    console.log("🔄 genqlで型定義を生成中...");
    console.log(`   スキーマ: ${schemaPath}`);
    console.log(`   出力先: ${outputDir}`);

    // npx経由で@genql/cliを実行（--esmフラグを追加してESM形式で生成）
    const command = new Deno.Command("npx", {
      args: [
        "@genql/cli",
        "--schema",
        schemaPath,
        "--output",
        outputDir,
        "--esm",
      ],
      stdout: "piped",
      stderr: "piped",
      cwd: Deno.cwd(),
    });

    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      const outputText = new TextDecoder().decode(stdout);
      console.error("❌ genql生成エラー:");
      console.error(errorText);
      console.error(outputText);
      throw new Error(`genqlの実行に失敗しました (終了コード: ${code})`);
    }

    const outputText = new TextDecoder().decode(stdout);
    if (outputText) {
      console.log(outputText);
    }

    console.log(`✅ genqlで型定義を生成しました: ${outputDir}`);

    // インポートパスをDeno形式に修正
    console.log("🔄 インポートパスをDeno形式に修正中...");
    await fixGenQLImports();

    console.log("   クライアントから型定義を使用できます");
  } catch (error) {
    console.error("❌ genql生成エラー:", error);
    if (error instanceof Error && error.message.includes("npx")) {
      console.error(
        "   ヒント: Node.jsとnpmがインストールされているか確認してください",
      );
      console.error(
        "   手動で実行: npx @genql/cli --schema ./schema/schema.graphql --output ./public/generated/genql",
      );
    }
    throw error;
  }
}

if (import.meta.main) {
  await generateGenQL();
}

export { generateGenQL };
