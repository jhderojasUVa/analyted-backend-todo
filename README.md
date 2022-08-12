# analyted-backend-todo

Example of a Docker Node application that is an express server connecting to a database and exposing some endpoints for a Todo application.

All responses are JSON based.

# Endpoints

## Any error

```json
{
    "success": false,
    "data": "The error message will be here"
}
```

## GET /

Response:

```json
{
    "success": true,
    "data": {
            "rows": [
                {
                    "id": "UNIQUE-ID",
                    "description": "Description of the TODO",
                    "completed": 0 || 1,
                    "date": "UNIX LONG FORMAT DATE"
                }
            ],
            "rowCount": 0
        }
}
```

Example Response:

```json
{
    "success": true,
    "data": {
        "rows": [
            {
                "id": "9DF788A0-1A29-11ED-8739-679AC04E7140",
                "description": "some text",
                "completed": false,
                "date": 1660300156458
            }
        ],
        "rowCount": 1
    }
}
```

## GET /{id}

The same than the previous but the result will be only one.

Response:

```json
{
    "success": true,
    "data": {
            "rows": [
                {
                    // See previous example
                }
            ],
            "rowCount": 1
        }
}
```

## POST /

Add one new item. Body to send.

Body:

```json
{
    "description": "YOUR DESCRIPTION HERE",
    "completed": 0 || 1
}
```

Response:

```json
{
    "success": true
}
```

## DELETE /:id

Removes a todo from the database by id.

Response:

```json
{
    "success": true
}
```

## PUT /:id

Update a todo on the database by id. It always set the date as the time the petittion is done.

Body:

```json
{
    "description": "YOUR NEW DESCRIPTION HERE",
    "completed": 0 || 1,
}
```

Response:

```json
{
    "success": true
}
```
