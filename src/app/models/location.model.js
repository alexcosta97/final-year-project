const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Address'
    }
});

mongoose.model('Location', LocationSchema);