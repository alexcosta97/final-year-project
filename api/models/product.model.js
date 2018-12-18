const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi')

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
    // Creating a custom schema for supplier for query performance optimization
    supplier:{
        type: new Schema({
            //No extra validation parameters required since the data comes from the original supplier's document
            name: {
                type: String,
                required: true
            }
        }),
        required: true
    }
});

const Product = mongoose.model('Product', ProductSchema);

//Creating Joi validation function
const validateProduct = (product) => {
    //Creating joi-specific schema for client input validation
    const schema = {
        name: Joi.string().min(3).max(255).required(),
        price: Joi.number().min(0).required(),
        quantity: Joi.string().min(1).max(50),
        supplierReference: Joi.string().min(3).max(50).required(),
        supplierId: Joi.objectId().required()
    };

    return Joi.validate(product, schema);
};

exports.Product = Product;
exports.validate = validateProduct;