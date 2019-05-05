const {Template, validate} = require('../models/template.model');
const {Location} = require('../models/location.model');
const {Company} = require('../models/company.model');
const Roles = require('../services/roles');
const { Supplier } = require('../models/supplier.model');

const readAll = async (req, res) => {
    let locations = [];
    if(req.user.role = Roles.Admin){
        locations = await Location.find({'company': req.user.company}).exec();
    }else locations = req.user.locations;

    let templates = [];
    for(i = 0; i < locations.length; i++){
        let locTemplates = [];
        try{
            locTemplates = await Template.find({'location': locations[i]}).exec();
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
    if(template.company.toString() === req.user.company.toString()) hasAccess = true;

    if(hasAccess){
        return res.json(template);
    }else{
        return res.status(401).json({message: `You don't have permissions to access this resource.`});
    }
};

const create = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    

    let location;
    try{
        location = await Location.findById(req.body.location).exec();
    } catch(err){
        return res.status(400).json({message: 'Invalid Location'});
    }

    let supplier;
    try{
        supplier = await Supplier.findById(req.body.supplier).exec();
    } catch(err){
        return res.status(400).json({message: 'Invalid Supplier'});
    }

    let company = await Company.findById(req.user.company);

    // Creating an array of templates to get all the new templates to save at the same time
    let template;
    try{
        template = new Template({
            name: req.body.name,
            location: location._id,
            company: company._id,
            supplier: supplier._id,
            orderDays: req.body.orderDays
        });
        await template.save();
    } catch(err){
        return res.status(500).json({message: `There was an error processing your request.`});
    }

    return res.json(template);
};

const update = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    
    if(req.user.role !== Roles.Admin){
        let hasAccess = false;
        req.user.locations.forEach(location => {
            if(req.body.location === location) hasAccess = true;
        });

        if(!hasAccess){
            return res.status(401).json({message: `You don't have permission to acccess this data.`});
        }
    }

    let location;
    try{
        location = await Location.findById(req.body.location).exec();
    } catch(err){
        return res.status(400).json({ message: `Invalid Location`});
    }

    let supplier;
    try{
        supplier = await Supplier.findById(req.body.supplier).exec();
    }catch(err){
        return res.status(400).json({
            message: `Invalid Supplier`
        });
    }

    let company = await Company.findById(req.user.company).exec();

    try{
        let template = await Template.findOneAndUpdate({_id: req.params.id}, {
            name: req.body.name,
            location: location._id,
            company: company._id,
            supplier: supplier._id,
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