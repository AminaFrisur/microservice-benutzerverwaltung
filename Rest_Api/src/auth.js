module.exports = function() {

    const Pool = require('pg').Pool
    const pool = new Pool({
        user: 'postgres',
        host: 'database',
        database: 'postgres',
        password: 'test',
        port: 5432,
    })

    var module = {};
    
    function unvalidTokenResponse(res) {
        res.status(401).send("token and/or login name are missing or are not valid");
    }

    module.checkAuthUser = function(req, res, next) {
        let sql = 'SELECT * FROM users WHERE login_name = $1 AND auth_token = $2 AND  10000000 > (SELECT EXTRACT(EPOCH FROM ((SELECT CURRENT_TIMESTAMP::timestamp) - auth_token_timestamp::timestamp)))';
        checkAuth(req, res, sql, next);
    }

    module.checkAuthAdmin = function(req, res, next) {
        let sql = 'SELECT * FROM users WHERE is_admin = TRUE AND login_name = $1 AND auth_token = $2 AND  10000000 > (SELECT EXTRACT(EPOCH FROM ((SELECT CURRENT_TIMESTAMP::timestamp) - auth_token_timestamp::timestamp)))';
        checkAuth(req, res, sql, next);
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

