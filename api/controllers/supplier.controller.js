const {Supplier, validate} = require('../models/supplier.model');
const mongoose = require('mongoose');

const readAll = async (req, res) => {
    let suppliers;
    try{
        suppliers = await Supplier.find({}).sort('name').exec();
    }
    catch(err){
        return res.status(409).json({message: 'There was an issue processing your request'});
    }

    res.json(suppliers);
};

exports.readAll = readAll;