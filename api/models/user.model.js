const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    employeeID: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        required: 'Email is required',
        match: [/.+\@.+\..+/, "Please fill a valid e-mail address"]
    },
    hashedPassword: String,
    salt: String,
    firstName: String,
    lastName: String,
    company:{
        type: Schema.Types.ObjectId,
        ref: 'Company'
    },
    locations: {
        type: [Schema.Types.ObjectId],
        ref: 'Location',
        default: undefined
    }
});

UserSchema.pre('save', function(next){
    if(this.hashedPassword){
        this.salt = Buffer.from(crypto.randomBytes(16).toString('base64'));
        this.hashedPassword = this.hashPassword(this.hashedPassword);
    }

    next();
});

UserSchema.methods.hashPassword = function(password){
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

UserSchema.methods.authenticate = function(password){
    return this.hashedPassword === this.hashPassword(password);
};

mongoose.model('User', UserSchema);