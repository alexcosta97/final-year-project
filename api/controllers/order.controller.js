const {Order, validate} = require('../models/order.model');
const {Location} = require('../models/location.model');
const {Supplier} = require('../models/supplier.model');
const {Product} = require('../models/product.model');

const readAll = async (req, res) => {
    let orders;
    try{
        orders = await Order.find({}).sort('name').exec();
    }
    catch(err){
        return res.status(409).json({message: 'There was an issue processing your request'});
    }

    res.json(orders);
};

const read = async (req, res) => {
    let order;
    try{
       order = await Order.findOne({_id: req.params.id}).exec();
    } catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!order || order === null){
        return res.status(404).json({message: 'There was no order with the given ID.'});
    }

    return res.json(order);
};

const create = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    

    let location = await Location.findById(req.body.locationId);
    if(!location) return res.status(400).json({message: 'Invalid Location'});

    let supplier = await Supplier.findById(req.body.supplierId);
    if(!supplier) return res.status(400).json({message: 'Invalid Supplier'});

    let productsOrdered = [];
    for(i = 0; i < req.body.productsOrdered.length; i++){
        let product;
        try{
            product = await Product.findById(req.body.productsOrdered[i].productId).exec();
        }catch(err){
            return res.status(400).json({message: 'Invalid Product'});
        }
        if(!product) return res.status(400).json({message: 'Invalid Product'});
        productsOrdered.push({
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                supplierReference: product.supplierReference
            },
            quantity: req.body.productsOrdered[i].quantity
        });
    }

    let order = new Order({
        location: {
            _id: location._id,
            name: location.name
        },
        date: Date.now(),
        supplier: {
            _id: supplier._id,
            name: supplier.name,
            email: supplier.email
        },
        productsOrdered : productsOrdered
    });
    await order.save();
    res.json(order);
};

const update = async (req, res) => {
    let order;
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    

    let location = await Location.findById(req.body.locationId);
    if(!location) return res.status(400).json({message: 'Invalid Location'});

    let supplier = await Supplier.findById(req.body.supplierId);
    if(!supplier) return res.status(400).json({message: 'Invalid Supplier'});

    let productsOrdered = [];
    for(i = 0; i < req.body.productsOrdered.length; i++){
        let product;
        try{
            product = await Product.findById(req.body.productsOrdered[i].productId).exec();
        }catch(err){
            return res.status(400).json({message: 'Invalid Product'});
        }
        if(!product) return res.status(400).json({message: 'Invalid Product'});
        productsOrdered.push({
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                supplierReference: product.supplierReference
            },
            quantity: req.body.productsOrdered[i].quantity
        });
    }

    try{
        order = await Order.findOneAndUpdate({_id: req.params.id}, {
            location: {
                _id: location._id,
                name: location.name
            },
            date: Date.now(),
            supplier: {
                _id: supplier._id,
                name: supplier.name,
                email: supplier.email
            },
            productsOrdered : productsOrdered
        }, {new: false}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!order)
    {
        return res.status(404).json({message: `There was no order with the given ID.`});
    }

    res.json({
        message: 'The operation was successful.'
    });
};

const del = async (req, res) => {
    let order;
    try{
        order = await Order.findOneAndDelete({_id: req.params.id}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!order){
        return res.status(404).json({message: `There was no order with the given ID`});
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