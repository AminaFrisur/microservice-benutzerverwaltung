module.exports = function() {

    var module = {};

    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    
    module.encrypt = async function(planTextPassword) {
        return bcrypt.hash(planTextPassword, saltRounds);
            
    }
    
    module.checkPasswordHash = function(plainPassword, hash) {
        bcrypt.compare(plainPassword, hash, function(err, result) {
            return result;
        });
    }

    return module;

}

