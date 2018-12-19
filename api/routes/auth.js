const router = require('express').Router();
const {User} = require('../models/user.model');
const bcrypt = require('bcrypt');
const Joi = require('joi');

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email}).exec();
    if(!user) return res.status(400).send('Invalid email or password');

    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if(!validPassword) return res.status(400).send('Invalid email or password');

    res.send(true);
});

//Creating input validation for authentication
const validate = (req) => {
    //Creating validation schema
    //Password doesn't have min or max length so that no hints are given to the user
    const schema = {
        email: Joi.string().min(10).max(255).required().email(),
        password: Joi.string().required()
    };

    return Joi.validate(req, schema);
};

module.exports = router;