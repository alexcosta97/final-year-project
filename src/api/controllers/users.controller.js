const User = require('mongoose').model('User');
const passport = require('@passport-next/passport');

const getErrorMessage = (err) => {
    let message = '';
    if(err.code){
        switch(err.code){
            case 11000:
            case 11001:
            message = 'Email already exists';
            break;
            default:
            message = 'Something went wrong';
        }
    } else{
        for(let errName in err.errors){
            if(err.errors(errName).message) message = err.errors[errName].message;
        }
    }

    return message;
};

exports.signup = (req, res, next) => {
    //If there is no session with a user signed in create a new user
    if(!req.user){
        let user = new User(req.body);
        let message = null;
        
        user.save(function(err){
            if(err) message = getErrorMessage(err);
            return res.redirect('/');
        })
    }
}