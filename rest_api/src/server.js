'use strict';
// deleteUser post api -> erstmal nicht nötig -> hoechstens inactive setzen
const express = require('express');
const bodyParser = require('body-parser');
var jsonBodyParser = bodyParser.json({ type: 'application/json' });

// beides Konstanten, da innerhalb des Docker Netzwerkes arbeitet
const PORT = 8000;
const HOST = '0.0.0.0';

var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 10000,
    host            : process.env.MYSQL_HOST,
    user            : 'root',
    password        : process.env.MYSQL_ROOT_PASSWORD,
    database        : 'benutzerverwaltung'
});

const middlerwareCheckAuth = (isAdmin, pool) => {
    return (req, res, next) => {
        Auth.checkAuth(req, res, isAdmin, pool, next);
    }
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

// Normalerweise sollte dies beim Starten des MS aus Konfiguration oder einem Netzwerkspeicher geladen werden
const JWT_SECRET = "goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu";

// App
const app = express();
var Auth = require('./auth.js')();
var crypt = require('./crypt.js')();
var jwt = require('jsonwebtoken');

app.get('/getUsers', [middlerwareCheckAuth(true, pool), jsonBodyParser], async function (req, res) {

    try {
        pool.query('SELECT email, firstname, lastname, street, house_number, postal_code, login_name FROM users', (error, results) => {
            if (error) {
                res.status(500).send(error);
                return;
            }
            // const response = JSON.parse(JSON.stringify(results.rows).replace(/\w\:/g, ''));
            res.status(200).send(results);
        })
    } catch (error) {
        console.log(error);
        res.status(401).send(error);
    }
    
});

app.get('/getUser/:loginName', [middlerwareCheckAuth(true, pool), jsonBodyParser], async function (req, res) {

    try {
        let params = checkParams(req, res, ["loginName"]);

        pool.query(`SELECT email, firstname, lastname, street, house_number, postal_code, login_name FROM users WHERE login_name = '${params.loginName}'`, function(error, results) {
            if (error) {
                res.status(500).send(error);
            } else {
                res.status(200).send(results);
            }

        })
    }  catch (error) {
        res.status(401).send(error);
    }

});

app.post('/register', [jsonBodyParser], async function (req, res) {

    try {
        let params = checkParams(req, res, ["email", "firstname", "lastname", "house_number", "street", "postal_code", "login_name", "password"]);

        // hash Password password
        let passwordHash = await crypt.hashPassword(params.password);

        var data  = {"email": params.email, "firstname": params.firstname, "lastname": params.lastname, "street": params.street,
                     "postal_code": params.postal_code, "login_name": params.login_name, "password": passwordHash,
                     "house_number": params.house_number};
        pool.query(
            'INSERT INTO users SET ?',
            data, function(error, results) {
                if (error) {
                    res.status(500).send(error);
                } else {
                    res.status(200).send("User created");
                }

            })
    } catch (error) {
        res.status(401).send(error);
    }

});

app.post('/login', [jsonBodyParser], async function (req, res) {

    try {
        let params = checkParams(req, res, ["login_name", "password"]);

        pool.query(
            `SELECT password, is_admin FROM users WHERE login_name='${params.login_name}' `,
            async (error, results) => {
                if (error) {
                    res.status(500).send(error);
                    return;
                }
                if (results.length != 1) {
                    res.status(401).send("Login failed");
                    return;
                }
                let is_admin = results[0].is_admin;
                let dbPasswordHash = results[0].password;
                let checkPassword = await crypt.checkPasswordHash(params.password, dbPasswordHash);
                if(!checkPassword) {
                    res.status(401).send("Login failed");
                } else {
                    // Erstelle Jason Web Token
                    var token =  jwt.sign({ "login_name": params.login_name, "isAdmin": is_admin }, JWT_SECRET);

                    pool.query(
                        `UPDATE users SET auth_token = '${token}', auth_token_timestamp = (SELECT CURRENT_TIMESTAMP) WHERE login_name = '${params.login_name}'`,
                        async (error, results) => {
                            if (error) {
                                res.status(401).send(error);
                                return;
                            }
                            res.status(200).send({"message": "Login successfull", "auth_token": token});
                        });
                }
            })
    } catch (error) {
        console.log(error);
        res.status(401).send(error);
    }

    
});

app.post('/changeUserData', [middlerwareCheckAuth(false, pool), jsonBodyParser], async function (req, res) {

    try {
        let params = checkParams(req, res, ["email", "firstname", "lastname", "house_number", "street", "postal_code", "login_name"]);
        let auth_token = req.headers.auth_token;

        var data  = {"email": params.email, "firstname": params.firstname, "lastname": params.lastname, "street": params.street,
                    "postal_code": params.postal_code, "house_number": params.house_number};


        pool.query(`UPDATE users SET ?  WHERE login_name='${params.login_name}' AND auth_token = '${auth_token}'`, data,
            function(error, results){
                if (error) {
                    res.status(500).send(error);
                } else {
                    res.status(200).send("User updated");
                }
            })
    } catch (error) {
        res.status(401).send(error);
    }

});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});