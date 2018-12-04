const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
    name: String,
    email: {
        type: String,
        required: 'Please enter an email',
        match: [/.+\@.+\..+/, "Please fill a valid e-mail address"]
    },
    phoneNumber:{
        type: String,
        required: 'Please enter a phone number'
    }
});

mongoose.model('Company', CompanySchema);