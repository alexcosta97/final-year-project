const {Company, validate} = require('../models/company.model');
const Fawn = require('fawn');
const mongoose = require('mongoose');
const Joi = require('../config/joi');

Fawn.init(mongoose);

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

const create = async(req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let company = new Company(req.body);
    await company.save();
    res.send(company);
}

const update = async (req, res) => {
    let company
}

exports.get = get;
exports.create = create;
exports.update = update;