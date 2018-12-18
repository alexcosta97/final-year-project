const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

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
    },
    //Only getting the name of the category that the subcategory belongs to
    category: {
        type: String,
        required: true
    }
})

const TemplateSchema = new Schema({
    name:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    locations:{
        type: [LocationSchema],
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
    //Creating a location item schema
    const locationItem = {
        locationId: Joi.objectId().required()
    };

    //Creating a subcategory item schema
    const subcategoryItem = {
        subcategoryId: Joi.objectId().required()
    };

    //Creating an order day item schema
    const orderDayItem = {
        orderDay: Joi.date().required()
    };

    //Creating the main input schema
    const mainInput = {
        name: Joi.string().min(5).max(255).required(),
        locations: Joi.array().items(locationItem).min(1).required(),
        subcategories: Joi.array().items(subcategoryItem).min(1).required(),
        orderDays: Joi.array().items(orderDayItem).min(1).required()
    };

    return Joi.validate(template, mainInput);
};

exports.Template = Template;
exports.validate = validateTemplate;