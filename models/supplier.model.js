const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const SupplierSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 255,
        trim: true
    },
    fax: {
        type: String,
        minlength: 5,
        maxlength: 50
    }
});

const Supplier = mongoose.model('Supplier', SupplierSchema);

//Creating Joi client input validation method
const validateSupplier = (supplier) => {
    //creating joi-specific schema for expected user input
    const schema = {
        _id: Joi.objectId(),
        name: Joi.string().min(5).max(50).required(),
        phone: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(10).max(255).required().email(),
        fax: Joi.string().min(5).max(50)
    };

    return Joi.validate(supplier, schema);
};

exports.Supplier = Supplier;
exports.validate = validateSupplier;