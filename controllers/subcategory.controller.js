const {Subcategory, validate} = require('../models/subcategory.model');
const {Category} = require('../models/category.model');
const {Company} = require('../models/company.model');

const readAll = async (req, res) => {
    let subcategories;
    try{
        //When reading all, the list of categories returned is limited to the ones that belong to the company that the user works for
        subcategories = await Subcategory.find({'company': req.user.company}).sort('name').exec();
    }
    catch(err){
        return res.status(409).json({message: 'There was an issue processing your request'});
    }

    res.json(subcategories);
};

const read = async (req, res) => {
    let subcategory;
    try{
        //When reading a single subcategory, the result is limited not only to the id of the subcategory but also to the company that the user works for to ensure that the user is only accessing data that they have access for
        subcategory = await Subcategory.findOne({_id: req.params.id, 'company': req.user.company}).exec();
    } catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!subcategory || subcategory === null){
        return res.status(404).json({message: 'There was no subcategory with the given ID.'});
    }

    res.json(subcategory);
};

const create = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});

    let category;
    try{
        category = await Category.findById(req.body.category);
    } catch(err){
        return res.status(400).json({message: 'Invalid Category'});
    }
    if(!category) return res.status(400).json({message: 'Invalid Category'});

    //Setting the company for the subcategory automatically based on the user's company
    let company;
    try{
        company = await Company.findOne({_id: req.user.company.toString()});
    } catch(err){
        return res.status(400).json({message: `Invalid Company`});
    }
    if(!company) return res.status(400).json({message: `Invalid Company`});

    let subcategory = new Subcategory({
        name: req.body.name,
        category: category._id,
        company: company._id
    });
    await subcategory.save();
    res.json(subcategory);
};

const update = async (req, res) => {
    let subcategory;
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});

    let category;
    try{
        category = await Category.findById(req.body.category);
    } catch(err){
        return res.status(400).json({message: 'Invalid Category'});
    }
    if(!category) return res.status(400).json({message: 'Invalid Category'});

    //Setting the company for the subcategory automatically based on the user's company
    let company;
    try{
        company = await Company.findOne({_id: req.user.company});
    } catch(err){
        return res.status(400).json({message: `Invalid Company`});
    }
    if(!company) return res.status(400).json({message: `Invalid Company`});

    try{
        //Using the user's company to ensure that the user is accessing the right data
        subcategory = await Subcategory.findOneAndUpdate({_id: req.params.id, 'company': req.user.company}, {
            name: req.body.name,
            category: category._id,
            company: company._id
        }, {new: false}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!subcategory)
    {
        return res.status(404).json({message: `There was no subcategory with the given ID.`});
    }

    res.json({
        message: 'The operation was successful.'
    });
};

const del = async (req, res) => {
    let subcategory;
    try{
        // Using the user's company to make sure that the user is accessing the right data
        subcategory = await Subcategory.findOneAndDelete({_id: req.params.id, 'company': req.user.company}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!subcategory){
        return res.status(404).json({message: `There was no subcategory with the given ID`});
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