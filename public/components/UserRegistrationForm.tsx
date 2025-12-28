import { useState } from "react";
import { useTypedMutation } from "../utils/genql-urql-bridge.ts";

export function UserRegistrationForm() {
  const [name, setName] = useState("");

  const [mutationResult, executeMutation] = useTypedMutation(
    {
      mutation: {
        createUser: {
          __args: { name: "" },
          id: true,
          name: true,
        },
      },
      additionalTypenames: ["User"],
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      executeMutation(
        { name },
      );
      setName("");
    } catch (err) {
      console.error("ユーザー登録エラー:", err);
    }
  };

  return (
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
      </form>
    </div>
  );
}
