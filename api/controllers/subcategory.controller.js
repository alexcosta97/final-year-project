const {Subcategory, validate} = require('../models/subcategory.model');
const {Product} = require('../models/product.model');
const {Category} = require('../models/category.model');

const readAll = async (req, res) => {
    let subcategories;
    try{
        subcategories = await Subcategory.find({}).sort('name').exec();
    }
    catch(err){
        return res.status(409).json({message: 'There was an issue processing your request'});
    }

    res.json(subcategories);
};

const read = async (req, res) => {
    let subcategory;
    try{
        subcategory = await Subcategory.findOne({_id: req.params.id}).exec();
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
    

    let products = [];
    for(i = 0; i < req.body.products.length; i++){
        let product;
        try{
            product = await Product.findById(req.body.products[i]);
        }catch(err){
            return res.status(400).json({message: 'Invalid Product'});
        }
        if(!product) return res.status(400).json({message: 'Invalid Product'});
        products.push({
            _id: product._id,
            name: product.name,
            supplierName: product.supplier.name,
            supplierReference: product.supplierReference
        });
    }

    let category;
    try{
        category = await Category.findById(req.body.category);
    } catch(err){
        return res.status(400).json({message: 'Invalid Category'});
    }
    if(!category) return res.status(400).json({message: 'Invalid Category'});

    let subcategory = new Subcategory({
        name: req.body.name,
        category: {
            _id: category._id,
            name: category.name
        },
        products: products
    });
    await subcategory.save();
    res.json(subcategory);
};

const update = async (req, res) => {
    let subcategory;
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});

    let products = [];
    for(i = 0; i < req.body.products.length; i++){
        let product;
        try{
            product = await Product.findById(req.body.products[i]);
        }catch(err){
            return res.status(400).json({message: 'Invalid Product'});
        }
        if(!product) return res.status(400).json({message: 'Invalid Product'});
        products.push({
            _id: product._id,
            name: product.name,
            supplierName: product.supplier.name,
            supplierReference: product.supplierReference
        });
    }

    let category;
    try{
        category = await Category.findById(req.body.category);
    } catch(err){
        return res.status(400).json({message: 'Invalid Category'});
    }
    if(!category) return res.status(400).json({message: 'Invalid Category'});

    try{
        subcategory = await Subcategory.findOneAndUpdate({_id: req.params.id}, {
            name: req.body.name,
            category: {
                _id: category._id,
                name: category.name
            },
            products: products
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
        subcategory = await Subcategory.findOneAndDelete({_id: req.params.id}).exec();
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