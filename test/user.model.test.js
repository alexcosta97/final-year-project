const {User, validate} = require('../models/user.model');
const {Company} = require('../models/company.model');
const {Location} = require('../models/location.model');
const {Supplier} = require('../models/supplier.model');
const {Category} = require('../models/category.model');
const {Product} = require('../models/product.model');
const {Subcategory} = require('../models/subcategory.model');
const {Template} = require('../models/template.model');
const {Order} = require('../models/order.model');
const chai = require('chai');
chai.use(require('chai-jwt'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const bcrypt = require('bcrypt');

let user;
let input;
let location;
let company;

describe('Users Model', () => {
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
                                                    password: 'HelloWorld',
                                                    firstName: 'Test',
                                                    lastName: 'User',
                                                    company: company._id.toString(),
                                                    locations: [location._id.toString()],
                                                    role: 'Admin'
                                                });
                                                user.save((err, user) => {
                                                    token = user.generateAuthToken();
                                                    input = {
                                                        email: 'test@mail.com',
                                                        password: 'HelloWorld',
                                                        firstName: 'Name',
                                                        lastName: 'Surname',
                                                        company: company._id.toString(),
                                                        locations: [
                                                            location._id.toString()
                                                        ],
                                                        role: 'Admin'
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
            input.email = 'mail';
            input.password = 'Password';
            input.firstName = 'Oi';
            input.lastName = 'Tu';
            input.companyId = 'Hello';
            input.locations = [];

            let result = validate(input);
            expect(result.error).to.not.be.null;
        });
    });

    describe('Save', () => {
        it(`should save a user`, (done) => {
            user.save(function(err, userDB) {
                expect(err).to.not.exist;
                expect(userDB).to.exist;
                expect(userDB).to.not.be.null;
                done();
            });
        });
    });

    describe('Find', () => {
        it('should throw an error if given the wrong ID', (done) => {
            User.findOne({_id: 'Hello'}, (err, user) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(user).to.not.exist;
                done();
            });
        });

        it('should send back a user if given the right ID', (done) => {
            User.findOne({_id: user._id}, (err, user) => {
                expect(err).to.not.exist;
                expect(user).to.exist;
                expect(user).to.not.be.null;
                done();
            });
        });
    });

    describe('Update', () => {
        it(`should update the user if given the right information`, (done) => {
            User.updateOne({_id: user._id},
                {firstName: 'Testi'}, (err) => {
                    expect(err).to.not.exist;
                    done();
                });
        });

        it(`shouldn't update the user if given the wrong object id`, (done) => {
            User.updateOne({_id: 'FakeID'}, {name: 'User'}, (err) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                done();
            });
        });
    });

    describe('Remove', () => {
        it(`should throw an error if given the wrong object id`, (done) => {
            User.deleteOne({_id: 'FakeID'}, (err, user) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(user).to.not.exist;
                done();
            });
        });

        it(`should send back the deleted user if given the right id`, (done) => {
            User.deleteOne({_id: user._id}, (err, user) => {
                expect(err).to.not.exist;
                expect(user).to.exist;
                expect(user).to.not.be.null;
                done();
            });
        });
    });

    describe('Hash Password', () => {
        it('should generate an hash using 10 rounds', () => {
            const rounds = bcrypt.getRounds(user.password);
            expect(rounds).to.be.equal(10);
        });
    });

    describe('Generate Auth Token', () => {
        it('should generate a token with the user id', () => {
            const token = user.generateAuthToken();
            expect(token).to.be.a.jwt.and.have.claim('sub');
        });
    });

});