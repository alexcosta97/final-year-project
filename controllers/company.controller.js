const {Company, validate} = require('../models/company.model');
const {Location} = require('../models/location.model');
const mongoose = require('mongoose');


const get = async (req, res) => {
    if(req.user.company === req.params.id){
        let company;
        try{
            company = await Company.findOne({_id: req.params.id}).exec();
        } catch(err) {
            return res.status(400).json({message: 'Please enter a valid ID'});
        }

        if(!company || company === null){
            return res.status(404).json({message: 'There was no company with the given ID'});
        }

        return res.json(company);
    } else{
        return res.status(401).json({message: `You don't have permissions to access this resource`});
    }
};

const create = async(req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});

    let company = new Company({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    });
    await company.save();

    let headQuarters = new Location({
        name: 'Head Quarters',
        phone: company.phone,
        company: company._id,
        email: company.email,
        address: {
            houseNumber: req.body.houseNumber,
            street: req.body.street,
            town: req.body.town,
            postCode: req.body.postCode,
            county: req.body.county,
            country: req.body.country
        }
    });
    await headQuarters.save();
    res.json({company: company, headQuarters: headQuarters});
}

const update = async (req, res) => {
    if(req.user.company === req.params.id){
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
    } else return res.status(401).json({message: `You don't have permmissions to access this resource.`});
}

const del = async (req, res) => {
    if(req.user.company === req.params.id){
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
    } else return res.status(401).json({message: `You don't have permissions to access this resource.`});
};

exports.get = get;
exports.create = create;
exports.update = update;
exports.del = del;