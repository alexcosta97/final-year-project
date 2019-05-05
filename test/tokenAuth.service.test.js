const {User} = require('../models/user.model');
const {Company} = require('../models/company.model');
const {Location} = require('../models/location.model');
const {Supplier} = require('../models/supplier.model');
const {Category} = require('../models/category.model');
const {Product} = require('../models/product.model');
const {Subcategory} = require('../models/subcategory.model');
const {Template} = require('../models/template.model');
const {Order} = require('../models/order.model');
const chai = require('chai');
chai.use(require('chai-http'));
chai.use(require('chai-jwt'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {decoder} = require('../services/tokenAuth');

let user;
let token;

describe('Token Authentication', () => {
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
                                                    password: 'Password',
                                                    firstName: 'Test',
                                                    lastName: 'User',
                                                    company: company._id,
                                                    locations: [location._id],
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
        });;
    });

    it(`should decode the token and send an object with the user's id back`, () => {
        let decoded = decoder(token);
        expect(decoded).to.exist;
        expect(decoded).to.not.be.an('error');
        expect(decoded).to.be.an('object');
        expect(decoded).to.have.property('sub', user._id.toString());
    });

    it('should send an error message if the token sent is invalid', () => {
        let error = decoder('fakeToken');
        expect(error).to.exist;
        expect(error).to.be.an('error');
        expect(error).to.have.property('message', 'Invalid Token');
    });
});