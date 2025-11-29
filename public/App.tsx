import { useTypedQuery } from "./utils/genql-urql-bridge.ts";
import type { QueryGenqlSelection } from "./generated/genql/schema.ts";

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
  // GenQLとurqlのブリッジを使用して型安全なクエリを実行
  const [result] = useTypedQuery<UsersQuery>({
    query: {
      users: {
        id: true,
        name: true,
      },
    },
    requestPolicy: "cache-and-network",
  });

  // userCountクエリを実行
  const [countResult] = useTypedQuery<UserCountQuery>({
    query: {
      userCount: true,
    },
    requestPolicy: "cache-and-network",
  });

  // result.dataの型は QueryResult<UsersQuery> | undefined になるはず
  const { data, fetching, error } = result;
  const { data: countData, fetching: countFetching, error: countError } =
    countResult;
  const users = data?.users?.filter((u) => u !== null) ?? [];
  const userCount = countData?.userCount ?? 0;

  return (
    <div>
      <h1>GraphQL API</h1>
      <p>
        GraphQL endpoint: <a href="/graphql">/graphql</a>
      </p>

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
