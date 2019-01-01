const {Product, validate} = require('../models/product.model');
const {Supplier} = require('../models/supplier.model');

const readAll = async (req, res) => {
    let products;
    try{
        products = await Product.find({}).sort('name').exec();
    }
    catch(err){
        return res.status(409).json({message: 'There was an issue processing your request'});
    }

    res.json(products);
};

const read = async (req, res) => {
    let product;
    try{
        product = await Product.findOne({_id: req.params.id}).exec();
    } catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!product || product === null){
        return res.status(404).json({message: 'There was no product with the given ID.'});
    }

    res.json(product);
};

const create = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    

    let supplier;
    try{
        supplier = await Supplier.findById(req.body.supplierId);
    }catch(err){
        return res.status(400).json({message: 'Invalid Supplier'});
    }
    if(!supplier) return res.status(400).json({message: 'Invalid Supplier'});

    let product = new Product({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        supplierReference: req.body.supplierReference,
        supplier: {
            _id: supplier._id,
            name: supplier.name
        }
    });
    await product.save();
    res.json(product);
};

const update = async (req, res) => {
    let product;
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});

    let supplier;
    try{
        supplier = await Supplier.findById(req.body.supplierId);
    }catch(err){
        return res.status(400).json({message: 'Invalid Supplier'});
    }

    try{
        product = await Product.findOneAndUpdate({_id: req.params.id}, {
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            supplierReference: req.body.supplierReference,
            supplier: {
                _id: supplier._id,
                name: supplier.name
            }
        }, {new: false}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!product)
    {
        return res.status(404).json({message: `There was no product with the given ID.`});
    }

    res.json({
        message: 'The operation was successful.'
    });
};

const del = async (req, res) => {
    let product;

    try{
        product = await Product.findOneAndDelete({_id: req.params.id}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!product){
        return res.status(404).json({message: `There was no product with the given ID`});
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