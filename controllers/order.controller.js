const {Order, validate} = require('../models/order.model');
const {Location} = require('../models/location.model');
const {Supplier} = require('../models/supplier.model');
const {Product} = require('../models/product.model');
const {Company} = require('../models/company.model');
const Roles = require('../services/roles');

const readAll = async (req, res) => {
    let locations = [];
    if(req.user.role === Roles.Admin){
        locations = await Location.find({'company': req.user.company}).exec();
    }else locations = req.user.locations;

    let orders = [];
    for(i = 0; i < locations.length; i++){
        let locOrders;
        try{
            locOrders = await Order.find({'location': locations[i]}).exec();
        } catch(err){
            console.log(err.message);
            return res.status(500).json({message: `There was an error processing your request.`});
        }
        orders = orders.concat(locOrders);
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

    let isUserLocation = false;
    req.user.locations.forEach(location => {
        if(location.toString() === order.location.toString()) isUserLocation = true;
    });
    if(!isUserLocation) return res.status(401).json({message: `You don't have permissions to access this resource.`});

    return res.json(order);
};

const create = async (req, res) => {
    let isUserLocation = false;
    if(req.user.role !== Roles.Admin){
        req.user.locations.forEach(location => {
            if(location === req.body.location) isUserLocation = true;
        });
    }

    if(isUserLocation || req.user.role === Roles.Admin){
        const {error} = validate(req.body);
        if(error) return res.status(400).json({message: error.details[0].message});
        

        let location = await Location.findById(req.body.location);
        if(!location) return res.status(400).json({message: 'Invalid Location'});

        let supplier = await Supplier.findById(req.body.supplier);
        if(!supplier) return res.status(400).json({message: 'Invalid Supplier'});

        let productsOrdered = [];
        for(i = 0; i < req.body.productsOrdered.length; i++){
            let product;
            try{
                product = await Product.findById(req.body.productsOrdered[i].product).exec();
            }catch(err){
                return res.status(400).json({message: 'Invalid Product'});
            }
            if(!product) return res.status(400).json({message: 'Invalid Product'});
            productsOrdered.push({
                product: product._id,
                quantity: req.body.productsOrdered[i].quantity
            });
        }

        let order = new Order({
            location: location._id,
            date: Date.now(),
            supplier: supplier._id,
            productsOrdered : productsOrdered
        });
        await order.save();
        return res.json(order);
    } else return res.status(401).json({message: `You don't have permissions to access this resource.`});
};

const update = async (req, res) => {
    let isUserLocation = false;
    if(req.user.role !== Roles.Admin){
        req.user.locations.forEach(location => {
            if(location === req.body.location) isUserLocation = true;
        });
    }

    if(isUserLocation || req.user.role === Roles.Admin){
        let order;
        const {error} = validate(req.body);
        if(error) return res.status(400).json({message: error.details[0].message});
        

        let location = await Location.findById(req.body.location);
        if(!location) return res.status(400).json({message: 'Invalid Location'});

        let supplier = await Supplier.findById(req.body.supplier);
        if(!supplier) return res.status(400).json({message: 'Invalid Supplier'});

        let productsOrdered = [];
        for(i = 0; i < req.body.productsOrdered.length; i++){
            let product;
            try{
                product = await Product.findById(req.body.productsOrdered[i].product).exec();
            }catch(err){
                return res.status(400).json({message: 'Invalid Product'});
            }
            if(!product) return res.status(400).json({message: 'Invalid Product'});
            productsOrdered.push({
                product: product._id,
                quantity: req.body.productsOrdered[i].quantity
            });
        }

        try{
            order = await Order.findOneAndUpdate({_id: req.params.id}, {
                location: location._id,
                date: Date.now(),
                supplier: supplier._id,
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

        return res.json({
            message: 'The operation was successful.'
        });
    } else res.status(401).json({message: `You don't have permissions to access this resource.`});
};

const del = async (req, res) => {
    let order;
    try{
        order = await Order.findOne({_id: req.params.id});
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!order){
        return res.status(404).json({message: `There was no order with the given ID`});
    }

    let hasAccess = false;
    let location = await Location.findOne({_id: order.location}).exec();
    if(location.company._id.toString() === req.user.company.toString() || req.user.role === roles.Admin) hasAccess = true;

    if(hasAccess){
        try{
            await Order.deleteOne({_id: order._id}).exec();
        } catch(err){
            return res.status(500).json({message: `There was an issue processing your request.`});
        }
        return res.json({message: `The operation was successful.`});
    } else{
        return res.status(401).json({message: `You don't have permisssions to access this resource.`});
    }
};

exports.readAll = readAll;
exports.read = read;
exports.create = create;
exports.update = update;
exports.del = del;