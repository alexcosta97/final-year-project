const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    houseNumber: String,
    street: String,
    town: String,
    postCode: String,
    county: String,
    country: String
});

mongoose.model('Address', AddressSchema);