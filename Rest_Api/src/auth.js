module.exports = function() {

    var module = {};
    
    module.checkAuth = function(req, res, next) {
        var auth_token = req.headers.Authorization;

        var error = function() {
            console.log("no valid auth_token found");
            var result = {
                success : false,
                reason : "not logged in"
            };
            console.log("auth was no success!");
            res.send(401, result);
        }

        if(auth_token != null) {
            next();
        } else {
            next();
        }
    }

    module.checkAuthAdmin = function(req, res, next) {

        var auth_token = req.headers.Authorization;

        var error = function() {
            console.log("no valid auth_token found");
            var result = {
                success : false,
                reason : "not logged in as admin"
            };
            // res.redirect(appconfig.SystemConfig.serverUrl + '/login');
        }

        if(auth_token != null) {
            next();
        } else {
            next();
        }
    }

    return module;

}

