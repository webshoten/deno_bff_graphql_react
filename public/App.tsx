import { useTypedMutation, useTypedQuery } from "./utils/genql-urql-bridge.ts";
import type { QueryGenqlSelection } from "./generated/genql/schema.ts";
import { useState } from "react";

// クエリの型を定義
type UsersQuery = {
  users: {
    id: true;
    name: true;
  };
} & QueryGenqlSelection;

// userCountクエリの型を定義
type UserCountQuery = {
  userCount: true;
} & QueryGenqlSelection;

function App() {
  const [name, setName] = useState("");

  const [result, refetch] = useTypedQuery<UsersQuery>({
    query: {
      users: {
        id: true,
        name: true,
      },
    },
    requestPolicy: "cache-and-network",
  });

  const [countResult] = useTypedQuery<UserCountQuery>({
    query: {
      userCount: true,
    },
    requestPolicy: "cache-and-network",
  });

  const [mutationResult, executeMutation] = useTypedMutation({
    mutation: {
      createUser: {
        __args: { name: "" },
        id: true,
        name: true,
      },
    },
  });

  const { data, fetching, error } = result;
  const { data: countData, fetching: countFetching, error: countError } =
    countResult;
  const users = data?.users?.filter((u) => u !== null) ?? [];
  const userCount = countData?.userCount ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await executeMutation({ name });
      setName("");
      // ユーザー一覧を再取得
      refetch({ requestPolicy: "network-only" });
    } catch (err) {
      console.error("ユーザー登録エラー:", err);
    }
  };

  return (
    <div>
      <h1>GraphQL API TEST</h1>
      <p>
        GraphQL endpoint: <a href="/graphql">/graphql</a>
      </p>

      <div>
        <h2>ユーザー登録</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ユーザー名を入力"
            style={{ padding: "8px", marginRight: "8px" }}
          />
          <button
            type="submit"
            disabled={mutationResult.fetching || !name.trim()}
            style={{ padding: "8px 16px" }}
          >
            {mutationResult.fetching ? "登録中..." : "登録"}
          </button>
        </form>
        {mutationResult.error && (
          <p style={{ color: "red" }}>
            エラー: {mutationResult.error.message}
          </p>
        )}
        {mutationResult.data && (
          <p style={{ color: "green" }}>
            登録成功: {mutationResult.data.createUser?.name}
          </p>
        )}
      </div>

      <div>
        <h2>ユーザー一覧</h2>
        {fetching
          ? <p>読み込み中...</p>
          : error
          ? <p style={{ color: "red" }}>エラー: {error.message}</p>
          : (
            <ul>
              {users?.map((user) => (
                <li key={user.id}>
                  ID: {user.id}, Name: {user.name}
                </li>
              ))}
            </ul>
          )}
      </div>

      <div>
        <h2>ユーザー数</h2>
        {countFetching
          ? <p>読み込み中...</p>
          : countError
          ? <p style={{ color: "red" }}>エラー: {countError.message}</p>
          : <p>ユーザー数: {userCount}人</p>}
      </div>
    </div>
  );
}

export default App;
