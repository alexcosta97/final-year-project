const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('Joi');

//creating custom schema for products' subdocument
const productSchema = new Schema({
    //No need for extra validation since information comes from the original products' document
    name:{
        type: String,
        required: true
    },
    supplierName: {
        type: String,
        required: true
    }
});

const SubcategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
        trim: true
    },
    // Creating custom schema for category to optimize query perormance
    category:{
        type: new Schema({
            //No need for extra validation since information comes from the original category's document
            name: {
                type: String,
                required: true
            }
        }),
        required: true
    },
    //Using custom products' subdocument schema as an array to allow a subcategory to contain multiple products
    products: {
        type: [productSchema],
        required: true
    }
});

const Subcategory = mongoose.model('Subcategory', SubcategorySchema);

//creating client input validation function
const validateSubcategory = (subcategory) => {
    //creating product item schema to use in array
    const productValidationSchema = {
        productId: Joi.objectId().required()
    };

    //creating joi-specific schema to validate the expected client data
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        category: Joi.objectId().required(),
        products: Joi.array().items(productValidationSchema).min(1).required()
    };

    return Joi.validate(subcategory, schema);
};

exports.Subcategory = Subcategory;
exports.validate = validateSubcategory;