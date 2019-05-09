//Require third party modules and classes
const mongoose = require('mongoose');
const Joi = require('../config/joi');
const Schema = mongoose.Schema;

//Creating Mongoose schema and model
const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    //Not requesting all the info from company - just ID
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
});

const Category = mongoose.model('Category', CategorySchema);

//Create Joi validation function that validates client input
const validateCategory = (category) =>{
    //creating a joi-unique validation schema
    const schema = {
        _id: Joi.objectId(),
        company: Joi.objectId().required(),
        name: Joi.string().min(5).max(50).required()
    };

    return Joi.validate(category, schema);
}

//exporting the model and the validation method
exports.Category = Category;
exports.validate = validateCategory;