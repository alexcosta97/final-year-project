const {Category, validate} = require('../models/category.model');
const {Company} = require('../models/company.model');

const readAll = async (req, res) => {
    let categories;
    try{
        categories = await Category.find({}).sort('name').exec();
    }
    catch(err){
        return res.status(409).json({message: 'There was an issue processing your request'});
    }

    res.json(categories);
};

const read = async (req, res) => {
    let category;
    try{
        category = await Category.findOne({_id: req.params.id}).exec();
    } catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!category || category === null){
        return res.status(404).json({message: 'There was no category with the given ID.'});
    }

    res.json(category);
};

const create = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    

    let company;
    try{
        company = await Company.findById(req.body.companyId);
    }catch(err){
        return res.status(400).json({message: 'Invalid Company'});
    }
    if(!company) return res.status(400).json({message: 'Invalid Company'});

    let category = new Category({
        name: req.body.name,
        company: {
            _id: company._id,
            name: company.name
        }
    });
    await category.save();
    res.json(category);
};

const update = async (req, res) => {
    let category;
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});

    let company;
    try{
        company = await Company.findById(req.body.companyId);
    }catch(err){
        return res.status(400).json({message: 'Invalid Company'});
    }

    try{
        category = await Category.findOneAndUpdate({_id: req.params.id}, {
            name: req.body.name,
            company: {
                _id: company._id,
                name: company.name
            }
        }, {new: false}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!category)
    {
        return res.status(404).json({message: `There was no category with the given ID.`});
    }

    res.json({
        message: 'The operation was successful.'
    });
};

const del = async (req, res) => {
    let category;

    try{
        category = await Category.findOneAndDelete({_id: req.params.id}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!category){
        return res.status(404).json({message: `There was no category with the given ID`});
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