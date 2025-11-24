// genqlで生成されたファイルのインポートパスをDeno形式に修正し、@ts-nocheckを削除するスクリプト
// genqlの生成後に実行する

async function fixGenQLImports() {
  const genqlDir = "./public/generated/genql";
  
  // index.tsのインポートパスを修正し、@ts-nocheckを削除
  const indexPath = `${genqlDir}/index.ts`;
  let indexContent = await Deno.readTextFile(indexPath);
  
  // @ts-nocheckを削除（型推論を有効にするため）
  indexContent = indexContent.replace(/^\/\/ @ts-nocheck\s*\n/gm, "");
  
  // インポートパスに拡張子を追加
  indexContent = indexContent
    .replace(/from '\.\/schema'/g, "from './schema.ts'")
    .replace(/from '\.\/types'/g, "from './types.ts'")
    .replace(/from '\.\/runtime'/g, "from './runtime/index.ts'")
    .replace(/from '\.\/runtime'/g, "from './runtime/index.ts'");
  
  await Deno.writeTextFile(indexPath, indexContent);
  console.log("✅ index.tsのインポートパスを修正し、@ts-nocheckを削除しました");
  
  // 他のファイルも確認して修正
  const files = [
    "schema.ts",
    "types.ts",
  ];
  
  for (const file of files) {
    const filePath = `${genqlDir}/${file}`;
    try {
      let content = await Deno.readTextFile(filePath);
      
      // @ts-nocheckを削除（型推論を有効にするため）
      content = content.replace(/^\/\/ @ts-nocheck\s*\n/gm, "");
      
      // インポートパスに拡張子を追加
      content = content
        .replace(/from '\.\/schema'/g, "from './schema.ts'")
        .replace(/from '\.\/types'/g, "from './types.ts'")
        .replace(/from '\.\/runtime'/g, "from './runtime/index.ts'");
      
      await Deno.writeTextFile(filePath, content);
      console.log(`✅ ${file}のインポートパスを修正し、@ts-nocheckを削除しました`);
    } catch {
      // ファイルが存在しない場合はスキップ
    }
  }
  
  // runtimeディレクトリ内のファイルも確認
  const runtimeDir = `${genqlDir}/runtime`;
  try {
    const runtimeFiles = [];
    for await (const entry of Deno.readDir(runtimeDir)) {
      if (entry.isFile && entry.name.endsWith(".ts")) {
        runtimeFiles.push(entry.name);
      }
    }
    
    for (const file of runtimeFiles) {
      const filePath = `${runtimeDir}/${file}`;
      let content = await Deno.readTextFile(filePath);
      
      // @ts-nocheckを削除（型推論を有効にするため）
      content = content.replace(/^\/\/ @ts-nocheck\s*\n/gm, "");
      
      // インポートパスに拡張子を追加
      content = content
        .replace(/from '\.\.\/schema'/g, "from '../schema.ts'")
        .replace(/from '\.\.\/types'/g, "from '../types.ts'")
        .replace(/from '\.\/[^']+'/g, (match) => {
          const path = match.replace(/from '\.\//, '').replace(/'$/, '');
          if (!path.endsWith('.ts') && !path.endsWith('.tsx')) {
            return `from './${path}.ts'`;
          }
          return match;
        });
      
      await Deno.writeTextFile(filePath, content);
      console.log(`✅ runtime/${file}のインポートパスを修正し、@ts-nocheckを削除しました`);
    }
  } catch (error) {
    console.error(`❌ runtimeディレクトリの処理エラー:`, error);
  }
  
  console.log("✅ genqlのインポートパス修正が完了しました");
}

if (import.meta.main) {
  await fixGenQLImports();
}

export { fixGenQLImports };

