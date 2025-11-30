import SchemaBuilder from "@pothos/core";
import { getKv } from "../kv/index.ts";
import { getUserRepository, type User } from "../kv/users.ts";
import { getPostRepository } from "../kv/posts.ts";

const builder = new SchemaBuilder<{}>({});

// User 型参照
const UserRef = builder.objectRef<{ id: string; name: string }>("User");

// User 型
UserRef.implement({
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
  }),
});

// Post 型参照
const PostRef = builder.objectRef<
  { id: string; title: string; content: string }
>("Post");

// Post 型
PostRef.implement({
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    content: t.exposeString("content"),
  }),
});

// Query 型
builder.queryType({
  fields: (t) => ({
    users: t.field({
      type: [UserRef],
      resolve: async () => {
        const kv = await getKv();
        const userRepo = getUserRepository(kv);
        return await userRepo.getAll();
      },
    }),
    user: t.field({
      type: UserRef,
      nullable: true,
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (_, args) => {
        const kv = await getKv();
        const userRepo = getUserRepository(kv);
        return await userRepo.getById(String(args.id));
      },
    }),
    userCount: t.field({
      type: "Int",
      resolve: async () => {
        const kv = await getKv();
        const userRepo = getUserRepository(kv);
        return await userRepo.count();
      },
    }),
    posts: t.field({
      type: [PostRef],
      resolve: async () => {
        const kv = await getKv();
        const postRepo = getPostRepository(kv);
        return await postRepo.getAll();
      },
    }),
    post: t.field({
      type: PostRef,
      nullable: true,
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (_, args) => {
        const kv = await getKv();
        const postRepo = getPostRepository(kv);
        return await postRepo.getById(String(args.id));
      },
    }),
    postCount: t.field({
      type: "Int",
      resolve: async () => {
        const kv = await getKv();
        const postRepo = getPostRepository(kv);
        return await postRepo.count();
      },
    }),
  }),
});

// Mutation 型
builder.mutationType({
  fields: (t) => ({
    createUser: t.field({
      type: UserRef,
      args: {
        name: t.arg.string({ required: true }),
      },
      resolve: async (_, args) => {
        const kv = await getKv();
        const userRepo = getUserRepository(kv);

        // IDを生成（既存の最大ID + 1）
        const existingUsers = await userRepo.getAll();
        let maxId = 0;
        for (const user of existingUsers) {
          const userId = parseInt(user.id, 10);
          if (!isNaN(userId) && userId > maxId) {
            maxId = userId;
          }
        }
        const id = (maxId + 1).toString();

        const user: User = {
          id,
          name: args.name,
        };

        await userRepo.create(user);
        return user;
      },
    }),
    deleteUser: t.field({
      type: UserRef,
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (_, args) => {
        const kv = await getKv();
        const userRepo = getUserRepository(kv);

        const user = await userRepo.getById(String(args.id));
        if (!user) {
          throw new Error(`User with id ${args.id} not found`);
        }

        await userRepo.delete(String(args.id));
        return user;
      },
    }),
  }),
});

export const schema = builder.toSchema({});

// 型定義をエクスポート（クライアントで使用）
export type UserType = User;

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
