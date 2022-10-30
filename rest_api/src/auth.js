const http = require("http");
module.exports = function() {

    const Pool = require('pg').Pool
    const pool = new Pool({
        user: 'postgres',
        host: 'db-benutzerverwaltung1',
        database: 'postgres',
        password: 'test',
        port: 5432,
    })

    var module = {};

    let sqlAdmin = 'SELECT * FROM users WHERE login_name = $1 AND auth_token = $2 AND  10000000 > (SELECT EXTRACT(EPOCH FROM ((SELECT CURRENT_TIMESTAMP::timestamp) - auth_token_timestamp::timestamp)))';
    let sqlUser = 'SELECT * FROM users WHERE is_admin = TRUE AND login_name = $1 AND auth_token = $2 AND  10000000 > (SELECT EXTRACT(EPOCH FROM ((SELECT CURRENT_TIMESTAMP::timestamp) - auth_token_timestamp::timestamp)))';

    let getAuthTokenTimeStamp = 'SELECT login_name, auth_token, auth_token_timestamp FROM users WHERE login_name = $1 AND auth_token = $2 AND  10000000 > (SELECT EXTRACT(EPOCH FROM ((SELECT CURRENT_TIMESTAMP::timestamp) - auth_token_timestamp::timestamp)))';

    module.checkTokenAndGetTimestamp = async function getAuthTokenAndTimestamp(token, login_name) {
        return new Promise((resolve,reject) => {

            pool.query(getAuthTokenTimeStamp,
                [login_name, token],
                (error, results) => {
                    if (error) {
                        reject(error);
                    }
                    if(results.rows.length != 1) {
                        reject("Token wurde nicht gefunden oder ist nicht mehr valide. Nutzer muss sich neues Token beziehen!");
                    } else {
                        // Token ist korrekt und Timestamp ist noch im validen Zeitbereich
                        console.log(results.rows)
                        resolve(results.rows);
                    }
            })
        })
    }
    
    function unvalidTokenResponse(res) {
        res.status(401).send("token and/or login name are missing or are not valid");
    }

    module.checkAuthUser = function(req, res, next) {
        checkAuth(req, res, sqlUser, next);
    }

    module.checkAuthAdmin = function(req, res, next) {
        checkAuth(req, res, sqlAdmin, next);
    }
    
    function checkAuth(req, res, sql, next) {
        let auth_token = req.headers.auth_token;
        let login_name = req.headers.login_name;
        if(auth_token != null && login_name != null) {
            // check login_name, auth_token and auth_token_timestamp
            pool.query(sql,
                [login_name, auth_token],
                (error, results) => {
                
                if (error) {
                    res.status(401).send(error);
                    return;
                } 
                
                if(results.rows.length != 1) {
                    unvalidTokenResponse(res);
                    return;
                } else {
                    next();
                }
               
            })
        } else {
            unvalidTokenResponse(res);
        }
    }
    return module;
}

