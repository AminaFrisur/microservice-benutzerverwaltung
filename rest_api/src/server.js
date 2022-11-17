'use strict';

// deleteUser post api -> erstmal nicht nötig -> hoechstens inactive setzen
const express = require('express');
const bodyParser = require('body-parser');
var jsonBodyParser = bodyParser.json({ type: 'application/json' });
const fs = require('fs');
// Constants
const PORT = 8000;
const HOST = '0.0.0.0';

const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'db-benutzerverwaltung1',
    database: 'postgres',
    password: 'test',
    port: 5432,
})

const crypt = require('./compiled_wasm_modules/pkg');
const importObject = {
    imports: {
        encrypt(plain_text_password) {
            console.log(plain_text_password);
        },
        check_password_hash(plain_password, hash) {
            console.log(plain_password, hash);
        }
    },
};

// Quelle: https://nodejs.dev/en/learn/nodejs-with-webassembly/
const importCrypt = async function () {
    const wasmBuffer = fs.readFileSync('./compiled_wasm_modules/crypt.wasm');
    console.log(wasmBuffer);
    const wasmModule = await WebAssembly.instantiate(wasmBuffer, importObject);
    console.log(wasmModule);
    const api = wasmModule.instance.exports;
    console.log(api)
    return api;
}

function checkParams(req, res, requiredParams) {
    console.log("checkParams", requiredParams);
    let paramsToReturn = {};
    for (let i = 0; i < requiredParams.length; i++) {
            let param = requiredParams[i];
            
        if (!(req.query && param in req.query)
            && !(req.body && param in req.body)
            && !(req.params && param in req.params)) {
            let error = "error parameter " + param + " is missing";
            console.log(error);
            throw error;
            return;
        }

        if (req.query && param in req.query) {
            paramsToReturn[param] = req.query[param];
        }
        if (req.body && param in req.body) {
            paramsToReturn[param] = req.body[param];
        }
        if (req.params && param in req.params) {
            paramsToReturn[param] = req.params[param];
        }
    }
    return  paramsToReturn;
}

// App
const app = express();
var Auth = require('./auth.js')();
var jwt = require('jsonwebtoken');

app.get('/getUsers', [Auth.checkAuthAdmin, jsonBodyParser], async function (req, res) {
    
    pool.query('SELECT id, email, firstname, lastname, street, house_number, postal_code, login_name FROM users', (error, results) => {
        if (error) {
            res.send(401).send(error);
            return;
        }
        const response = JSON.parse(JSON.stringify(results.rows).replace(/\w\:/g, ''));
        res.send(200, response);
    })
    
});

app.get('/getUser/:id', [Auth.checkAuthAdmin, jsonBodyParser], async function (req, res) {
    let params = checkParams(req, res, ["id"]);

    pool.query('SELECT id, email, firstname, lastname, street, house_number, postal_code, login_name FROM users WHERE id = $1', [params.id], (error, results) => {
        if (error) {
            res.send(401).send(error);
            return;
        }
        const response = JSON.parse(JSON.stringify(results.rows).replace(/\w\:/g, ''));
        res.send(200).send(response);
    })
});

app.post('/register', [jsonBodyParser], async function (req, res) {

    let params = checkParams(req, res, ["email", "firstname", "lastname", "house_number", "street", "postal_code", "login_name", "password"]);
    
    //encrypt password

    let passwordHash = crypt.encrypt(params.password);

    pool.query(
        'INSERT INTO users(email, firstname, lastname, street, house_number, postal_code, login_name, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [params.email, params.firstname, params.lastname, params.street ,params.house_number, params.postal_code, params.login_name, passwordHash], 
        (error, results) => {
        if (error) {
            res.status(401).send(error);
            return;
        }
        res.status(200).send("User created");
    })
});

app.post('/login', [jsonBodyParser], async function (req, res) {

    let params = checkParams(req, res, ["login_name", "password"]);
    
    pool.query(
        "SELECT password FROM users WHERE login_name = $1",
        [params.login_name],
        async (error, results) => {
            if (error) {
                res.status(401).send(error);
                return;
            }
            if (results.rows.length != 1) {
                res.status(401).send("Login failed");
                return;
            }
            
            let dbPasswordHash = results.rows[0].password;
            let checkPassword = crypt.check_password_hash(params.password, dbPasswordHash);
            if(!checkPassword) {
                res.status(401).send("Login failed");
            } else {
                
                var token = jwt.sign({ login_name: params.login_name }, 'ms_benutzerverwaltung');
                
                pool.query(
                    "UPDATE users SET auth_token = $1, auth_token_timestamp = (SELECT CURRENT_TIMESTAMP) WHERE login_name = $2",
                    [token, params.login_name],
                    async (error, results) => {
                        if (error) {
                            res.status(401).send(error);
                            return;
                        }
                        res.status(200).send({"message": "Login successfull", "auth_token": token});
                    });
            }
        })
    
});

// Gibt Timestamp von übergebenen Token zurück
// Falls Token nicht korrekt oder Falsch -> error
app.post('/checkAuthUser', [jsonBodyParser], async function (req, res) {
    try {
        let params = checkParams(req, res, ["login_name", "auth_token", "isAdmin"]);

    // prüfe ob auth token richtig ist
    // dieser Call wird gebraucht für MS die direkt mit dem User kommunizieren
    // Also für die MS Trip und Buchungsverwaltung wichtig
        let result = await Auth.checkTokenAndGetTimestamp(params.auth_token, params.login_name, params.isAdmin);
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(401).send(error);
    }


});

app.post('/changeUserData', [Auth.checkAuthUser, jsonBodyParser], async function (req, res) {

    let params = checkParams(req, res, ["email", "firstname", "lastname", "house_number", "street", "postal_code", "login_name"]);
    let auth_token = req.headers.auth_token;
    pool.query(
        "UPDATE users SET email = $1, firstname = $2, lastname = $3 , street = $4 , house_number = $5 , postal_code = $6  WHERE login_name= $7 AND auth_token = $8",
        [params.email, params.firstname, params.lastname, params.street ,params.house_number, params.postal_code, params.login_name, auth_token],
        (error, results) => {
            if (error) {
                res.status(401).send(error);
                return;
            }
            res.status(200).send("User updated");
        })
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});