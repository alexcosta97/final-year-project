const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('../config/joi');;

const SubcategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
        trim: true
    },
    //Saving the company to which a subcategory belongs to make sure that users can only access subcategories of their company
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    category:{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

});

const Subcategory = mongoose.model('Subcategory', SubcategorySchema);

//creating client input validation function
const validateSubcategory = (subcategory) => {

    //creating joi-specific schema to validate the expected client data
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        category: Joi.objectId().required(),
        company: Joi.objectId()
    };

    return Joi.validate(subcategory, schema);
};

exports.Subcategory = Subcategory;
exports.validate = validateSubcategory;