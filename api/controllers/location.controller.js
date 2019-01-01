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

exports.readAll = readAll;