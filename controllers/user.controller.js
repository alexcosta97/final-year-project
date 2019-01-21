const {User, validate} = require('../models/user.model');
const {Company} = require('../models/company.model');
const {Location} = require('../models/location.model');
const Roles = require('../services/roles');

const readAll = async (req, res) => {
    let users;
    try{
        users = await User.find({}).select('-password').exec();
    } catch(err){
        return res.status(409).json({message: 'Something went wrong'});
    }

    res.json(users);
};

const read = async(req, res) => {
    if(req.user.role === Roles.Admin || req.user.id === req.params.id){
        let user;
        try{
            user = await User.findById(req.params.id).select('-password').exec();
        }catch(err){
            return res.status(400).json({message: 'Invalid User ID'});
        }

        if(!user) return res.status(404).json({message: 'There was no user with the given ID.'});
        return res.json(user);
    } else{
        return res.status(401).json({message: `You don't have permissions to access this resource.`});
    }
};

const create = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).json({message: error.details[0].message});
    
    let company = await Company.findById(req.body.company).exec();
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
        locations: locations,
        role: req.body.role
    });

    await user.save();
    let token = user.generateAuthToken();
    resUser = {
        employeeID: user.employeeID,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: {
            _id: company._id,
            name: company.name
        },
        locations: locations,
        role: user.role
    }

    res.set('x-auth-token', token)
    .json(resUser);
};

const update = async (req, res) => {
    if(req.user.role === Roles.Admin || req.user.id === req.params.id){
        let user;
        const {error} = validate(req.body);
        if(error) return res.status(400).json({message: error.details[0].message});

        let company = await Company.findById(req.user.companyId).exec();
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
                locations: locations,
                role: req.body.role
            }, {new: false}).exec();
        }
        catch(err){
            return res.status(418).json({message: `I'm a teapot. Don't ask me to brew coffee.`});
        }

        if(!user) return res.status(404).json({message: 'There was no user with the given ID.'});
        
        res.set('x-auth-token', user.generateAuthToken());

        return res.json({message: 'The operation was successful.'});
    } else{
        return res.status(401).json({message: `You don't have permissions to access this resource.`});
    }
};

const del = async (req, res) => {
    if(req.user.role === Roles.Admin || req.user.id === req.params.id){
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

        return res.json({
            message: 'The operation was successful.'
        });
    } else{
        return res.status(401).json(`You don't have permissions to access this resource.`);
    }
};

exports.readAll = readAll;
exports.read = read;
exports.create = create;
exports.update = update;
exports.del = del;