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

# Preparation

1. Create a docker network `docker network create analyted_network`
2. Run the [analyted-database-todo](https://github.com/jhderojasUVa/analyted-database-todo) docker image (see their documentation)
3. Run a `docker network inspect analyted_network` and check the IP where `sqltodo` is running
4. Change on the `src/index.js` the ip of the server 
5. Recommended: change your host file to 172.18.0.2 -> 127.0.0.1 if you want to run it directly

# Docker login/build/run/pull

For login into Github repository:

- `npm run docker:login`

For building:

- `npm run docker:build`. To build the latest versions
- `npm run docker:build <version>`. To build the a concrete version

For running:

- `npm run docker:run`. To run the latest versions
- `npm run docker:run <version>`. To run the a concrete version

For pulling (**You need to be logged in and with rights to do it**):

- `npm run docker:pull`. To run the latest versions
- `npm run docker:pull <version>`. To run the a concrete version
