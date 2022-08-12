// Simple express server
const express = require('express');
const { Connection, Request } = require('tedious');

// responses
const responses = require('./responses.js');

// uid generator
const uuid = require('uuid');
const { response } = require('express');

// express configuration
const app = express();
const port = 8080;
// use JSON as put format
app.use(express.json());

// Tedious configuration and start up
const config = {
    server: 'localhost',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: 'yourStrong(!)Password',
        }
    },
    options: {
        encrypt: true,
        trustedConnection: true,
        trustServerCertificate: true,
        database: 'ToDos',
    },
};

// connect to the database
const connection = new Connection(config);

// Trigger express only if connection is sucessfully
connection.on('connect', (err) => {
    if (err) {
        console.log('There was an error connecting to the database');
        console.log(err);
        // Health check
        app.get('/health', (req, res) => {
            console.log('Hit: Health point');
            res.json(responses.errorResponse('Unable to connect to databse'));
        });
    } else {
        console.log('Connected to the database successfully!');
        // Health check
        app.get('/health', (req, res) => {
            console.log('Hit: Health point');
            res.json(responses.basicOkResponse);
        });
    }
    
    // Get all todos
    app.get('/', (req, res) => {
        // Initialice
        var rows = [];
        var rowCount = 0;

        const request = new Request('SELECT id, description, completed, date FROM Todo ORDER BY date DESC', (err, rowNumber) => {
            // if error on the query
            if (err) {
                res.json(responses.errorResponse('Error at query'));
            }

            // Set total of rows
            rowCount = rowNumber;
        });

        request.on('row', (data) => {
            rows.push({
                [data[0].metadata.colName]: data[0].value,
                [data[1].metadata.colName]: String(data[1].value).trim(),
                [data[2].metadata.colName]: data[2].value,
                [data[3].metadata.colName]: Number(data[3].value),
            });
        });

        request.on('requestCompleted', () => {
            res.json(responses.basicOkResponse({
                rows,
                rowCount,
            }));
        });
        
        // Execute the SQL
        connection.execSql(request);
    });

    // Get one todo
    app.get('/:id', (req, res) => {
        // Initialice
        var rows = [];
        var rowCount = 0;

        if (req.params.id) {
            // Search for it
            const request = new Request(`SELECT id, description, completed, date FROM Todo WHERE id='${req.params.id}' ORDER BY date DESC`, (err, rowNumber) => {
                // if error on the query
                if (err) {
                    res.json(responses.errorResponse('Error at query'));
                    return;
                }
    
                // if not, send everthing to the client
                rowCount = rowNumber;
            });
    
            request.on('row', (data) => {
                rows.push({
                    [data[0].metadata.colName]: data[0].value,
                    [data[1].metadata.colName]: String(data[1].value).trim(),
                    [data[2].metadata.colName]: data[2].value,
                    [data[3].metadata.colName]: Number(data[3].value),
                });
            });
    
            request.on('requestCompleted', () => {
                res.json(responses.basicOkResponse({
                    rows,
                    rowCount,
                }));
            });
    
            // Execute the SQL
            connection.execSql(request);
        } else {
            res.json(responses.errorResponse('No ID!'));
        }

    });

    // Add a new todo
    app.post('/', (req, res) => {
        const { description, completed } = req.body;
        
        // Basic check
        if (description === undefined || completed === undefined) {
            res.json(responses.errorResponse('Error on JSON data'));
            return;
        }

        // date is always when you do the thing
        const date = Date.now();

        const request = new Request(`INSERT INTO Todo (id, description, completed, date) VALUES ('${uuid.v1()}', '${description}', ${completed}, ${date})`, (err) => {
            if (err) {
                res.json(responses.errorResponse(err));
                return;
            }

            res.json(responses.basicOkResponse());
        });

        connection.execSql(request);
    });

    // Delete a todo
    app.delete('/:id', (req, res) => {
        if (req.params.id) {
            const request = new Request(`DELETE FROM Todo WHERE id='${req.params.id}'`, (err) => {
                if (err) {
                    res.json(responses.errorResponse(err));
                    return;
                }
    
                res.json(responses.basicOkResponse());
            });

            connection.execSql(request);
        } else {
            res.json(responses.errorResponse('No ID!'));
        }
    });

    // Update a todo
    app.put('/:id', (req, res) => {
        if (req.params.id) {
            // decouple body
            const { description, completed } = req.body;

            // check if body has what is needed
            if (description && completed) {
                // date is always when you do the thing
                const date = Date.now();

                const request = new Request(`UPDATE Todo SET description = '${description}', completed = ${completed}, date = ${date} WHERE id = '${req.params.id}'`, (err) => {
                    if (err) {
                        res.json(responses.errorResponse(err));
                        return;
                    }
        
                    res.json(responses.basicOkResponse());
                });
    
                connection.execSql(request);
            } else {
                res.json(responses.errorResponse('Bad body data'));
                return;
            }
        } else {
            res.json(responses.errorResponse('No ID!'));
        }
    });

    app.listen(port, () => {
        console.log(`Express server running and listening to port ${port}`);
    });
});

// Do the connection and trigger express server
console.log('Please wait while we are connecting to the database...');
connection.connect();

