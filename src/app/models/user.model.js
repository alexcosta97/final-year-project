const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    employeeID: {
        type: Number
    },
    email: {
        type: String,
        required: 'Email is required',
        match: [/.+\@.+\..+/, "Please fill a valid e-mail address"]
    },
    password:{
        type: 'String',
        validate: [function(password){
            return password && password.length > 6;
        }, 'Password should be longer']
    },
    firstName: String,
    lastName: String,
    company:{
        type: Schema.Types.ObjectId,
        ref: 'Company'
    },
    locations: {
        type: [Schema.Types.ObjectId],
        ref: 'Location',
        default: undefined
    }
})

mongoose.model('User', UserSchema);