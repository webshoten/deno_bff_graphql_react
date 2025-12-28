import { useEffect } from "react";
import { useTypedMutation, useTypedQuery } from "../utils/genql-urql-bridge.ts";
import type { QueryGenqlSelection } from "../generated/genql/schema.ts";

type UsersQuery = {
  users: {
    id: true;
    name: true;
  };
} & QueryGenqlSelection;

export function UserList() {
  const [result] = useTypedQuery<UsersQuery>({
    query: {
      users: {
        id: true,
        name: true,
        __typename: true,
      },
    },
    requestPolicy: "cache-and-network",
  });

  const [deleteMutationResult, executeDeleteMutation] = useTypedMutation({
    mutation: {
      deleteUser: {
        __args: { id: "" },
        id: true,
        name: true,
      },
    },
  });

  const { data, fetching, error } = result;
  const users = data?.users?.filter((u) => u !== null) ?? [];

  const handleDelete = async (userId: string) => {
    try {
      executeDeleteMutation({ id: userId });
    } catch (err) {
      console.error("ユーザー削除エラー:", err);
      alert("ユーザーの削除に失敗しました");
    }
  };

  return (
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
                <button
                  type="button"
                  onClick={() => handleDelete(user.id ?? "")}
                  disabled={deleteMutationResult.fetching}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="削除"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
