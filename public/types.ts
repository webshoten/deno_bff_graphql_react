// GraphQLスキーマから生成された型定義
// このファイルは src/schema.ts から型情報をインポートして使用

// スキーマから型を再エクスポート（クライアントで使用）
// 注意: 実際の実装では、スキーマから自動生成することを推奨

export type User = {
  id: string;
  name: string;
};

export type Query = {
  users: User[];
  user: User | null;
};

export type QueryUserArgs = {
  id: string;
};

// クエリ名の型
export type QueryName = "users" | "user";

// クエリの引数の型マップ
export type QueryArgsMap = {
  users: never;
  user: QueryUserArgs;
};

// クエリの戻り値の型マップ
export type QueryResultMap = {
  users: User[];
  user: User | null;
};

