'use strict';
// deleteUser post api -> erstmal nicht nötig -> hoechstens inactive setzen
const express = require('express');
const bodyParser = require('body-parser');
var jsonBodyParser = bodyParser.json({ type: 'application/json' });
// Constants
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

function rand() {
    return Math.random().toString(36).substring(2); // remove `0.`
};

function createToken(iterations) {
    var token = "";
    for(let i = 0; i <= iterations; i++) {
        token += rand();
    }
    return token
};

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
var crypt = require('./crypt.js')();

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

        // encrypt password
        let passwordHash = await crypt.encrypt(params.password);

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
                    var token = createToken(10);

                    pool.query(
                        `UPDATE users SET auth_token = '${token}', auth_token_timestamp = (SELECT CURRENT_TIMESTAMP) WHERE login_name = '${params.login_name}'`,
                        async (error, results) => {
                            if (error) {
                                res.status(401).send(error);
                                return;
                            }
                            res.status(200).send({"message": "Login successfull", "auth_token": token, "auth_token_timestamp": Date.now(), "is_admin": is_admin});
                        });
                }
            })
    } catch (error) {
        console.log(error);
        res.status(401).send(error);
    }

    
});

// Gibt Timestamp von übergebenen Token zurück
// Falls Token nicht korrekt oder Falsch -> error
app.post('/checkAuthUser', [jsonBodyParser], async function (req, res) {
    try {
        let params = checkParams(req, res, ["login_name", "auth_token", "isAdmin"]);

    // prüfe ob auth token richtig ist
    // dieser Call wird gebraucht für MS die direkt mit dem User kommunizieren
    // Also für die MS Trip und Buchungsverwaltung wichtig
        let result = await Auth.checkTokenAndGetTimestamp(params.auth_token, params.login_name, params.isAdmin, pool);
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(401).send(error);
    }
});

app.post('/changeUserData', [middlerwareCheckAuth(false, pool), jsonBodyParser], async function (req, res) {

    try {
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
    } catch (error) {
        console.log(error);
        res.status(401).send(error);
    }

});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});