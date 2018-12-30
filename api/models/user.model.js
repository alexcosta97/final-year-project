const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;
const Joi = require('../config/joi');

// Add enum for user roles

//Creating custom schema for locations for query performance
const LocationSchema = new Schema ({
    //No extra validation needed since information comes from locations' original documents
    name: {
        type: String,
        required: true
    }
});

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
        type: new Schema({
            //No extra validation needed since info comes from company's document
            name: {
                type: String,
                required: true
            }
        })
    },
    locations: {
        type: [LocationSchema],
        required: true
    }
});

const User = mongoose.model('User', UserSchema);

//Creating client input validation method
const validateUser = (user) => {

    const mainInput = {
        employeeID: Joi.string().min(3).max(50),
        email: Joi.string().min(10).max(255).required().email(),
        password: Joi.string().min(8).max(255).required(),
        firstName: Joi.string().min(3).max(255).required(),
        lastName: Joi.string().min(3).max(255).required(),
        companyId: Joi.objectId().required(),
        locations: Joi.array().items(Joi.objectId().required()).min(1)
    };

    return Joi.validate(user, mainInput);
};

//exporting the model and the validation method
exports.User = User;
exports.validate = validateUser;