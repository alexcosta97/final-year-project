const config = require('config');
const mongoose = require('mongoose');
const {Company} = require('../models/company.model');
const {Location} = require('../models/location.model');
const {Supplier} = require('../models/supplier.model');
const {Category} = require('../models/category.model');
const {Product} = require('../models/product.model');
const {Subcategory} = require('../models/subcategory.model');
const {Template} = require('../models/template.model');
const {Order} = require('../models/order.model');
const {User} = require('../models/user.model');

let company, location, supplier, category, product, subcategory, template, order, user;
let token;

function initializeDB(done){
    mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
    mongoose.connection.once('open', () => {
        mongoose.connection.dropDatabase(() => {
            company = new Company({
                name: 'Company',
                email: 'company@testco.com',
                phone: '12345'
            });
            company.save((err, company) => {
                location = new Location({
                    name: 'Head Office',
                    phone: company.phone,
                    company: {
                        _id: company._id,
                        name: company.name
                    },
                    address: {
                        houseNumber: '1',
                        street: 'Street',
                        town: 'Town',
                        postCode: 'PC1',
                        country: 'Country'
                    }
                });
                location.save((err, location) => {
                    supplier = new Supplier({
                        name: 'Supplier',
                        phone: '12345',
                        email: 'test@supplier.com'
                    });
                    supplier.save((err, supplier) => {
                        category = new Category({
                            name: 'Category',
                            company: {
                                _id: company._id,
                                name: company.name
                            }
                        });
                        category.save((err, category) => {
                            product = new Product({
                                name: 'Product',
                                price: 10,
                                quantity: '1*10',
                                supplierReference: 'SUP-001',
                                supplier: {
                                    _id: supplier._id,
                                    name: supplier.name
                                }
                            });
                            product.save((err, product) => {
                                subcategory = new Subcategory({
                                    name: 'Subcategory',
                                    company: {
                                        _id: company._id,
                                        name: company.name
                                    },
                                    category: {
                                        _id: category._id,
                                        name: category.name
                                    },
                                    products: [{
                                        _id: product._id,
                                        name: product.name,
                                        supplierName: product.supplier.name,
                                        supplierReference: product.supplierReference
                                    }]
                                });
                                subcategory.save((err, subcategory) => {
                                    template = new Template({
                                        name: 'Template',
                                        location: {
                                            _id: location._id,
                                            name: location.name
                                        },
                                        company:{
                                            _id: company._id,
                                            name: company.name
                                        },
                                        subcategories: [{
                                            _id: subcategory._id,
                                            name: subcategory.name
                                        }],
                                        orderDays: [Date.now()]
                                    });
                                    template.save((err, template) => {
                                        order = new Order({
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
                                            productsOrdered: [{
                                                product: {
                                                    _id: product._id,
                                                    name: product.name,
                                                    price: product.price,
                                                    supplierReference: product.supplierReference
                                                },
                                                quantity: 1
                                            }]
                                        });
                                        order.save((err, order) => {
                                            user = new User({
                                                email: 'testuser@testco.com',
                                                password: 'Password',
                                                firstName: 'Test',
                                                lastName: 'User',
                                                company: {
                                                    _id: company._id,
                                                    name: company.name
                                                },
                                                locations: [{
                                                    _id: location._id,
                                                    name: location.name
                                                }],
                                                role: 'Admin'
                                            });
                                            user.save((err, user) => {
                                                token = user.generateAuthToken();
                                                done();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}