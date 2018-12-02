const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: String,
    company:{
        type: Schema.Types.ObjectId,
        ref: 'Company'
    }
});

mongoose.model('Category', CategorySchema);