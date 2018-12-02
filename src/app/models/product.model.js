const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name:{
        type: String,
        required: 'Please enter the name of the product'
    },
    price:{
        type: Number,
        required: 'Please enter an item price'
    },
    quantity:{
        type: String,
        default: '1'
    },
    supplierReference:{
        type: String
    },
    supplier:{
        type: Schema.Types.ObjectId,
        ref: 'Supplier'
    }
});

mongoose.model('Product', ProductSchema);