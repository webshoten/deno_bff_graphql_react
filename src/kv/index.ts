// Deno KVの初期化と初期データ投入

import { getUserRepository } from "./users.ts";
import { getPostRepository } from "./posts.ts";

let kv: Deno.Kv | null = null;

// KVストアを取得（シングルトン）
export async function getKv(): Promise<Deno.Kv> {
  if (!kv) {
    kv = await Deno.openKv();
  }
  return kv;
}

// 初期データを投入
export async function initializeData() {
  const kv = await getKv();
  const userRepo = getUserRepository(kv);
  const postRepo = getPostRepository(kv);

  // 既にデータが存在するかチェック
  const existingUsers = await userRepo.getAll();
  if (existingUsers.length > 0) {
    console.log("📦 初期データは既に投入済みです");
    return;
  }

  console.log("📦 初期データを投入中...");

  // Usersの初期データ
  await userRepo.create({ id: "1", name: "Taro" });
  await userRepo.create({ id: "2", name: "Hanako" });
  await userRepo.create({ id: "3", name: "SABURO" });

  // Postsの初期データ
  await postRepo.create({
    id: "1",
    title: "First Post",
    content: "This is the first post",
  });
  await postRepo.create({
    id: "2",
    title: "Second Post",
    content: "This is the second post",
  });

  console.log("✅ 初期データの投入が完了しました");
}
