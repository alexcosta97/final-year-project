const {Location, validate} = require('../models/location.model');
const mongoose = require('mongoose');

const readAll = async (req, res) => {
    let locations;
    try{
        locations = await Location.find({}).sort('name').exec();
    }
    catch(err){
        return res.status(409).json({message: 'There was an issue processing your request'});
    }

    res.json(locations);
};

const read = async (req, res) => {
    let location;
    try{
        location = await Location.findOne({_id: req.params.id}).exec();
    } catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!location || location === null){
        return res.status(404).json({message: 'There was no location with the given ID.'});
    }

    res.json(location);
};

exports.readAll = readAll;
exports.read = read;