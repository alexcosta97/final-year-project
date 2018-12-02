const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductOrderedSchema = new Schema({
    product:{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: Number
})

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