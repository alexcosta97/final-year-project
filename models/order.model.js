const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('../config/joi');

//creating embedded document containing information about product ordered and quantity ordered
const ProductOrderedSchema = new Schema({
    // creating a custom schema for product to reduce info stored in database
    product:{
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        min: 0,
        max: 255,
        required: true
    }
});

const OrderSchema = new Schema({
    //Creating custom schema for location to improve query performance
    location:{
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    date:{
        type: Date,
        required: true,
        default: new Date()
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    productsOrdered:{
        type: [ProductOrderedSchema],
        required: true
    }
});

const Order = mongoose.model('Order', OrderSchema);

//creating Joi validation function that validates client input
const validateOrder = (order) => {
    //creating a schema for product ordered
    const productSchema = Joi.object({
        product: Joi.objectId().required(),
        quantity: Joi.number().min(0).max(255).required()
    }).required();


    //creating a joi-specific validation schema for the data that we expect from the client
    const mainSchema = {
        date: Joi.date().required(),
        location: Joi.objectId().required(),
        supplier: Joi.objectId().required(),
        productsOrdered: Joi.array().items(productSchema).min(1).required()
    };

    return Joi.validate(order, mainSchema);
};

exports.Order = Order;
exports.validate = validateOrder;