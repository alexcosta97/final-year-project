const {Company} = require('../models/company.model');
const Fawn = require('fawn');
const mongoose = require('mongoose');

Fawn.init(mongoose);

const get = async (req, res) => {
    const company = await Company.findOne({_id: req.params.id}).exec();

    if(!company || company === null){
        return res.status(404).send('There was no company with the given ID');
    }

    res.send(company);
};

exports.get = get;