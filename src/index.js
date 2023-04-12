// Dot env variables
require('dotenv').config();

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
    server: process.env.NO_DOCKER === 'true' ? 'localhost' : process.env.DB_HOST,
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USERNAME ? process.env.DB_USERNAME : 'sa',
            password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'yourStrong(!)Password',
        }
    },
    options: {
        encrypt: false,
        trustedConnection: true,
        trustServerCertificate: true,
        database: 'ToDos',
    },
};

console.log('=============================================');
console.log('Configuration:');
console.log(config);
console.log('=============================================');


// connect to the database
let connection = undefined;

const getConnection = async () => {
    // check if there's connection
    if (connection) {
        return connection;
    }

    // if not return connection
    return new Connection(config);
}

// http server
let server_on = false;

const express_http_server = () => {
    // Trigger express only if connection is sucessfully
    let connected_db = true;

    connection.on('connect', (err) => {
        if (err) {
            console.log('There was an error connecting to the database!');
            console.log(err);
            connected_db = false;
        }

        // Get all todos
        app.get('/', (req, res) => {
            // Initialice
            var rows = [];
            var rowCount = 0;

            const request = new Request('SELECT id, description, completed, date FROM Todo ORDER BY date DESC', (err, rowNumber) => {
                // if error on the query
                if (err) {
                    res.json(responses.errorResponse('Error at query SELECT ALL'));
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
                const request = new Request(`SELECT id, description, completed, date FROM Todo WHERE id='${req.params.id}'`, (err, rowNumber) => {
                    // if error on the query
                    if (err) {
                        res.json(responses.errorResponse('Error at query SELECT ONE'));
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
                return;
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

        // Health point
        app.get('/health', (req, res) => {
            console.log(`[${currentDate()}]: Hit: Health pointc OK, database check: ${connected_db}`);
            res.json({ health: true, db_connection: connected_db });
            return;
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
                return;
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

                    const request = new Request(`UPDATE Todo SET description = '${description}', completed = ${trueOrfalse[completed]}, date = ${date} WHERE id = '${req.params.id}'`, (err) => {
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
                return;
            }
        });

        app.get('/*', (req, res) => {
            console.log(`[${currentDate()}]: Petition for something we don't need to answer...`);
            return;
        });

        app.listen(port, hostname, () => {
            server_on = true;
            console.log(`Express server running at ${hostname} and listening to port ${port}`);
        });
    });
}

let retry = 0;

setInterval(async () => {
    connection = await getConnection();

    if (connection) {
        if (!server_on) {
            // Do the connection and trigger express server
            console.log('Please wait while we are connecting to the database...');

            connection.connect();

            console.log('== DB Connection done! ==');
            // start express server endpoints
            express_http_server();
        }
    } else {
        if (retry <= 20) {
            // Connection not done, retry
            console.log(`DB Server is OFF, connection in 10 seconds... retry: ${retry++}`);
        } else {
            // Maximun retries
            console.log('Maximum connection retries!... exiting');
            clearInterval();
        }
    }

    connection = undefined;
}, 10 * 1000);
