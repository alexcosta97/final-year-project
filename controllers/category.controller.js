const {Category, validate} = require('../models/category.model');
const {Company} = require('../models/company.model');

const readAll = async (req, res) => {
    let categories;
    try{
        categories = await Category.find({'company': req.user.company}).sort('name').exec();
    }
    catch(err){
        return res.status(409).json({message: 'There was an issue processing your request'});
    }

    res.json(categories);
};

const read = async (req, res) => {
    let category;
    try{
        category = await Category.findOne({_id: req.params.id, 'company': req.user.company}).exec();
    } catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!category || category === null){
        return res.status(404).json({message: 'There was no category with the given ID.'});
    }

    res.json(category);
};

const create = async (req, res) => {
    if(req.body.company === req.user.company){
        const {error} = validate(req.body);
        if(error) return res.status(400).json({message: error.details[0].message});
        

        let company;
        try{
            company = await Company.findById(req.body.company);
        }catch(err){
            return res.status(400).json({message: 'Invalid Company'});
        }
        if(!company) return res.status(400).json({message: 'Invalid Company'});

        let category = new Category({
            name: req.body.name,
            company: company._id
        });
        await category.save();
        return res.json(category);
    } else{
        return res.status(401).json({message: `You don't have permissions to access this resource.`});
    }
};

const update = async (req, res) => {
    if(req.body.company === req.user.company){
        let category;
        const {error} = validate(req.body);
        if(error) {
            console.log(error.details[0].message)
            return res.status(400).json({message: error.details[0].message});
        }

        let company;
        try{
            company = await Company.findById(req.body.company);
        }catch(err){
            console.log(err.message);
            return res.status(400).json({message: 'Invalid Company'});
        }

        try{
            category = await Category.findOneAndUpdate({_id: req.params.id}, {
                name: req.body.name,
                company: company._id
            }, {new: false}).exec();
        }
        catch(err){
            return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
        }

        if(!category)
        {
            return res.status(404).json({message: `There was no category with the given ID.`});
        }

        return res.json({
            message: 'The operation was successful.'
        });
    } else{
        return res.status(401).json(`You don't have permissions to access this resource.`);
    }
};

const del = async (req, res) => {
    let category;

    try{
        category = await Category.findOneAndDelete({_id: req.params.id, 'company': req.user.company}).exec();
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