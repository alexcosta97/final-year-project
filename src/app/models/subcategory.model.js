const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubcategorySchema = new Schema({
    name: String,
    category:{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company'
    },
    products: {
        type: [Schema.Types.ObjectId],
        ref: 'Product'
    }
});

mongoose.model('Subcategory', SubcategorySchema);