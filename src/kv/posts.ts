// PostsのKVS操作

export type Post = {
  id: string;
  title: string;
  content: string;
};

export function getPostRepository(kv: Deno.Kv) {
  const prefix = ["posts"];

  return {
    // 全投稿を取得
    async getAll(): Promise<Post[]> {
      const posts: Post[] = [];
      for await (const entry of kv.list<Post>({ prefix })) {
        posts.push(entry.value);
      }
      return posts;
    },

    // IDで投稿を取得
    async getById(id: string): Promise<Post | null> {
      const key = [...prefix, id];
      const result = await kv.get<Post>(key);
      return result.value;
    },

    // 投稿を作成
    async create(post: Post): Promise<void> {
      const key = [...prefix, post.id];
      await kv.set(key, post);
    },

    // 投稿を更新
    async update(post: Post): Promise<void> {
      const key = [...prefix, post.id];
      await kv.set(key, post);
    },

    // 投稿を削除
    async delete(id: string): Promise<void> {
      const key = [...prefix, id];
      await kv.delete(key);
    },

    // 投稿数を取得
    async count(): Promise<number> {
      let count = 0;
      for await (const _entry of kv.list({ prefix })) {
        count++;
      }
      return count;
    },
  };
}
