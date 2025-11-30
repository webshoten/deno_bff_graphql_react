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

  const [result] = useTypedQuery<UsersQuery>({
    query: {
      users: {
        id: true,
        name: true,
      },
    },
    requestPolicy: "cache-and-network",
  });

  const [countResult, refetchCount] = useTypedQuery<UserCountQuery>({
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
      // additionalTypenamesでUser型に関連するクエリが自動的に再取得される
      // userCountはUser型を直接返さないため、手動で再取得
      refetchCount({ requestPolicy: "network-only" });
    } catch (err) {
      console.error("ユーザー登録エラー:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GraphQL API Test
          </h1>
          <p className="text-sm text-gray-600">
            GraphQL endpoint:{" "}
            <a
              href="/graphql"
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              /graphql
            </a>
          </p>
        </div>

        {/* User Registration Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ユーザー登録
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ユーザー名を入力"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                disabled={mutationResult.fetching}
              />
              <button
                type="submit"
                disabled={mutationResult.fetching || !name.trim()}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mutationResult.fetching ? "登録中..." : "登録"}
              </button>
            </div>
            {mutationResult.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  エラー: {mutationResult.error.message}
                </p>
              </div>
            )}
            {mutationResult.data && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  登録成功: {mutationResult.data.createUser?.name}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* User Count Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ユーザー数
          </h2>
          {countFetching
            ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900">
                </div>
                <p className="text-gray-600">読み込み中...</p>
              </div>
            )
            : countError
            ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  エラー: {countError.message}
                </p>
              </div>
            )
            : (
              <p className="text-2xl font-bold text-gray-900">
                {userCount}人
              </p>
            )}
        </div>

        {/* User List Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ユーザー一覧
          </h2>
          {fetching
            ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900">
                </div>
                <p className="text-gray-600">読み込み中...</p>
              </div>
            )
            : error
            ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">エラー: {error.message}</p>
              </div>
            )
            : users.length === 0
            ? (
              <p className="text-gray-500 text-center py-8">
                ユーザーが登録されていません
              </p>
            )
            : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.name?.charAt(0).toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;
