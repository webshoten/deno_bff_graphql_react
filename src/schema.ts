import SchemaBuilder from "@pothos/core";

// シンプルなダミーデータ
const users = [
  { id: "1", name: "Taro" },
  { id: "2", name: "Hanako" }
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
  }),
});

export const schema = builder.toSchema({});