const {Template, validate} = require('../models/template.model');
const {Location} = require('../models/location.model');
const {Subcategory} = require('../models/subcategory.model');
const {Company} = require('../models/company.model');
const Roles = require('../services/roles');

const readAll = async (req, res) => {
    let locations = [];
    if(req.user.role = Roles.Admin){
        locations = await Location.find({'company._id': req.user.company}).exec();
    }else locations = req.user.locations;

    let templates = [];
    for(i = 0; i < locations.length; i++){
        let locTemplates = [];
        try{
            locTemplates = await Template.find({'location._id': locations[i]}).exec();
        }catch(err){
            return res.status(500).json({message: 'There was an issue processing your request.'});
        }
        templates = templates.concat(locTemplates);
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

    let hasAccess = false;
    if(template.company._id.toString() === req.user.company.toString()) hasAccess = true;

    if(hasAccess){
        return res.json(template);
    }else{
        return res.status(401).json({message: `You don't have permissions to access this resource.`});
    }
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

    let company = await Company.findOne({_id: req.user.company});

    // Creating an array of templates to get all the new templates to save at the same time
    let templates = [];
    locations.forEach(location => {
        let template = {
            name: req.body.name,
            location: location,
            company: {
                _id: company._id,
                name: company.name
            },
            subcategories: subcategories,
            orderDays: req.body.orderDays
        };
        templates.push(template);
    });

    try{
        let resTemplates = await Template.create(templates);
        return res.json(resTemplates);
    } catch(err){
        return res.status(500).json({message: `There was an error processing your request`});
    }
};

const update = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    
    let location;
    try{
        location = await Location.findOne({_id: req.body.locations[0]}).select('name').exec();
    }catch(err){
        return res.status(400).json({message: 'Invalid Location'});
    }
    if(!location){
        return res.status(401).json({message: `You don't have permissions to access this resource.`});
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

    let company = Company.findOne({_id: req.user.company});

    try{
        let template = await Template.findOneAndUpdate({_id: req.params.id}, {
            name: req.body.name,
            location: location,
            company: {
                _id: company._id,
                name: company.name
            },
            subcategories: subcategories,
            orderDays: req.body.orderDays
        }, {new: true}).exec();
        if(!template) return res.status(404).json({message: 'There was no template with the given ID.'});
        res.json({
            message: 'The operation was successful.'
        });
    } catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }
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