const {User, validate} = require('../models/user.model');
const {Company} = require('../models/company.model');
const {Location} = require('../models/location.model');

const readAll = async (req, res) => {
    let users;
    try{
        users = await User.find({}).exec();
    } catch(err){
        return res.status(409).json({message: 'Something went wrong'});
    }

    res.json(users);
};

const read = async(req, res) => {
    let user;
    try{
        user = await User.findById(req.params.id).exec();
    }catch(err){
        return res.status(400).json({message: 'Invalid User ID'});
    }

    if(!user) return res.status(404).json({message: 'There was no user with the given ID.'});
    res.json(user);
};

const create = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    
    let company = await Company.findById(req.body.companyId).exec();
    if(!company) return res.status(400).json({message: 'Invalid Company'});

    let locations = [];
    if(req.body.locations){
        for(i = 0; i < req.body.locations.length; i++){
            let location;
            try{
                location = await Location.findById(req.body.locations[i]).exec();
            } catch(err){
                return res.status(400).json({message: 'Invalid Location'});
            }
            if(!location) return res.status(400).json({message: 'Invalid Location'});
            locations.push({
                _id: location._id,
                name: location.name
            });
        }
    }

    let user = new User({
        employeeID: req.body.employeeID,
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company: {
            _id: company._id,
            name: company.name
        },
        locations: locations
    });

    await user.save();
    let token = user.generateAuthToken();
    res.set('x-auth-token', token)
    .json(user);
};

const update = async (req, res) => {
    let user;
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});

    let company = await Company.findById(req.body.companyId).exec();
    if(!company) return res.status(400).json({message: 'Invalid Company'});

    let locations = [];
    if(req.body.locations){
        for(i = 0; i < req.body.locations.length; i++){
            let location;
            try{
                location = await Location.findById(req.body.locations[i]).exec();
            } catch(err){
                return res.status(400).json({message: 'Invalid Location'});
            }
            if(!location) return res.status(400).json({message: 'Invalid Location'});
            locations.push({
                _id: location._id,
                name: location.name
            });
        }
    }

    try{
        user = await User.findOneAndUpdate({_id: req.params.id}, {
            employeeID: req.body.employeeID,
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            company: {
                _id: company._id,
                name: company.name
            },
            locations: locations
        }, {new: false}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!user) return res.status(404).json({message: 'There was no user with the given ID.'});

    if(req.user.id === user._id.toString()) res.set('x-auth-token', user.generateAuthToken());

    res.json({message: 'The operation was successful.'});
};

const del = async (req, res) => {
    let user;
    try{
        user = await User.findOneAndDelete({_id: req.params.id}).exec();
    }
    catch(err){
        return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
    }

    if(!user){
        return res.status(404).json({message: `There was no user with the given ID`});
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