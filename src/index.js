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
        const request = new Request('SELECT id, description, completed, date FROM Todo ORDER BY date DESC', (err, rowCount, rows) => {
            // if error on the query
            if (err) {
                res.json(responses.errorResponse('Error at query'));
            }

            // if not, send everthing to the client
            res.json(responses.basicOkResponse({
                rows,
                rowCount,
            }));
        });
        
        connection.execSql(request);
    });

    app.get('/:id', (req, res) => {
        const request = new Request(`SELECT id, description, completed, date FROM Todo WHERE id="${req.params.id}" ORDER BY date DESC`, (err, rowCount, rows) => {
            // if error on the query
            if (err) {
                res.json(responses.errorResponse('Error at query'));
                return;
            }

            // if not, send everthing to the client
            res.json(responses.basicOkResponse({
                rows,
                rowCount,
            }));
        });
        
        connection.execSql(request);
    });

    app.post('/', (req, res) => {
        const { description, completed } = req.body;
        
        // Basic check
        if (description === undefined || completed === undefined) {
            res.json(responses.errorResponse('Error on JSON data'));
            return;
        }

        const date = Date.now();

        // const rrr = {
        //     id: uuid.v1(),
        //     description,
        //     completed,
        //     date,
        // };

        // console.log(rrr)

        // res.json(responses.basicOkResponse({}));

        const request = new Request(`INSERT INTO Todo (id, description, completed, value) VALUES ("${uuid.v1()}", "${description}", "${completed}", "${date}"`, (err) => {
            if (err) {
                res.json(responses.errorResponse(err));
                return;
            }

            res.json(responses.basicOkResponse());
        });

        connection.execSql(request);
    });

    app.listen(port, () => {
        console.log(`Express server running and listening to port ${port}`);
    });
});

// Do the connection and trigger express server
connection.connect();

