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

const create = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});

    let supplier = new Supplier(req.body);
    await supplier.save();
    res.json(supplier);
};

const update = async (req, res) => {
    let supplier;
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    try{
        supplier = await Supplier.findOneAndUpdate({_id: req.params.id}, req.body, {new: false}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!supplier)
    {
        return res.status(404).json({message: `There was no supplier with the given ID.`});
    }

    res.json({
        message: 'The operation was successful.'
    });
};

const del = async (req, res) => {
    let supplier;

    try{
        supplier = await Supplier.findOneAndDelete({_id: req.params.id}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!supplier){
        return res.status(404).json({message: `There was no supplier with the given ID`});
    }

    res.json({
        message: 'The operation was successful.'
    });
};

exports.readAll = readAll;
exports.read = read;
exports.create = create;
exports.update = update;
exports.del = del;