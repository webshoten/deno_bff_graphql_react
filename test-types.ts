// 型推論の調査用テストファイル

import type { QueryResult } from "./public/generated/genql/index.ts";
import type { QueryGenqlSelection } from "./public/generated/genql/schema.ts";
import type { UseQueryResponse } from "urql";

// クエリの型を定義
type UsersQuery = {
  users: {
    id: true;
    name: true;
  };
} & QueryGenqlSelection;

// 1. QueryResult型の確認
type TestQueryResult = QueryResult<UsersQuery>;
// 型を確認: TestQueryResult['users']が正しく推論されるか

// 2. useQueryの戻り値の型を確認
// urqlのuseQueryは UseQueryResponse<T> を返す
// Tは QueryResult<UsersQuery> になるはず

// 3. 実際の型を確認するための変数
const testQueryResult: TestQueryResult = {} as any;
const testUsers = testQueryResult.users;
// testUsersの型を確認

// 4. UseQueryResponseの型を確認
type TestUseQueryResponse = UseQueryResponse<TestQueryResult>;
const testResponse: TestUseQueryResponse = {} as any;
const testData = testResponse.data;
// testDataの型を確認

export type {
  TestQueryResult,
  TestUseQueryResponse,
  UsersQuery,
};

