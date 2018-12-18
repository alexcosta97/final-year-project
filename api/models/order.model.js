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
        required: true
    }
});

const OrderSchema = new Schema({
    location:{
        type: Schema.Types.ObjectId,
        ref: 'Location'
    },
    date:{
        type: Date,
        default: Date.now
    },
    supplier:{
        type: Schema.Types.ObjectId,
        ref: 'Supplier'
    },
    productsOrdered:[ProductOrderedSchema]
});

mongoose.model('Order', OrderSchema);