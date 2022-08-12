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

```json
{
    "success": true,
    "data": {
            "rows": [
                {
                    "id": "UNIQUE-ID",
                    "description": "Description of the TODO",
                    "completed": 0 || 1,
                    "date": "UTC LONG FORMAT DATE"
                }
            ],
            "rowCount": 0
        }
}
```

## GET /{id}

```json
{
    "success": true,
    "data": {
            "rows": [],
            "rowCount": 0
        }
}
```

## PUT /

