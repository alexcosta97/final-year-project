const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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

// Method that automatically hashes passwords before saving
UserSchema.pre('save', async function(next){
    if(this.password){
        console.log(this.password);
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