const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

//creating embedded address schema
const addressSchema = new Schema({
    houseNumber: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 20
    },
    street: {
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true
    },
    town: {
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true
    },
    postCode: {
        type: String,
        minlength: 2,
        maxlength: 20,
        required: true
    },
    county: {
        type: String,
        minlength: 3,
        maxlength: 255
    },
    country: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255
    }
});

// creating location schema with embedded schema inside
const LocationSchema = new Schema({
    name:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    phone:{
        type: String,
        minlength: 5,
        maxlength: 50,
        required: true
    },
    fax:{
        type: String,
        minlength: 5,
        maxlength: 50
    },
    company:{
        type: new Schema({
            name:{
                type: String,
                required: true
            }
        }),
        required: true
    },
    email: {
        type: String,
        minlength: 10,
        maxlength: 255,
        trim: true
    },
    address:{
        type: addressSchema,
        required: true
    }
});

const Location = mongoose.model('Location', LocationSchema);

// creating Joi validation function for client input
const validateLocation = (location) => {
    //creating joi-specific validation schema
    const schema = {
        name: Joi.string().min(3).max(50).required(),
        phone: Joi.string().min(5).max(50).required(),
        fax: Joi.string().min(5).max(50),
        companyId: Joi.objectId().required(),
        email: Joi.string().min(10).max(255).required().email(),
        houseNumber: Joi.string().min(1).max(20).required(),
        street: Joi.string().min(3).max(255).required(),
        town: Joi.string().min(3).max(255).required(),
        postCode: Joi.string().min(2).max(20).required(),
        county: Joi.string().min(3).max(255),
        country: Joi.string().min(3).max(255).required()
    };

    return Joi.validate(location, schema);
};

//exporting the model and the validation method
exports.Location = Location;
exports.validate = validateLocation;