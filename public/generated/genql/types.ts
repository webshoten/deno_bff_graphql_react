export default {
    "scalars": [
        1,
        2,
        5,
        7
    ],
    "types": {
        "Mutation": {
            "createUser": [
                6,
                {
                    "name": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteUser": [
                6,
                {
                    "id": [
                        2,
                        "ID!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
        "ID": {},
        "Post": {
            "content": [
                1
            ],
            "id": [
                2
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "post": [
                3,
                {
                    "id": [
                        2,
                        "ID!"
                    ]
                }
            ],
            "postCount": [
                5
            ],
            "posts": [
                3
            ],
            "user": [
                6,
                {
                    "id": [
                        2,
                        "ID!"
                    ]
                }
            ],
            "userCount": [
                5
            ],
            "users": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "User": {
            "id": [
                2
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {}
    }
}