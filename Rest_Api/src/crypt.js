module.exports = function() {

    var module = {};

    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    
    module.encrypt = async function(planTextPassword) {
        return bcrypt.hash(planTextPassword, saltRounds);
            
    }
    
    module.checkPasswordHash = async function(plainPassword, hash) {
        return bcrypt.compare(plainPassword, hash);
    }

    return module;

}

