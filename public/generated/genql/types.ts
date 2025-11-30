export default {
    "scalars": [
        1,
        3,
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
            "__typename": [
                1
            ]
        },
        "String": {},
        "Post": {
            "content": [
                1
            ],
            "id": [
                3
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "Query": {
            "post": [
                2,
                {
                    "id": [
                        3,
                        "ID!"
                    ]
                }
            ],
            "postCount": [
                5
            ],
            "posts": [
                2
            ],
            "user": [
                6,
                {
                    "id": [
                        3,
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
                3
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