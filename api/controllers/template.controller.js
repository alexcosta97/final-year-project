const {Template, validate} = require('../models/template.model');
const {Location} = require('../models/location.model');
const {Subcategory} = require('../models/subcategory.model');

const readAll = async (req, res) => {
    let templates;
    try{
        templates = await Template.find({}).sort('name').exec();
    }
    catch(err){
        return res.status(409).json({message: 'There was an issue processing your request'});
    }

    res.json(templates);
};

const read = async (req, res) => {
    let template;
    try{
       template = await Template.findOne({_id: req.params.id}).exec();
    } catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!template || template === null){
        return res.status(404).json({message: 'There was no template with the given ID.'});
    }

    return res.json(template);
};

const create = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    

    let locations = [];
    for(i = 0; i < req.body.locations.length; i++){
        let location;
        try{
            location = await Location.findById(req.body.locations[i]).exec();
        }catch(err){
            return res.status(400).json({message: 'Invalid Location'});
        }
        if(!location) return res.status(400).json({message: 'Invalid Location'});
        locations.push({
            _id: location._id,
            name: location.name
        });
    }

    let subcategories = [];
    for(i = 0; i < req.body.subcategories.length; i++){
        let subcategory;
        try{
            subcategory = await Subcategory.findById(req.body.subcategories[i]).exec();
        }catch(err){
            return res.status(400).json({message: 'Invalid Subcategory'});
        }
        if(!subcategory) return res.status(400).json({message: 'Invalid Subcategory'});
        subcategories.push({
            _id: subcategory._id,
            name: subcategory.name,
            category: subcategory.category.name
        });
    }

    let template = new Template({
        name: req.body.name,
        locations: locations,
        subcategories: subcategories,
        orderDays : req.body.orderDays
    });
    await template.save();
    res.json(template);
};

const update = async (req, res) => {
    let template;
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    

    let locations = [];
    for(i = 0; i < req.body.locations.length; i++){
        let location;
        try{
            location = await Location.findById(req.body.locations[i]).exec();
        }catch(err){
            return res.status(400).json({message: 'Invalid Location'});
        }
        if(!location) return res.status(400).json({message: 'Invalid Location'});
        locations.push({
            _id: location._id,
            name: location.name
        });
    }

    let subcategories = [];
    for(i = 0; i < req.body.subcategories.length; i++){
        let subcategory;
        try{
            subcategory = await Subcategory.findById(req.body.subcategories[i]).exec();
        }catch(err){
            return res.status(400).json({message: 'Invalid Subcategory'});
        }
        if(!subcategory) return res.status(400).json({message: 'Invalid Subcategory'});
        subcategories.push({
            _id: subcategory._id,
            name: subcategory.name,
            category: subcategory.category.name
        });
    }

    try{
        template = await Template.findOneAndUpdate({_id: req.params.id}, {
            name: req.body.name,
            locations: locations,
            subcategories: subcategories,
            orderDays: orderDays
        }, {new: false}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!template)
    {
        return res.status(404).json({message: `There was no template with the given ID.`});
    }

    res.json({
        message: 'The operation was successful.'
    });
};

const del = async (req, res) => {
    let template;
    try{
        template = await Template.findOneAndDelete({_id: req.params.id}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!template){
        return res.status(404).json({message: `There was no template with the given ID`});
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