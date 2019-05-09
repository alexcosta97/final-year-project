const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('../config/joi');

const TemplateSchema = new Schema({
    name:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    location:{
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    company:{
        type: Schema.Types.ObjectId,
        ref: 'Company',
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
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
        _id: Joi.objectId(),
        name: Joi.string().min(5).max(255).required(),
        location: Joi.objectId().required(),
        supplier: Joi.objectId().required(),
        company: Joi.objectId(),
        orderDays: Joi.array().items(Joi.date().required()).min(1).required()
    };

    return Joi.validate(template, mainInput);
};

exports.Template = Template;
exports.validate = validateTemplate;