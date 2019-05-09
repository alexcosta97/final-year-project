const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('../config/joi')

const ProductSchema = new Schema({
    name:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
        trim: true
    },
    price:{
        type: Number,
        required: true,
        min: 0
    },
    quantity:{
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50,
        default: '1'
    },
    supplierReference:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    // Storing only supplier ID here
    supplier:{
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'Subcategory'
    }
});

const Product = mongoose.model('Product', ProductSchema);

//Creating Joi validation function
const validateProduct = (product) => {
    //Creating joi-specific schema for client input validation
    const schema = {
        _id: Joi.objectId(),
        name: Joi.string().min(3).max(255).required(),
        price: Joi.number().min(0).required(),
        quantity: Joi.string().min(1).max(50),
        supplierReference: Joi.string().min(3).max(50).required(),
        supplier: Joi.objectId().required(),
        category: Joi.objectId(),
        subcategory: Joi.objectId()
    };

    return Joi.validate(product, schema);
};

exports.Product = Product;
exports.validate = validateProduct;