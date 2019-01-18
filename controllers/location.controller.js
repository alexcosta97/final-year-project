const {Location, validate} = require('../models/location.model');
const {Company} = require('../models/company.model');
const Roles = require('../services/roles');


const readAll = async (req, res) => {
    let locations;
    try{
        locations = await Location.find({'company._id': req.user.company}).sort('name').exec();
    }
    catch(err){
        return res.status(409).json({message: 'There was an issue processing your request'});
    }

    res.json(locations);
};

const read = async (req, res) => {
    let belongsToLocation = false;
    if(req.user.role !== Roles.Admin){
        for(i = 0; i < req.user.locations.length; i++){
            if(req.user.locations[i] === req.params.id) belongsToLocation = true;
        }
    }

    if(req.user.role === Roles.Admin || belongsToLocation){
        let location;
        try{
            location = await Location.findOne({_id: req.params.id}).exec();
        } catch(err){
            return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
        }

        if(!location || location === null){
            return res.status(404).json({message: 'There was no location with the given ID.'});
        }

        return res.json(location);
    } else{
        return res.status(401).json({message: `You don't have permissions to access this location`});
    }
};

const create = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    

    let company;
    try{
        company = await Company.findById(req.user.company);
    }catch(err){
        return res.status(400).json({message: 'Invalid Company'});
    }
    if(!company) return res.status(400).json({message: 'Invalid Company'});

    let location = new Location({
        name: req.body.name,
        phone: req.body.phone,
        fax: req.body.fax,
        company: {
            _id: company._id,
            name: company.name
        },
        email: req.body.email,
        address: {
            houseNumber: req.body.houseNumber,
            street: req.body.street,
            town: req.body.town,
            postCode: req.body.postCode,
            country: req.body.country
        }
    });
    await location.save();
    res.json(location);
};

const update = async (req, res) => {
    let location;
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});

    let company;
    try{
        company = await Company.findById(req.user.company);
    }catch(err){
        return res.status(400).json({message: 'Invalid Company'});
    }

    try{
        location = await Location.findOneAndUpdate({_id: req.params.id, 'company._id': req.user.company}, {
            name: req.body.name,
            phone: req.body.phone,
            fax: req.body.fax,
            company: {
                _id: company._id,
                name: company.name
            },
            email: req.body.email,
            address: {
                houseNumber: req.body.houseNumber,
                street: req.body.street,
                town: req.body.town,
                postCode: req.body.postCode,
                country: req.body.country
            }
        }, {new: false}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!location)
    {
        return res.status(404).json({message: `There was no location with the given ID.`});
    }

    res.json({
        message: 'The operation was successful.'
    });
};

const del = async (req, res) => {
    let location;

    try{
        location = await Location.findOneAndDelete({_id: req.params.id, 'company._id': req.user.company}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!location){
        return res.status(404).json({message: `There was no location with the given ID`});
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