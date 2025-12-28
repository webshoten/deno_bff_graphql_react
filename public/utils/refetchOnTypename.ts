import type { Exchange, Operation, OperationResult } from "urql";

import { pipe, tap } from "wonka";

/**
 * ミューテーション結果から __typename を再帰的に収集
 */
function collectTypenames(node: unknown, out: Set<string>) {
  if (node == null) return;

  if (Array.isArray(node)) {
    for (const v of node) collectTypenames(v, out);
    return;
  }

  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const tn = obj.__typename;

    if (typeof tn === "string") out.add(tn);

    for (const v of Object.values(obj)) collectTypenames(v, out);
  }
}

/**
 * Mutationで実行時Queryを発火するExchange
 * 条件
 *  ・1. 実行済みのQuery
 *  ・2. Mutation実行時に発火対象の型指定 { additionalTypenames: ["MessageAccount(例)"] }
 *  ・3. 上記の型が該当のQueryの__typenameに含まれている
 * 補足
 *  ・graphcacheによるcacheExchangeの場合はadditionalTypenamesを使うことができるがこちらも０件の場合対応不可のためこちら自作した
 */
export const refetchOnTypename: Exchange = ({ forward, client }) => (ops$) => {
  // アクティブなクエリを保持する Map
  const activeQueries = new Map<number, Operation>();

  // ops$ を監視して teardown 時に削除
  // ※ urql では、クエリが不要になったとき（コンポーネントがアンマウントされたときなど）に teardown 操作が発生する
  const results$ = pipe(
    ops$,
    tap((operation: Operation) => {
      if (operation.kind === "teardown") {
        activeQueries.delete(operation.key);
      }
    }),
    forward,
  );

  // results$ を変更せずに処理を行う（非同期に実行）
  return pipe(
    results$,
    tap((result: OperationResult) => {
      // 1. クエリが実行されたら Map に登録
      if (result.operation.kind === "query") {
        activeQueries.set(result.operation.key, result.operation);

        const getQueryName = (op: Operation): string | undefined => {
          const def = op.query.definitions[0];
          if (!def || def.kind !== "OperationDefinition") return undefined;

          // 名前付きクエリの場合
          if (def.name?.value) return def.name.value;

          // 匿名クエリの場合は最初のフィールド名を使用
          const firstSelection = def.selectionSet?.selections?.[0];
          if (firstSelection && firstSelection.kind === "Field") {
            return firstSelection.name.value;
          }

          return undefined;
        };

        const queryName = getQueryName(result.operation);

        console.log("[refetchOnTypename] query added:", {
          key: result.operation.key,
          queryName,
          totalCount: activeQueries.size,
          allQueries: Array.from(activeQueries.values()).map((op) => ({
            key: op.key,
            name: getQueryName(op),
          })),
        });
      }

      // 2. ミューテーションが成功したら再実行を判定
      if (result.operation.kind === "mutation" && !result.error) {
        const ctx = result.operation.context as {
          additionalTypenames?: string[];
        };

        const refetchTypenames = Array.isArray(ctx?.additionalTypenames)
          ? ctx.additionalTypenames
          : [];

        if (refetchTypenames.length > 0) {
          const resultTypenames = new Set<string>();

          // ミューテーション結果から __typename を再帰的に収集(resultTypenamesへ格納)
          collectTypenames(result.data, resultTypenames);

          // 一致したアクティブクエリを再実行
          for (const op of activeQueries.values()) {
            if (refetchTypenames.some((t) => resultTypenames.has(t))) {
              client.reexecuteOperation({
                ...op,
                context: { ...op.context, requestPolicy: "network-only" },
              });
            }
          }
        }
      }
    }),
  );
};
