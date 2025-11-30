// UsersのKVS操作

export type User = {
  id: string;
  name: string;
};

export function getUserRepository(kv: Deno.Kv) {
  const prefix = ["users"];

  return {
    // 全ユーザーを取得
    async getAll(): Promise<User[]> {
      const users: User[] = [];
      for await (const entry of kv.list<User>({ prefix })) {
        users.push(entry.value);
      }
      return users;
    },

    // IDでユーザーを取得
    async getById(id: string): Promise<User | null> {
      const key = [...prefix, id];
      const result = await kv.get<User>(key);
      return result.value;
    },

    // ユーザーを作成
    async create(user: User): Promise<void> {
      const key = [...prefix, user.id];
      await kv.set(key, user);
    },

    // ユーザーを更新
    async update(user: User): Promise<void> {
      const key = [...prefix, user.id];
      await kv.set(key, user);
    },

    // ユーザーを削除
    async delete(id: string): Promise<void> {
      const key = [...prefix, id];
      await kv.delete(key);
    },

    // ユーザー数を取得
    async count(): Promise<number> {
      let count = 0;
      for await (const _entry of kv.list({ prefix })) {
        count++;
      }
      return count;
    },
  };
}
