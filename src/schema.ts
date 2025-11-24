import SchemaBuilder from "@pothos/core";

// シンプルなダミーデータ
const users = [
  { id: "1", name: "Taro" },
  { id: "2", name: "Hanako" }
];

const posts = [
  { id: "1", title: "First Post", content: "This is the first post" },
  { id: "2", title: "Second Post", content: "This is the second post" }
];

const builder = new SchemaBuilder<{}>({});

// User 型参照
const UserRef = builder.objectRef<{ id: string; name: string }>("User");

// User 型
UserRef.implement({
  fields: t => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
  }),
});

// Post 型参照
const PostRef = builder.objectRef<{ id: string; title: string; content: string }>("Post");

// Post 型
PostRef.implement({
  fields: t => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    content: t.exposeString("content"),
  }),
});

// Query 型
builder.queryType({
  fields: t => ({
    users: t.field({
      type: [UserRef],
      resolve: () => users,
    }),
    user: t.field({
      type: UserRef,
      nullable: true,
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: (_, args) =>
        users.find(u => u.id === String(args.id)) ?? null,
    }),
    userCount: t.field({
      type: "Int",
      resolve: () => users.length,
    }),
    posts: t.field({
      type: [PostRef],
      resolve: () => posts,
    }),
    post: t.field({
      type: PostRef,
      nullable: true,
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: (_, args) =>
        posts.find(p => p.id === String(args.id)) ?? null,
    }),
    postCount: t.field({
      type: "Int",
      resolve: () => posts.length,
    }),
  }),
});

export const schema = builder.toSchema({});

// 型定義をエクスポート（クライアントで使用）
export type UserType = {
  id: string;
  name: string;
};

export type QueryType = {
  users: UserType[];
  user: UserType | null;
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
  users: UserType[];
  user: UserType | null;
};