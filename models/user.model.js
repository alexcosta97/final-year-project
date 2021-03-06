const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const Joi = require('../config/joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const Roles = require('../services/roles');

// Add enum for user roles

const UserSchema = new Schema({
    employeeID: {
        type: String,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        unique: true,
        required: true,
        minlength: 10,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        maxlength: 2048
    },
    firstName: {
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true
    },
    lastName: {
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true
    },
    company:{
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    locations: [{
        type: Schema.Types.ObjectId,
        ref: 'Location'
    }],
    role: {
        type: String,
        required: true,
        default: 'User'
    }
});

// Method that automatically hashes passwords before saving
UserSchema.pre('save', async function(next){
    if(this.password){
        this.password = await this.hashPassword(this.password);
    }
    next();
});

UserSchema.pre('update', async function(next){
    if(this.password){
        this.password = await this.hashPassword(this.password);
    }
    next();
});

UserSchema.pre('findOneAndUpdate', async function(next){
    if(this.password){
        this.password = await this.hashPassword(this.password);
    }
    next();
});

UserSchema.pre('updateOne', async function(next){
    if(this.password){
        this.password = await this.hashPassword(this.password);
    }
    next();
});

UserSchema.methods.hashPassword = async function(password){
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

UserSchema.methods.generateAuthToken = function() {
    let locations = [];
    for(i = 0; i < this.locations.length; i++){
        locations.push(this.locations[i]._id);
    }
    return jwt.sign({sub: this._id, role: this.role, company: this.company, locations: locations}, config.get('jwtPrivateKey'));
};

const User = mongoose.model('User', UserSchema);

//Creating client input validation method
const validateUser = (user) => {

    const mainInput = {
        _id: Joi.objectId(),
        employeeID: Joi.string().min(3).max(50),
        email: Joi.string().min(10).max(255).required().email(),
        password: Joi.string().min(8).max(255).required(),
        firstName: Joi.string().min(3).max(255).required(),
        lastName: Joi.string().min(3).max(255).required(),
        company: Joi.objectId().required(),
        locations: Joi.array().items(Joi.objectId()),
        role: Joi.string().valid(Roles.Admin, Roles.User).required()
    };

    return Joi.validate(user, mainInput);
};

//exporting the model and the validation method
exports.User = User;
exports.validate = validateUser;