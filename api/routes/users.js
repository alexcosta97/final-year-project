const router = require('express').Router();
const {User, validate} = require('../models/user.model');
const {Company} = require('../models/company.model');
const {Location} = require('../models/location.model');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const company = await Company.findById(req.body.companyId);
    if(!company) return res.status(400).send('Invalid company');

    const locations = [];
    req.body.locations.foreach(function(item){
        const location = await Location.findById(item);
        if(!location) return res.status(400).send('Invalid location');
        locations.push({
            _id: location._id,
            name: location.name
        });
    });


    let user = await User.findOne({email: req.body.email}).exec();
    if(user) return res.status(400).send('User already registered');

    user = new User({
        employeeID: req.body.employeeID,
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company: {
            _id: company._id,
            name: company.name
        },
        locations: locations
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const resUser = {
        _id: user._id,
        name: user.name,
        email: user.email
    };

    res.send(resUser);
});

module.exports = router;