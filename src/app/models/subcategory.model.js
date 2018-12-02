const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubcategorySchema = new Schema({
    name: String,
    category:{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    products: {
        type: [Schema.Types.ObjectId],
        ref: 'Product'
    }
});

mongoose.model('Subcategory', SubcategorySchema);