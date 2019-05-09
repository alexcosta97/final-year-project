const mongoose = require('mongoose');
const Joi = require('../config/joi');
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    email: {
        type: String,
        minlength: 10,      //setting min length to 10 to make sure the email is valid
        maxlength: 255,
        required: true,
        trim: true
    },
    phone:{
        type: String,
        minlength: 5,
        maxlength: 50,
        required: true
    }
});

const Company = mongoose.model('Company', CompanySchema);

//creating Joi validation for client input
const validateCompany = (company) => {
    //creating a validation schema
    const schema = {
        _id: Joi.objectId(),
        name: Joi.string().min(5).max(255).required(),
        email: Joi.string().min(10).max(255).required().email(),
        phone: Joi.string().min(5).max(50).required(),
        houseNumber: Joi.string().min(1).max(20).required(),
        street: Joi.string().min(3).max(255).required(),
        town: Joi.string().min(3).max(255).required(),
        postCode: Joi.string().min(2).max(20).required(),
        county: Joi.string().min(3).max(255),
        country: Joi.string().min(3).max(255).required()
    }

    return Joi.validate(company, schema);
}

exports.Company = Company;
exports.validate = validateCompany;