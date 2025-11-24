/**
 * GenQL（selection から GraphQL Operation を生成）と
 * urql（クライアント実行・キャッシュ）を橋渡しするためのユーティリティ。
 * 
 * 方針:
 * - フロント側では GenQL の selection で型安全にクエリ/ミューテーション内容を表現
 * - 実行は urql の hook / client を用いて行い、urql のエコシステム（キャッシュ等）を活用
 * - graphql-codegen は使わず、GenQL の生成物のみを依存対象にする
 */

import type {
  QueryResult,
} from "../generated/genql/index.ts";
import { generateQueryOp } from "../generated/genql/index.ts";
import type { QueryGenqlSelection } from "../generated/genql/schema.ts";
import type { OperationContext } from "urql";
import { useQuery, useClient } from "urql";

type RequestPolicy =
  | "cache-first"
  | "cache-only"
  | "network-only"
  | "cache-and-network";

/**
 * useTypedQuery
 * 
 * 役割: GenQL の selection（どのフィールドを取得し、どの引数を渡すか）から
 * 実行可能な { query, variables } を生成し、そのまま urql の useQuery に渡す。
 * 
 * 効果: selection による型安全と、urql のキャッシュ/ポリシーを同時に活用できる。
 */
export function useTypedQuery<Query extends QueryGenqlSelection>(opts: {
  query: Query;
  pause?: boolean;
  requestPolicy?: RequestPolicy;
  context?: Partial<OperationContext>;
}) {
  const { query, variables } = generateQueryOp(opts.query);

  return useQuery<QueryResult<Query>>({
    ...opts,
    query,
    variables,
  });
}

/**
 * executeTypedQuery
 * 
 * 役割: フックを使わない（関数的な）単発実行ユーティリティ。
 * 使い所: ハンドラ内で 1 回だけ実行したい場合など。
 */
export async function executeTypedQuery<Query extends QueryGenqlSelection>(
  client: ReturnType<typeof useClient>,
  query: Query,
  opts?: Partial<OperationContext>
) {
  const { query: queryString, variables } = generateQueryOp(query);
  
  const result = await client.query(queryString, variables || {}, opts).toPromise();
  
  if (result.error) {
    throw result.error;
  }
  
  return result.data as QueryResult<Query> | undefined;
}

// 注意: 現在のスキーマにはMutationが定義されていないため、
// Mutation関連の関数はスキーマにMutationが追加された後に実装します。

