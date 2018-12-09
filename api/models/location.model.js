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

const LocationSchema = new Schema({
    name:{
        type: String,
        required: 'Please enter a name for the location'
    },
    phone:{
        type: String
    },
    fax:{
        type: String
    },
    company:{
        type: Schema.Types.ObjectId,
        ref: 'Company'
    },
    email: {
        type: String,
        match: [/.+\@.+\..+/, "Please fill a valid e-mail address"]
    },
    address: AddressSchema
});

mongoose.model('Location', LocationSchema);