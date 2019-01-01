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

const read = async (req, res) => {
    let supplier;
    try{
        supplier = await Supplier.findOne({_id: req.params.id}).exec();
    } catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!supplier || supplier === null){
        return res.status(404).json({message: 'There was no supplier with the given ID.'});
    }

    res.json(supplier);
};

exports.readAll = readAll;
exports.read = read;