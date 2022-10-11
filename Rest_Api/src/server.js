'use strict';

const express = require('express');
const bodyParser = require('body-parser');
var jsonBodyParser = bodyParser.json({ type: 'application/json' });
// Constants
const PORT = 8000;
const HOST = '0.0.0.0';


const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'database',
    database: 'postgres',
    password: 'test',
    port: 5432,
})


// App
const app = express();
var Auth = require('./auth.js')();
app.get('/getUsers', [Auth.checkAuthAdmin, jsonBodyParser], (req, res) => {
    
    pool.query('SELECT id, email, firstname, lastname, street, house_number, postal_code, login_name FROM users', (error, results) => {
        if (error) {
            res.send(401, error);
        }
        const response = JSON.parse(JSON.stringify(results.rows).replace(/\w\:/g, ''));
        res.send(200, response);
    })
    
});

app.get('/getUser/:id', [Auth.checkAuthAdmin, jsonBodyParser], (req, res) => {
    const id = req.params.id;

    pool.query('SELECT id, email, firstname, lastname, street, house_number, postal_code, login_name FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            res.send(401, error);
        }
        const response = JSON.parse(JSON.stringify(results.rows).replace(/\w\:/g, ''));
        res.send(200, response);
    })
    
    
});

app.get('/test/:id', (req, res) => {
    const id = req.params.id;

    pool.query('SELECT id, email, firstname, lastname, street, house_number, postal_code, login_name FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            res.send(401, error);
        }
        const response = JSON.parse(JSON.stringify(results.rows).replace(/\w\:/g, ''));
        res.send(200, response);
    })


});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});