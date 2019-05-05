const {Order, validate} = require('../models/order.model');
const {Company} = require('../models/company.model');
const {Location} = require('../models/location.model');
const {Supplier} = require('../models/supplier.model');
const {Category} = require('../models/category.model');
const {Product} = require('../models/product.model');
const {Subcategory} = require('../models/subcategory.model');
const {Template} = require('../models/template.model');
const {User} = require('../models/user.model');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const config = require('config');

let order;
let input;
let product;
let location;
let supplier;

describe('Orders Model', () => {
    before((done) => {
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
                        company: company._id,
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
                                company: company._id
                            });
                            category.save((err, category) => {
                                subcategory = new Subcategory({
                                    name: 'Subcategory',
                                    company: company._id,
                                    category: category._id
                                });
                                subcategory.save((err, subcategory) => {
                                    template = new Template({
                                        name: 'Template',
                                        location: location._id,
                                        company: company._id,
                                        supplier: supplier._id,
                                        orderDays: [Date.now()]
                                    });
                                    product = new Product({
                                        name: 'Product',
                                        price: 10,
                                        quantity: '1*10',
                                        supplierReference: 'SUP-001',
                                        supplier: supplier._id,
                                        category: category._id,
                                        subcategory: subcategory._id
                                    });
                                    product.save((err, template) => {
                                        template.save((err, template) => {
                                            order = new Order({
                                                location: location._id,
                                                date: new Date().toISOString(),
                                                supplier: supplier._id,
                                                productsOrdered: [{
                                                    product: product._id,
                                                    quantity: 1
                                                }]
                                            });
                                            order.save((err, order) => {
                                                user = new User({
                                                    email: 'testuser@testco.com',
                                                    password: 'Password',
                                                    firstName: 'Test',
                                                    lastName: 'User',
                                                    company: company._id,
                                                    locations: [location._id],
                                                    role: 'Admin'
                                                });
                                                user.save((err, user) => {
                                                    token = user.generateAuthToken();
                                                    input = {
                                                        location: location._id.toString(),
                                                        date: new Date().toISOString(),
                                                        supplier: supplier._id.toString(),
                                                        productsOrdered: [
                                                            {
                                                                product: product._id.toString(),
                                                                quantity: 3
                                                            }
                                                        ]
                                                    };
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
    });

    describe('Validate', () => {
        it('should validate a correct input object', () => {
            let result = validate(input);
            expect(result.error).to.be.null;
            expect(result.value).to.not.be.null;
        });

        it(`shouldn't validate the input if one or more required member(s) are missing`, () => {
            input = {};
            let result = validate(input);
            expect(result.error).to.not.be.null;
        });

        it(`shouldn't validate the input if one or more member(s) don't satisfy the validation criteria`, () => {
            input.productsOrdered = [];
            let result = validate(input);
            expect(result.error).to.not.be.null;
        });
    });

    describe('Save', () => {
        it(`should save an order`, (done) => {
            order.save((err, order) => {
                expect(err).to.not.exist;
                expect(order).to.exist;
                expect(order).to.not.be.null;
                done();
            });
        });
    });

    describe('Find', () => {
        it('should throw an error if given the wrong ID', (done) => {
            Order.findOne({_id: 'Hello'}, (err, order) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(order).to.not.exist;
                done();
            });
        });

        it('should send back an order if given the right ID', (done) => {
            Order.findOne({_id: order._id}, (err, order) => {
                expect(err).to.not.exist;
                expect(order).to.exist;
                expect(order).to.not.be.null;
                done();
            });
        });
    });

    describe('Update', () => {
        it(`should update the order if given the right information`, (done) => {
            Order.updateOne({_id: order._id},
                {name: 'OrderTest'}, (err) => {
                    expect(err).to.not.exist;
                    done();
                });
        });

        it(`shouldn't update the order if given the wrong object id`, (done) => {
            Order.updateOne({_id: 'FakeID'}, {name: 'Order'}, (err) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                done();
            });
        });
    });

    describe('Remove', () => {
        it(`should throw an error if given the wrong object id`, (done) => {
            Order.deleteOne({_id: 'FakeID'}, (err, order) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(order).to.not.exist;
                done();
            });
        });

        it(`should send back the deleted order if given the right id`, (done) => {
            Order.deleteOne({_id: order._id}, (err, order) => {
                expect(err).to.not.exist;
                expect(order).to.exist;
                expect(order).to.not.be.null;
                done();
            });
        });
    });
});