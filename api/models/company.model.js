const mongoose = require('mongoose');
const Joi = require('joi');
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
        name: Joi.string().min(5).max(255).required(),
        email: Joi.string().min(10).max(255).required().email(),
        phone: Joi.string().min(5).max(50).required()
    }

    return Joi.validate(company, schema);
}

exports.Company = Company;
exports.validate = validateCompany;