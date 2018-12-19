const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

//creating embedded document containing information about product ordered and quantity ordered
const ProductOrderedSchema = new Schema({
    // creating a custom schema for product to reduce info stored in database
    product:{
        type: new Schema({
            name:{
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            supplierReference: {
                type: String,
                required: true
            }
        }),
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
        type: new Schema({
            name:{
                type: String,
                required: true
            }
        }),
        required: true
    },
    date:{
        type: Date,
        required: true,
        default: Date.now
    },
    //Creating custom schema for suppler to improve query performance
    supplier:{
        type: new Schema({
            name: {
                type: String,
                required: true
            },
            //No special email validation added since the supplier info is retrieved from the original supplier document in the database, which has already been validated
            email: {
                type: String,
                required: true
            }
        }),
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
        productId: Joi.objectId().required(),
        quantity: Joi.number().min(0).max(255).required()
    }).required();


    //creating a joi-specific validation schema for the data that we expect from the client
    const mainSchema = {
        locationId: Joi.objectId().required(),
        supplierId: Joi.objectId().required(),
        productsOrdered: Joi.array().items(productSchema).min(1).required()
    };

    return Joi.validate(order, mainSchema);
};

exports.Order = Order;
exports.validate = validateOrder;