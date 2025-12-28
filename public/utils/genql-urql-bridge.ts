/**
 * GenQL（selection から GraphQL Operation を生成）と
 * urql（クライアント実行・キャッシュ）を橋渡しするためのユーティリティ。
 *
 * 方針:
 * - フロント側では GenQL の selection で型安全にクエリ/ミューテーション内容を表現
 * - 実行は urql の hook / client を用いて行い、urql のエコシステム（キャッシュ等）を活用
 * - graphql-codegen は使わず、GenQL の生成物のみを依存対象にする
 */

import type { MutationResult, QueryResult } from "../generated/genql/index.ts";
import { generateQueryOp } from "../generated/genql/index.ts";
import type {
  MutationGenqlSelection,
  QueryGenqlSelection,
} from "../generated/genql/schema.ts";
import type { OperationContext } from "urql";
import { useMutation, useQuery } from "urql";
import {
  Args,
  Fields,
  generateGraphqlOperation,
} from "../generated/genql/runtime/generateGraphqlOperation.ts";
import { linkTypeMap } from "../generated/genql/runtime/linkTypeMap.ts";
import types from "../generated/genql/types.ts";

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

const typeMap = linkTypeMap(types as any);

/**
 * useTypedMutation
 *
 * 役割: GenQL の selection から Mutation を実行するためのフック
 */
export function useTypedMutation<Mutation extends MutationGenqlSelection>(
  opts: {
    mutation: Mutation;
    context?: Partial<OperationContext>;
    additionalTypenames?: string[];
  },
) {
  // クエリ文字列を生成（一度だけ）
  const operation = generateGraphqlOperation(
    "mutation",
    typeMap.Mutation!,
    opts.mutation as any,
  );

  // useMutationにはクエリ文字列を直接渡す
  const [result, executeMutation] = useMutation<MutationResult<Mutation>>(
    operation.query,
  );

  const execute = (variables?: Args) => {
    // 変数を再生成して、実行時に渡された値で上書き
    const operationWithVars = generateGraphqlOperation(
      "mutation",
      typeMap.Mutation!,
      opts.mutation as unknown as Fields,
    );

    // 実行時に渡された変数で上書き
    // genqlはv1, v2などの変数名を生成するが、
    // 実行時に渡された変数のキー（例: "name"）を、operation.variablesの値と照合して上書き
    const finalVariables = { ...operationWithVars.variables };

    if (variables && operationWithVars.variables) {
      const varKeys = Object.keys(operationWithVars.variables);
      // operation.variablesの各変数について、実行時に渡された変数と照合
      varKeys.forEach((varKey) => {
        // __argsで指定された引数名を取得（これはmutationの構造から推測する必要がある）
        // 簡易的な実装: mutationの__argsのキーを順番にマッピング
        const mutationKeys = Object.keys(opts.mutation);
        if (mutationKeys.length > 0) {
          const mutationField =
            (opts.mutation as Record<string, unknown>)[mutationKeys[0]];
          if (
            mutationField && typeof mutationField === "object" &&
            "__args" in mutationField && mutationField.__args &&
            typeof mutationField.__args === "object"
          ) {
            const argNames = Object.keys(mutationField.__args);
            const varIndex = varKeys.indexOf(varKey);
            if (varIndex >= 0 && varIndex < argNames.length) {
              const argName = argNames[varIndex];
              if (variables[argName] !== undefined) {
                finalVariables[varKey] = variables[argName];
              }
            }
          }
        }
      });
    }

    // additionalTypenamesをcontextに追加
    const context = {
      ...opts.context,
      ...(opts.additionalTypenames && {
        additionalTypenames: opts.additionalTypenames,
      }),
    };

    return executeMutation(finalVariables, context);
  };

  return [result, execute] as const;
}
