/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    String: string,
    ID: string,
    Int: number,
    Boolean: boolean,
}

export interface Post {
    content: (Scalars['String'] | null)
    id: (Scalars['ID'] | null)
    title: (Scalars['String'] | null)
    __typename: 'Post'
}

export interface Query {
    posts: (Post[] | null)
    user: (User | null)
    userCount: (Scalars['Int'] | null)
    users: (User[] | null)
    __typename: 'Query'
}

export interface User {
    id: (Scalars['ID'] | null)
    name: (Scalars['String'] | null)
    __typename: 'User'
}

export interface PostGenqlSelection{
    content?: boolean | number
    id?: boolean | number
    title?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    posts?: PostGenqlSelection
    user?: (UserGenqlSelection & { __args: {id: Scalars['ID']} })
    userCount?: boolean | number
    users?: UserGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserGenqlSelection{
    id?: boolean | number
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const Post_possibleTypes: string[] = ['Post']
    export const isPost = (obj?: { __typename?: any } | null): obj is Post => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPost"')
      return Post_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const User_possibleTypes: string[] = ['User']
    export const isUser = (obj?: { __typename?: any } | null): obj is User => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUser"')
      return User_possibleTypes.includes(obj.__typename)
    }
    