import { useTypedQuery } from "../utils/genql-urql-bridge.ts";
import type { QueryGenqlSelection } from "../generated/genql/schema.ts";
import { forwardRef, useImperativeHandle } from "react";

type UserCountQuery = {
  userCount: true;
} & QueryGenqlSelection;

export type UserCountRef = {
  refetch: () => void;
};

export const UserCount = forwardRef<UserCountRef>((_props, ref) => {
  const [countResult, refetchCount] = useTypedQuery<UserCountQuery>({
    query: {
      userCount: true,
    },
    requestPolicy: "cache-and-network",
  });

  // refetchを外部から呼び出せるようにする
  useImperativeHandle(ref, () => ({
    refetch: () => {
      refetchCount({ requestPolicy: "network-only" });
    },
  }));

  const { data: countData, fetching: countFetching, error: countError } =
    countResult;
  const userCount = countData?.userCount ?? 0;

  return (
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
  );
});
