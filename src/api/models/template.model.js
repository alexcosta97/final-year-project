const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TemplateSchema = new Schema({
    name:{
        type: String,
        required: 'Please enter a name for the template'
    },
    locations:{
        type: [Schema.Types.ObjectId],
        ref: 'Location'
    },
    subcategories:{
        type: [Schema.Types.ObjectId],
        ref: 'Subcategory'
    },
    orderDays: [Date]
});

mongoose.model('Template', TemplateSchema);