module.exports = function() {

    var module = {};
    function unvalidTokenResponse(res) {
        res.status(401).send("Token wurde nicht gefunden oder ist nicht mehr valide. Nutzer muss sich neues Token beziehen!");
    }
    
    module.checkAuth = function(req, res, isAdmin, pool, next) {
        let auth_token = req.headers.auth_token;
        let login_name = req.headers.login_name;
        if(auth_token != null && login_name != null) {
            // check login_name, auth_token and auth_token_timestamp
            let sqlQuery = "";
            if(isAdmin == true) {
                sqlQuery = ` SELECT * FROM users WHERE login_name = '${login_name}' AND auth_token = '${auth_token}' AND  24 > (SELECT TIMESTAMPDIFF(HOUR, (SELECT CURRENT_TIMESTAMP), auth_token_timestamp )) AND is_admin = TRUE`;
            } else {
                sqlQuery = `SELECT * FROM users WHERE login_name = '${login_name}' AND auth_token = '${auth_token}' AND  24 > (SELECT TIMESTAMPDIFF(HOUR, (SELECT CURRENT_TIMESTAMP), auth_token_timestamp ))`;
            }

            pool.query(sqlQuery,
                function(error, results){
                
                if (error) {
                    res.status(500).send(error);
                    return;
                } 

                if(results.length != 1) {
                    console.log("RESULT IS 0")
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

