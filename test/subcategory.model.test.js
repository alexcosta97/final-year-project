const {Subcategory, validate} = require('../models/subcategory.model');
const {Company} = require('../models/company.model');
const {Location} = require('../models/location.model');
const {Supplier} = require('../models/supplier.model');
const {Category} = require('../models/category.model');
const {Product} = require('../models/product.model');
const {Template} = require('../models/template.model');
const {Order} = require('../models/order.model');
const {User} = require('../models/user.model');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const config = require('config');

let subcategory;
let input;
let product;
let category;

describe('Subcategory Model', () => {
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
                                    template.save((err, template) => {
                                        product = new Product({
                                            name: 'Product',
                                            price: 10,
                                            quantity: '1*10',
                                            supplierReference: 'SUP-001',
                                            supplier: supplier._id,
                                            category: category._id,
                                            subcategory: subcategory._id
                                        });
                                        product.save((err, product) => {
                                            order = new Order({
                                                location: location._id,
                                                date: Date.now(),
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
                                                        name: 'Subcategory2',
                                                        category: category._id.toString(),
                                                        company: company._id.toString()
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
            input.name = 'bla';
            input.products = [];

            let result = validate(input);
            expect(result.error).to.not.be.null;
        });
    });

    describe('Save', () => {
        it(`should save a category`, (done) => {
            subcategory.save((err, subcategory) => {
                expect(err).to.not.exist;
                expect(subcategory).to.exist;
                expect(subcategory).to.not.be.null;
                done();
            });
        });
    });

    describe('Find', () => {
        it('should throw an error if given the wrong ID', (done) => {
            Subcategory.findOne({_id: 'Hello'}, (err, subcategory) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(subcategory).to.not.exist;
                done();
            });
        });

        it('should send back a subcategory if given the right ID', (done) => {
            Subcategory.findOne({_id: subcategory._id}, (err, subcategory) => {
                expect(err).to.not.exist;
                expect(subcategory).to.exist;
                expect(subcategory).to.not.be.null;
                done();
            });
        });
    });

    describe('Update', () => {
        it(`should update the subcategory if given the right information`, (done) => {
            Subcategory.updateOne({_id: subcategory._id},
                {name: 'SubCatTest'}, (err) => {
                    expect(err).to.not.exist;
                    done();
                });
        });

        it(`shouldn't update the category if given the wrong object id`, (done) => {
            Subcategory.updateOne({_id: 'FakeID'}, {name: 'Subcategory'}, (err) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                done();
            });
        });
    });

    describe('Remove', () => {
        it(`should throw an error if given the wrong object id`, (done) => {
            Subcategory.deleteOne({_id: 'FakeID'}, (err, subcategory) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(subcategory).to.not.exist;
                done();
            });
        });

        it(`should send back the deleted subcategory if given the right id`, (done) => {
            Subcategory.deleteOne({_id: subcategory._id}, (err, subcategory) => {
                expect(err).to.not.exist;
                expect(subcategory).to.exist;
                expect(subcategory).to.not.be.null;
                done();
            });
        });
    });
});