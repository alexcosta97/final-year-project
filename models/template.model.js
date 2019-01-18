const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('../config/joi');

// creating locations schema for query performance
const LocationSchema = new Schema({
    //No extra validation needed for the properties since they come from the original locations's documents
    name: {
        type: String,
        required: true
    }
});

// creating subcategories custom schema for query performance
// Removing any products information -> That can be retrieved when opening the template inside the client
const SubcategorySchema = new Schema({
    //No need for extra validation since info comes from the original document
    name: {
        type: String,
        required: true
    }
});

const TemplateSchema = new Schema({
    name:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    location:{
        type: LocationSchema,
        required: true
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
    subcategories:{
        type: [SubcategorySchema],
        required: true
    },
    orderDays: {
        type: [Date],
        required: true
    }
});

const Template = mongoose.model('Template', TemplateSchema);

// Defining client input validation method
const validateTemplate = (template) => {
    //Creating the main input schema
    const mainInput = {
        name: Joi.string().min(5).max(255).required(),
        locations: Joi.array().items(Joi.objectId().required()).min(1).required(),
        subcategories: Joi.array().items(Joi.objectId().required()).min(1).required(),
        orderDays: Joi.array().items(Joi.date().required()).min(1).required()
    };

    return Joi.validate(template, mainInput);
};

exports.Template = Template;
exports.validate = validateTemplate;