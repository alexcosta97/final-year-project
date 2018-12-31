const {Company} = require('../models/company.model');
const Fawn = require('fawn');
const mongoose = require('mongoose');
const Joi = require('../config/joi');

Fawn.init(mongoose);

//Create validation methods


const get = async (req, res) => {
    let company;
    try{
        company = await Company.findOne({_id: req.params.id}).exec();
    } catch(err) {
        return res.status(400).send('Please enter a valid ID');
    }

    if(!company || company === null){
        return res.status(404).send('There was no company with the given ID');
    }

    res.send(company);
};

exports.get = get;