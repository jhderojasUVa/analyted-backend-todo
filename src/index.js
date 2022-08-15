// Simple express server
const express = require('express');
const { Connection, Request } = require('tedious');

// responses
const responses = require('./responses.js');

// uid generator
const uuid = require('uuid');

// express configuration
const app = express();
const hostname = '0.0.0.0';
const port = 8080;

// database true/false translator
const trueOrfalse = {
    true: 1,
    false: 0,
}

// use JSON as put format
app.use(express.json());

const currentDate = () => {
    return new Date();
}

// Allow any origin
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    next();
});

// Tedious configuration and start up
const config = {
    // server: '172.18.0.2',
    server: 'localhost',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: 'yourStrong(!)Password',
        }
    },
    options: {
        encrypt: false,
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
            console.log(`[${currentDate()}]: Hit: Health point`);
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
            console.log(`[${currentDate()}]: GET /`);
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
                console.log(`GET /${req.params.id}`);
                res.json(responses.basicOkResponse({
                    rows,
                    rowCount,
                }));
            });
    
            console.log(`[${currentDate()}]: GET /${req.params.id}`);
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
        if (description === undefined || ![0, 1].includes(trueOrfalse[completed])) {
            res.json(responses.errorResponse('Error on JSON data'));
            return;
        }

        // date is always when you do the thing
        const date = Date.now();

        const request = new Request(`INSERT INTO Todo (id, description, completed, date) VALUES ('${uuid.v1()}', '${description.trim()}', ${trueOrfalse[completed]}, ${date})`, (err) => {
            if (err) {
                res.json(responses.errorResponse(err));
                return;
            }

            console.log(`[${currentDate()}]: POST /`);
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

            console.log(`[${currentDate()}]: DELETE /${req.params.id}`);
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

            // check if body has what is needed and 
            // translate and check completed
            if (description && [0, 1].includes(trueOrfalse[completed])) {
                // date is always when you do the thing
                const date = Date.now();

                const request = new Request(`UPDATE Todo SET description = '${description}', completed = ${completed}, date = ${date} WHERE id = '${req.params.id}'`, (err) => {
                    if (err) {
                        res.json(responses.errorResponse(err));
                        return;
                    }
        
                    res.json(responses.basicOkResponse());
                });
    
                console.log(`[${currentDate()}]: PUT /${req.params.id}`);
                connection.execSql(request);
            } else {
                res.json(responses.errorResponse('Bad body data'));
                return;
            }
        } else {
            res.json(responses.errorResponse('No ID!'));
        }
    });

    app.listen(port, hostname, () => {
        console.log(`Express server running at ${hostname} and listening to port ${port}`);
    });
});

// Do the connection and trigger express server
console.log('Please wait while we are connecting to the database...');
connection.connect();

