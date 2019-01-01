const {Company, validate} = require('../models/company.model');
const mongoose = require('mongoose');


const get = async (req, res) => {
    let company;
    try{
        company = await Company.findOne({_id: req.params.id}).exec();
    } catch(err) {
        return res.status(400).json({message: 'Please enter a valid ID'});
    }

    if(!company || company === null){
        return res.status(404).json({message: 'There was no company with the given ID'});
    }

    res.json(company);
};

const create = async(req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});

    let company = new Company(req.body);
    await company.save();
    res.json(company);
}

const update = async (req, res) => {
    let company;
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    try{
        company = await Company.findOneAndUpdate({_id: req.params.id}, req.body, {new: false}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!company)
    {
        return res.status(404).json({message: `There was no company with the given ID`});
    }

    res.json({
        message: 'The operation was successful.'
    });
}

const del = async (req, res) => {
    let company;

    try{
        company = await Company.findOneAndDelete({_id: req.params.id}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!company){
        return res.status(404).json({message: `There was no company with the given ID`});
    }

    res.json({
        message: 'The operation was successful.'
    });
};

exports.get = get;
exports.create = create;
exports.update = update;
exports.del = del;